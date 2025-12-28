import { NextRequest, NextResponse } from "next/server";
import { ghFetch, jsonError } from "@/lib/github";
import type { FileData } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 500_000; // 500KB guard

type ContentResp = {
  type: "file" | "dir";
  name: string;
  path: string;
  size: number;
  encoding?: "base64";
  content?: string;
  html_url: string;
};

function decodeBase64(b64: string) {
  const cleaned = b64.replace(/\n/g, "");
  return Buffer.from(cleaned, "base64").toString("utf8");
}

function looksBinary(text: string) {
  // crude: null bytes or too many replacement chars
  if (text.includes("\u0000")) return true;
  const repl = (text.match(/\uFFFD/g) || []).length;
  return repl > 5;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const path = searchParams.get("path");
  const ref = searchParams.get("ref") || "HEAD";

  if (!owner || !repo || !path) return jsonError("Missing owner/repo/path");

  try {
    const r = await ghFetch<ContentResp>(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`,
      { next: { revalidate: 600 } }
    );

    if (r.type !== "file") return jsonError("Not a file", 400);

    const tooLarge = r.size > MAX_BYTES;
    let content = "";
    let truncated = false;

    if (tooLarge) {
      truncated = true;
    } else {
      const decoded = r.encoding === "base64" && r.content ? decodeBase64(r.content) : "";
      if (looksBinary(decoded)) {
        truncated = true;
        content = "";
      } else {
        content = decoded;
      }
    }

    const out: FileData = {
      path: r.path,
      name: r.name,
      size: r.size,
      encoding: tooLarge ? "none" : "base64",
      content,
      truncated,
      githubUrl: r.html_url,
    };

    return NextResponse.json(out);
  } catch (e: any) {
    return jsonError(e.message || "GitHub error", 500);
  }
}
