import type { RepoMeta } from "@/lib/types";

function formatNum(n: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export default function RepoHeader({ meta, refName }: { meta: RepoMeta; refName: string }) {
  const langEntries = Object.entries(meta.languages || {});
  const total = langEntries.reduce((s, [, v]) => s + v, 0);
  const githubUrl = `https://github.com/${meta.fullName}`;

  return (
    <section 
      style={{ 
        marginTop: 16, 
        background: "rgba(17, 24, 39, 0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, marginBottom: 8, fontWeight: 600, color: "#f1f5f9" }}>
            {meta.fullName}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 12,
                fontSize: 14,
                textDecoration: "none",
                color: "#60a5fa",
                fontWeight: 500,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#93c5fd";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#60a5fa";
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              View on GitHub →
            </a>
          </div>
          {meta.description && (
            <div style={{ color: "#cbd5e1", lineHeight: 1.5, marginBottom: 10 }}>
              {meta.description}
            </div>
          )}
          <div 
            style={{ 
              fontSize: 13, 
              color: "#94a3b8",
              display: "flex",
              gap: 16,
              flexWrap: "wrap"
            }}
          >
            <span>
              📌 <code style={{ marginLeft: 4, color: "#60a5fa" }}>{refName}</code>
            </span>
            <span>
              🕒 Updated {new Date(meta.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <Stat label="Stars" value={formatNum(meta.stars)} />
          <Stat label="Forks" value={formatNum(meta.forks)} />
          <Stat label="Issues" value={formatNum(meta.openIssues)} />
        </div>
      </div>

      {langEntries.length > 0 && total > 0 && (
        <div 
          style={{ 
            paddingTop: 16,
            borderTop: "1px solid rgba(59, 130, 246, 0.15)"
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {langEntries
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([k, v]) => (
                <span 
                  key={k} 
                  style={{ 
                    background: "rgba(59, 130, 246, 0.1)", 
                    border: "1px solid rgba(59, 130, 246, 0.25)", 
                    padding: "6px 12px", 
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#93c5fd",
                    fontWeight: 500
                  }}
                >
                  {k} {Math.round((v / total) * 100)}%
                </span>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "right", minWidth: 60 }}>
      <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{value}</div>
    </div>
  );
}
