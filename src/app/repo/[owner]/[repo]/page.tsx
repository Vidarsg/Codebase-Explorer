"use client";

import { useEffect, useMemo, useState } from "react";
import RepoHeader from "@/components/RepoHeader";
import RepoTree from "@/components/RepoTree";
import type { RepoMeta, TreeNode } from "@/lib/types";

export default function RepoPage({
  params,
  searchParams,
}: {
  params: { owner: string; repo: string };
  searchParams: { ref?: string };
}) {
  const { owner, repo } = params;
  const ref = searchParams.ref || "HEAD";

  const [meta, setMeta] = useState<RepoMeta | null>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

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
          <RepoTree owner={owner} repo={repo} refName={ref} nodes={nodes} />
        </section>

        <section style={{ background: "#111827", borderRadius: 12, padding: 16, minHeight: 520 }}>
          <div style={{ opacity: 0.85 }}>
            Select a file from the tree.
          </div>
        </section>
      </div>
    </main>
  );
}
