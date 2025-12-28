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
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <a
          href={`/repo/${owner}/${repo}?ref=${encodeURIComponent(ref)}`}
          style={{ textDecoration: "none", opacity: 0.9 }}
        >
          ← Back
        </a>
        <div style={{ opacity: 0.8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          {owner}/{repo} • {path}
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 12, padding: 12, background: "#2a0f14", borderRadius: 10 }}>
          {err}
        </div>
      )}

      {file && <FileViewer file={file} />}
    </main>
  );
}
