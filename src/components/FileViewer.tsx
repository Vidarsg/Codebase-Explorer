"use client";

import type { FileData } from "@/lib/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

function langFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    json: "json",
    md: "markdown",
    py: "python",
    java: "java",
    kt: "kotlin",
    cs: "csharp",
    go: "go",
    rs: "rust",
    yml: "yaml",
    yaml: "yaml",
    toml: "toml",
    xml: "xml",
    html: "html",
    css: "css",
    scss: "scss",
    sh: "bash",
  };
  return map[ext] || "text";
}

export default function FileViewer({ file }: { file: FileData }) {
  const lang = langFromName(file.name);

  return (
    <section style={{ marginTop: 12, background: "#111827", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>{file.path}</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            {Math.round(file.size / 1024)} KB
            {file.truncated ? " • Not previewable (too large or binary)" : ""}
          </div>
        </div>
        <a
          href={file.githubUrl}
          target="_blank"
          rel="noreferrer"
          style={{ opacity: 0.9, textDecoration: "none", border: "1px solid #253047", padding: "8px 10px", borderRadius: 10 }}
        >
          View on GitHub
        </a>
      </div>

      <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: "1px solid #253047" }}>
        {file.truncated ? (
          <div style={{ padding: 14, opacity: 0.85 }}>
            Preview disabled. Use “View on GitHub”.
          </div>
        ) : (
          <SyntaxHighlighter language={lang} customStyle={{ margin: 0, background: "#0f1626" }}>
            {file.content}
          </SyntaxHighlighter>
        )}
      </div>
    </section>
  );
}
