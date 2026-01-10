"use client";

import '@fontsource/fira-code';
import type { FileData } from "@/lib/types";

function langFromName(name: string) {
  name; // unused for plain rendering
}

export default function FileViewer({ file }: { file: FileData }) { 
  return (
    <section 
      style={{ 
        background: "rgba(17, 24, 39, 0.6)",
        backdropFilter: "blur(12px)",
        borderRadius: 16,
        padding: 20,
        border: "1px solid rgba(59, 130, 246, 0.2)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          gap: 16, 
          marginBottom: 16,
          flexShrink: 0
        }}
      >
        <div>
          <div style={{ fontSize: 16, marginBottom: 6, color: "#f1f5f9", fontWeight: 600 }}>
            📄 {file.path}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 13 }}>
            {Math.round(file.size / 1024)} KB
            {file.truncated ? " • Not previewable (too large or binary)" : ""}
          </div>
        </div>
        <a
          href={file.githubUrl}
          target="_blank"
          rel="noreferrer"
          style={{ 
            textDecoration: "none",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            background: "rgba(59, 130, 246, 0.1)",
            color: "#60a5fa",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
          }}
        >
          View on GitHub →
        </a>
      </div>

      <div 
        style={{ 
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          background: "rgba(15, 23, 42, 0.4)",
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {file.truncated ? (
          <div style={{ padding: 20, color: "#cbd5e1", textAlign: "center" }}>
            ⚠️ Preview disabled. File is too large or binary. Use "View on GitHub" button above.
          </div>
        ) : (
          <pre style={{
            margin: 0,
            padding: 16,
            fontFamily: '"Fira Code", monospace',
            fontSize: 13,
            lineHeight: 1.6,
            color: "#e2e8f0",
            overflow: "auto",
            flex: 1
          }}>
            {file.content}
          </pre>
        )}
      </div>
    </section>
  );
}
