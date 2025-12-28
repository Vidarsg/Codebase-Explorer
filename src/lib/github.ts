import { NextResponse } from "next/server";

const GH_BASE = "https://api.github.com";

export function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function ghFetch<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const res = await fetch(`${GH_BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers || {}), ...githubHeaders() },
  });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.message) msg = `${msg}: ${j.message}`;
    } catch {}
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
