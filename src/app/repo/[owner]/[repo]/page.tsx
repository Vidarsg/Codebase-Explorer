"use client";

import { useEffect, useState } from "react";
import RepoHeader from "@/components/RepoHeader";
import RepoAnalytics from "@/components/RepoAnalytics";
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

  return (
    <>
      <nav 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 50
        }}
      >
        <h1 style={{ 
          margin: 0,
          fontSize: 24,
          fontWeight: 700,
          background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          {owner}/{repo}
        </h1>
        <a 
          href="/"
          style={{
            textDecoration: "none",
            color: "#94a3b8",
            fontSize: 16,
            fontWeight: 500,
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#cbd5e1"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
        >
          ← Home
        </a>
      </nav>

      <main 
        style={{ 
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          paddingTop: "72px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "24px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column" }}>
          {err && (
            <div 
              style={{
                padding: 16,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 12,
                color: "#fca5a5"
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
                color: "#fbbf24"
              }}
            >
              ⚠️ Repository tree was truncated by GitHub due to size.
            </div>
          )}

          <section style={{ marginTop: 16 }}>
            <RepoAnalytics owner={owner} repo={repo} nodes={nodes} />
          </section>
        </div>
      </main>
    </>
  );
}