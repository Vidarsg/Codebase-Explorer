import RepoInput from "@/components/RepoInput";

export default function Home() {
  return (
    <main 
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: 24
      }}
    >
      <div style={{ maxWidth: 680, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div 
            style={{ 
              display: "inline-block",
              padding: "8px 20px",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: 999,
              fontSize: 13,
              color: "#60a5fa",
              marginBottom: 24,
              fontWeight: 500
            }}
          >
            🔍 Explore GitHub Repositories
          </div>
          
          <h1 
            style={{ 
              fontSize: 56, 
              fontWeight: 700,
              marginBottom: 16,
              background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.2
            }}
          >
            Repository Explorer
          </h1>
          
          <p 
            style={{ 
              fontSize: 18, 
              opacity: 0.8, 
              marginTop: 0,
              marginBottom: 32,
              lineHeight: 1.6,
              color: "#cbd5e1"
            }}
          >
            Browse any public GitHub repository with an intuitive file tree.<br/>
            Fast, simple, and no authentication required.
          </p>
        </div>
        
        <div 
          style={{ 
            background: "rgba(17, 24, 39, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
          }}
        >
          <RepoInput />
          
          <div 
            style={{ 
              marginTop: 24, 
              fontSize: 14,
              color: "#94a3b8"
            }}
          >
            <div style={{ marginBottom: 12, fontWeight: 500 }}>Try these examples:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["vercel/next.js", "facebook/react", "microsoft/vscode"].map((example) => (
                <code 
                  key={example}
                  style={{ 
                    background: "rgba(15, 23, 42, 0.8)",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 13,
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    color: "#60a5fa"
                  }}
                >
                  {example}
                </code>
              ))}
            </div>
          </div>
        </div>
        
        <div 
          style={{ 
            marginTop: 48,
            textAlign: "center",
            fontSize: 14,
            color: "#64748b"
          }}
        >
          Powered by GitHub API
        </div>
      </div>
    </main>
  );
}
