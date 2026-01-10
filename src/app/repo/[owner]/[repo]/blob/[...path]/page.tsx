"use client";

import { useEffect, useState } from "react";
import FileViewer from "@/components/FileViewer";
import type { FileData } from "@/lib/types";

export default function BlobPage({
  params,
  searchParams,
}: {
  params: { owner: string; repo: string; path: string[] };
  searchParams: { ref?: string };
}) {
  const { owner, repo } = params;
  const ref = searchParams.ref || "HEAD";
  const path = params.path.join("/");

  const [file, setFile] = useState<FileData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    setFile(null);

    fetch(
      `/api/repo/file?owner=${owner}&repo=${repo}&ref=${encodeURIComponent(ref)}&path=${encodeURIComponent(
        path
      )}`
    )
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) throw new Error(j.error);
        setFile(j);
      })
      .catch((e) => !cancelled && setErr(e.message || "Failed"));

    return () => {
      cancelled = true;
    };
  }, [owner, repo, ref, path]);

  return (
    <main 
      style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "24px 20px"
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 8 }}>
          <a
            href={`/repo/${owner}/${repo}?ref=${encodeURIComponent(ref)}`}
            style={{ 
              textDecoration: "none",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              background: "rgba(59, 130, 246, 0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 14
            }}
          >
            ← Back
          </a>
          <div style={{ color: "#cbd5e1", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {owner}/{repo} • {path}
          </div>
        </div>

        {err && (
          <div 
            style={{
              marginTop: 16,
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

        {!file && !err && (
          <div 
            style={{
              height: "60vh",
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
        )}

        {file && <FileViewer file={file} />}
      </div>
    </main>
  );
}
