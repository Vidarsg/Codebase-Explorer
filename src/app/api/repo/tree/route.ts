import { NextRequest, NextResponse } from "next/server";
import { ghFetch, jsonError } from "@/lib/github";
import { buildTree } from "@/lib/tree";
import type { TreeNode } from "@/lib/types";

export const runtime = "nodejs";

type CommitResp = { sha: string; commit: any };
type TreeResp = {
  sha: string;
  tree: Array<{ path: string; type: "blob" | "tree"; size?: number }>;
  truncated: boolean;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const ref = searchParams.get("ref") || "HEAD";

  if (!owner || !repo) return jsonError("Missing owner/repo");

  try {
    const commit = await ghFetch<CommitResp>(`/repos/${owner}/${repo}/commits/${ref}`, {
      next: { revalidate: 900 },
    });

    // Using recursive tree
    const tree = await ghFetch<TreeResp>(
      `/repos/${owner}/${repo}/git/trees/${commit.sha}?recursive=1`,
      { next: { revalidate: 900 } }
    );

    const nodes: TreeNode[] = buildTree(tree.tree);

    return NextResponse.json({
      ref,
      truncated: tree.truncated,
      nodes,
    });
  } catch (e: any) {
    return jsonError(e.message || "GitHub error", 500);
  }
}
