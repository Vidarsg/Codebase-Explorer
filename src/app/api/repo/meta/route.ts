import { NextRequest, NextResponse } from "next/server";
import { ghFetch, jsonError } from "@/lib/github";
import type { RepoMeta } from "@/lib/types";

export const runtime = "nodejs";

type RepoResp = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  updated_at: string;
  homepage: string | null;
  owner: { login: string };
  name: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) return jsonError("Missing owner/repo");

  try {
    const [r, langs] = await Promise.all([
      ghFetch<RepoResp>(`/repos/${owner}/${repo}`, { next: { revalidate: 1800 } }),
      ghFetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`, {
        next: { revalidate: 1800 },
      }),
    ]);

    const meta: RepoMeta = {
      owner: r.owner.login,
      repo: r.name,
      fullName: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      defaultBranch: r.default_branch,
      updatedAt: r.updated_at,
      homepage: r.homepage,
      languages: langs,
    };

    return NextResponse.json(meta);
  } catch (e: any) {
    return jsonError(e.message || "GitHub error", 500);
  }
}
