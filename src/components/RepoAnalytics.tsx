"use client";

import { useEffect, useState } from "react";

interface LanguageStats {
  [language: string]: number;
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  byType: { [ext: string]: number };
  largestFiles: Array<{ name: string; size: number }>;
}

interface AnalyticsData {
  languages: LanguageStats;
  fileStats: FileStats;
}

export default function RepoAnalytics({
  owner,
  repo,
  nodes,
}: {
  owner: string;
  repo: string;
  nodes: any[];
}) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateAnalytics = () => {
      const languages: LanguageStats = {};
      const byType: { [ext: string]: number } = {};
      let totalSize = 0;
      let totalFiles = 0;
      const allFiles: Array<{ name: string; size: number }> = [];

      const traverse = (items: any[]) => {
        for (const item of items) {
          if (item.type === "file") {
            totalFiles++;
            const ext = item.name.split(".").pop() || "no-ext";
            byType[ext] = (byType[ext] || 0) + 1;
            totalSize += item.size || 0;
            allFiles.push({ name: item.name, size: item.size || 0 });
          } else if (item.children) {
            traverse(item.children);
          }
        }
      };

      traverse(nodes);

      // Estimate language breakdown from file extensions
      const extensionLanguageMap: { [key: string]: string } = {
        js: "JavaScript",
        jsx: "JavaScript",
        ts: "TypeScript",
        tsx: "TypeScript",
        py: "Python",
        java: "Java",
        cpp: "C++",
        cc: "C++",
        c: "C",
        cs: "C#",
        go: "Go",
        rs: "Rust",
        rb: "Ruby",
        php: "PHP",
        swift: "Swift",
        kt: "Kotlin",
        scala: "Scala",
        sh: "Shell",
        bash: "Shell",
        html: "HTML",
        css: "CSS",
        scss: "SCSS",
        json: "JSON",
        xml: "XML",
        yaml: "YAML",
        yml: "YAML",
        toml: "TOML",
        md: "Markdown",
        tex: "LaTeX",
      };

      for (const [ext, count] of Object.entries(byType)) {
        const lang = extensionLanguageMap[ext.toLowerCase()] || ext.toUpperCase();
        languages[lang] = (languages[lang] || 0) + count;
      }

      const largestFiles = allFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);

      setAnalytics({
        languages,
        fileStats: {
          totalFiles,
          totalSize,
          byType,
          largestFiles,
        },
      });
      setLoading(false);
    };

    calculateAnalytics();
  }, [nodes]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#94a3b8",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
          <div>Analyzing repository...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#94a3b8",
        }}
      >
        <div>No data available</div>
      </div>
    );
  }

  const sortedLanguages = Object.entries(analytics.languages)
    .sort((a, b) => b[1] - a[1]);
  const totalLanguageFiles = sortedLanguages.reduce((sum, [_, count]) => sum + count, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 8px" }}>
      {/* Overall Statistics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>Total Files</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#60a5fa" }}>
            {analytics.fileStats.totalFiles}
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>Repository Size</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#a78bfa" }}>
            {formatBytes(analytics.fileStats.totalSize)}
          </div>
        </div>
      </div>

      {/* Language Breakdown */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
          📊 Language Distribution
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedLanguages.map(([lang, count]) => {
            const percentage = (count / totalLanguageFiles) * 100;
            return (
              <div key={lang}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "#cbd5e1" }}>{lang}</span>
                  <span style={{ color: "#94a3b8" }}>
                    {count} files ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)`,
                      width: `${percentage}%`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* File Types */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
          📁 File Types
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
          }}
        >
          {Object.entries(analytics.fileStats.byType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([ext, count]) => (
              <div
                key={ext}
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 12,
                }}
              >
                <div style={{ color: "#60a5fa", fontWeight: 600 }}>
                  .{ext}
                </div>
                <div style={{ color: "#94a3b8", marginTop: 4 }}>{count} files</div>
              </div>
            ))}
        </div>
      </div>

      {/* Largest Files */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
          📈 Largest Files
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {analytics.fileStats.largestFiles.map((file, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
                background: "rgba(59, 130, 246, 0.05)",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  color: "#cbd5e1",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
                title={file.name}
              >
                {file.name}
              </span>
              <span style={{ color: "#94a3b8", marginLeft: 12, flexShrink: 0 }}>
                {formatBytes(file.size)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Complexity Indicators */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
          ⚠️ Code Indicators
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
          {analytics.fileStats.largestFiles.some((f) => f.size > 50000) && (
            <div
              style={{
                padding: 10,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: 8,
                color: "#fca5a5",
              }}
            >
              ⚠️ Large files detected ({" "}
              {analytics.fileStats.largestFiles.filter((f) => f.size > 50000).length} over 50KB)
            </div>
          )}
          {sortedLanguages.length > 10 && (
            <div
              style={{
                padding: 10,
                background: "rgba(251, 191, 36, 0.1)",
                border: "1px solid rgba(251, 191, 36, 0.2)",
                borderRadius: 8,
                color: "#fbbf24",
              }}
            >
              ℹ️ Multiple languages ({sortedLanguages.length}) detected
            </div>
          )}
          <div
            style={{
              padding: 10,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              borderRadius: 8,
              color: "#86efac",
            }}
          >
            ✓ Repository has {analytics.fileStats.totalFiles} files across{" "}
            {sortedLanguages.length} languages
          </div>
        </div>
      </div>
    </div>
  );
}
