"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RepoHeader from "@/components/RepoHeader";
import RepoTree from "@/components/RepoTree";
import FileViewer from "@/components/FileViewer";
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
    <main 
      style={{ 
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 8, flexShrink: 0 }}>
          <h1 style={{ 
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            {title}
          </h1>
          <a 
            href="/"
            style={{
              textDecoration: "none",
              color: "#94a3b8",
              fontSize: 15,
              fontWeight: 500,
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#cbd5e1"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
          >
            ← Home
          </a>
        </div>

        {err && (
          <div 
            style={{
              marginTop: 16,
              padding: 16,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 12,
              color: "#fca5a5",
              flexShrink: 0
            }}
          >
            ⚠️ {err}
          </div>
        )}

        {meta && <RepoHeader meta={meta} refName={ref} />}

        {truncated && (
          <div 
            style={{
              marginTop: 16,
              padding: 14,
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              borderRadius: 12,
              color: "#fbbf24",
              flexShrink: 0
            }}
          >
            ⚠️ Repository tree was truncated by GitHub due to size.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16, marginTop: 16, flex: 1, overflow: "hidden" }}>
          <section 
            style={{
              background: "rgba(17, 24, 39, 0.6)",
              backdropFilter: "blur(12px)",
              borderRadius: 16,
              padding: 16,
              overflowY: "auto",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
            }}
          >
            <RepoTree owner={owner} repo={repo} refName={ref} nodes={nodes} onSelectFile={setSelectedPath} />
          </section>

          <section 
            style={{
              overflowY: "auto"
            }}
          >
            {!selectedPath ? (
              <div 
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(17, 24, 39, 0.4)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 16,
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  color: "#94a3b8",
                  fontSize: 15
                }}
              >
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                  <div>Select a file from the tree to view its contents</div>
                </div>
              </div>
            ) : loadingFile ? (
              <div 
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(17, 24, 39, 0.4)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 16,
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  color: "#94a3b8",
                  fontSize: 15
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
                  <div>Loading file...</div>
                </div>
              </div>
            ) : fileError ? (
              <div 
                style={{
                  padding: 20,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 16,
                  color: "#fca5a5"
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
                <div>Error: {fileError}</div>
              </div>
            ) : file ? (
              <FileViewer file={file} />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
