import type { RepoMeta } from "@/lib/types";

function formatNum(n: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export default function RepoHeader({ meta, refName }: { meta: RepoMeta; refName: string }) {
  const langEntries = Object.entries(meta.languages || {});
  const total = langEntries.reduce((s, [, v]) => s + v, 0);

  return (
    <section style={{ marginTop: 12, background: "#111827", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, marginBottom: 6 }}>{meta.fullName}</div>
          {meta.description && <div style={{ opacity: 0.85 }}>{meta.description}</div>}
          <div style={{ opacity: 0.75, marginTop: 8 }}>
            Branch/ref: <code>{refName}</code> • Updated:{" "}
            {new Date(meta.updatedAt).toLocaleString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", whiteSpace: "nowrap" }}>
          <Stat label="Stars" value={formatNum(meta.stars)} />
          <Stat label="Forks" value={formatNum(meta.forks)} />
          <Stat label="Issues" value={formatNum(meta.openIssues)} />
        </div>
      </div>

      {langEntries.length > 0 && total > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.9 }}>
            {langEntries
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([k, v]) => (
                <span key={k} style={{ background: "#0f1626", border: "1px solid #253047", padding: "6px 10px", borderRadius: 999 }}>
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
    <div style={{ textAlign: "right" }}>
      <div style={{ opacity: 0.7, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 16 }}>{value}</div>
    </div>
  );
}
