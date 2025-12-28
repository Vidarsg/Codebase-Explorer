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
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="owner/repo or GitHub URL"
        style={{
          flex: 1,
          padding: "12px 12px",
          borderRadius: 10,
          border: "1px solid #253047",
          background: "#0f1626",
          color: "#e8eefc",
          outline: "none",
        }}
      />
      <button
        onClick={go}
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid #2a3855",
          background: "#14213a",
          color: "#e8eefc",
          cursor: "pointer",
        }}
      >
        Open
      </button>
      {err && <div style={{ marginTop: 8, opacity: 0.9, color: "#ffb4b4" }}>{err}</div>}
    </div>
  );
}
