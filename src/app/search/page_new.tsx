import { Suspense } from "react";
import SearchContent from "@/components/SearchContent";

export default function SearchPage() {
  return (
    <Suspense 
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#f1f5f9",
            padding: "40px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: 40,
              textAlign: "center",
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              borderRadius: 16,
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: "3px solid rgba(59, 130, 246, 0.2)",
                borderTopColor: "#60a5fa",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ marginTop: 16, color: "#94a3b8" }}>Loading search...</p>
            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
