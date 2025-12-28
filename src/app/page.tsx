import RepoInput from "@/components/RepoInput";

export default function Home() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Repo Explorer</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Paste a public GitHub repo URL or <code>owner/repo</code>.
      </p>
      <RepoInput />
      <div style={{ marginTop: 16, opacity: 0.75 }}>
        Examples: <code>vercel/next.js</code>, <code>facebook/react</code>
      </div>
    </main>
  );
}
