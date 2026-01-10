"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const OwnerRepo = z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);

function parseRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  // URL
  try {
    if (trimmed.startsWith("http")) {
      const u = new URL(trimmed);
      if (u.hostname !== "github.com") return null;
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length < 2) return null;
      const owner = parts[0]!;
      const repo = parts[1]!;
      if (!OwnerRepo.safeParse(`${owner}/${repo}`).success) return null;
      return { owner, repo };
    }
  } catch {}

  // owner/repo
  if (OwnerRepo.safeParse(trimmed).success) {
    const [owner, repo] = trimmed.split("/");
    return { owner, repo };
  }

  return null;
}

export default function RepoInput() {
  const router = useRouter();
  const [value, setValue] = useState("vercel/next.js");
  const [err, setErr] = useState<string | null>(null);

  const go = () => {
    const parsed = parseRepo(value);
    if (!parsed) {
      setErr("Invalid input. Use owner/repo or https://github.com/owner/repo");
      return;
    }
    setErr(null);
    router.push(`/repo/${parsed.owner}/${parsed.repo}`);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              go();
            }
          }}
          placeholder="owner/repo or https://github.com/..."
          style={{
            flex: 1,
            padding: "16px 18px",
            borderRadius: 12,
            border: "1px solid rgba(59, 130, 246, 0.3)",
            background: "rgba(15, 23, 42, 0.6)",
            color: "#f1f5f9",
            outline: "none",
            fontSize: 15,
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
            e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
            e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
          }}
        />
        <button
          onClick={go}
          style={{
            padding: "16px 28px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
          }}
        >
          Explore →
        </button>
      </div>
      {err && (
        <div 
          style={{ 
            marginTop: 12, 
            padding: "10px 14px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 8,
            color: "#fca5a5",
            fontSize: 14
          }}
        >
          {err}
        </div>
      )}
    </div>
  );
}
