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
  const path = searchParams.get("path"); // for load-on-expand

  if (!owner || !repo) return jsonError("Missing owner/repo");

  try {
    const commit = await ghFetch<CommitResp>(`/repos/${owner}/${repo}/commits/${ref}`, {
      next: { revalidate: 900 },
    });

    let tree: TreeResp;

    if (path) {
      // Load specific directory contents (non-recursive) - direct children only
      tree = await ghFetch<TreeResp>(
        `/repos/${owner}/${repo}/git/trees/${commit.sha}:${path}`,
        { next: { revalidate: 900 } }
      );
      // Convert flat items to TreeNodes directly (no buildTree - these are direct children)
      const nodes: TreeNode[] = tree.tree.map((item) => ({
        name: item.path.split("/").pop()!,
        path: `${path}/${item.path}`,
        type: item.type === "tree" ? "dir" : "file",
        ...(item.type === "tree" ? { children: [] } : { size: item.size ?? 0 }),
      }));

      return NextResponse.json({
        ref,
        truncated: tree.truncated,
        nodes,
      });
    } else {
      // Load only root level (non-recursive) - use buildTree for initial load
      tree = await ghFetch<TreeResp>(
        `/repos/${owner}/${repo}/git/trees/${commit.sha}`,
        { next: { revalidate: 900 } }
      );

      const nodes: TreeNode[] = buildTree(tree.tree);

      return NextResponse.json({
        ref,
        truncated: tree.truncated,
        nodes,
      });
    }
  } catch (e: any) {
    return jsonError(e.message || "GitHub error", 500);
  }
}
