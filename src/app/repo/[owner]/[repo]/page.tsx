"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RepoHeader from "@/components/RepoHeader";
import RepoTree from "@/components/RepoTree";
import type { FileData, RepoMeta, TreeNode } from "@/lib/types";

export default function RepoPage({
  params,
  searchParams,
}: {
  params: { owner: string; repo: string };
  searchParams: { ref?: string };
}) {
  const { owner, repo } = params;
  const ref = searchParams.ref || "HEAD";
  const queryParams = useSearchParams();
  const router = useRouter();

  const [meta, setMeta] = useState<RepoMeta | null>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(() => queryParams.get("path"));
  const [file, setFile] = useState<FileData | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null);

    Promise.all([
      fetch(`/api/repo/meta?owner=${owner}&repo=${repo}`).then((r) => r.json()),
      fetch(`/api/repo/tree?owner=${owner}&repo=${repo}&ref=${encodeURIComponent(ref)}`).then((r) =>
        r.json()
      ),
    ])
      .then(([m, t]) => {
        if (cancelled) return;
        if (m.error) throw new Error(m.error);
        if (t.error) throw new Error(t.error);
        setMeta(m);
        setNodes(t.nodes || []);
        setTruncated(Boolean(t.truncated));
      })
      .catch((e) => !cancelled && setErr(e.message || "Failed to load"));

    return () => {
      cancelled = true;
    };
  }, [owner, repo, ref]);

  useEffect(() => {
    if (!selectedPath) {
      setFile(null);
      setFileError(null);
      router.replace(`/repo/${owner}/${repo}?ref=${encodeURIComponent(ref)}`);
      return;
    }

    router.replace(`/repo/${owner}/${repo}?ref=${encodeURIComponent(ref)}&path=${encodeURIComponent(selectedPath)}`);
  }, [selectedPath, owner, repo, ref, router]);

  useEffect(() => {
    if (!selectedPath) {
      setFile(null);
      setFileError(null);
      return;
    }

    let cancelled = false;
    setLoadingFile(true);
    setFileError(null);

    fetch(
      `/api/repo/file?owner=${owner}&repo=${repo}&ref=${encodeURIComponent(ref)}&path=${encodeURIComponent(selectedPath)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setFile(data);
        setLoadingFile(false);
      })
      .catch((e) => {
        if (!cancelled) {
          setFileError(e.message || "Failed to load file");
          setLoadingFile(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPath, owner, repo, ref]);

  const title = useMemo(() => `${owner}/${repo}`, [owner, repo]);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>
        <a href="/" style={{ opacity: 0.85, textDecoration: "none" }}>← Home</a>
      </div>

      {err && (
        <div style={{ marginTop: 12, padding: 12, background: "#2a0f14", borderRadius: 10 }}>
          {err}
        </div>
      )}

      {meta && <RepoHeader meta={meta} refName={ref} />}

      {truncated && (
        <div style={{ marginTop: 12, padding: 10, background: "#1c2230", borderRadius: 10, opacity: 0.9 }}>
          Repo tree was truncated by GitHub for size. Consider implementing “load-on-expand”.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 12, marginTop: 12 }}>
        <section style={{ background: "#111827", borderRadius: 12, padding: 10, minHeight: 520 }}>
          <RepoTree owner={owner} repo={repo} refName={ref} nodes={nodes} onSelectFile={setSelectedPath} />
        </section>

        <section style={{ background: "#111827", borderRadius: 12, padding: 16, minHeight: 520 }}>
          {!selectedPath ? (
            <div style={{ opacity: 0.85 }}>Select a file from the tree.</div>
          ) : loadingFile ? (
            <div style={{ opacity: 0.85 }}>Loading…</div>
          ) : fileError ? (
            <div style={{ color: "#fca5a5" }}>Error: {fileError}</div>
          ) : file ? (
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
                {file.path}
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  background: "#0f1626",
                  borderRadius: 8,
                  fontSize: 12,
                  overflow: "auto",
                  maxHeight: 480,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                <code>{file.content}</code>
              </pre>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
