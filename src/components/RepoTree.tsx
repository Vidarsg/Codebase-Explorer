"use client";

import type { TreeNode } from "@/lib/types";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function RepoTree({
  owner,
  repo,
  refName,
  nodes,
}: {
  owner: string;
  repo: string;
  refName: string;
  nodes: TreeNode[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    // simple: filter by path substring, but keep tree flat-ish by listing matches
    const matches: TreeNode[] = [];
    const walk = (n: TreeNode) => {
      if (n.type === "file" && n.path.toLowerCase().includes(q)) matches.push(n);
      if (n.children) n.children.forEach(walk);
    };
    nodes.forEach(walk);
    return matches.map((m) => ({ ...m })); // list view
  }, [nodes, query]);

  const openFile = (path: string) => {
    router.push(`/repo/${owner}/${repo}/blob/${path}?ref=${encodeURIComponent(refName)}`);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search paths…"
        style={{
          width: "100%",
          padding: "10px 10px",
          borderRadius: 10,
          border: "1px solid #253047",
          background: "#0f1626",
          color: "#e8eefc",
          outline: "none",
          marginBottom: 10,
        }}
      />

      {query.trim() ? (
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
          Showing matching files
        </div>
      ) : null}

      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}>
        {filtered.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No results</div>
        ) : (
          <TreeList nodes={filtered} onOpenFile={openFile} depth={0} flat={Boolean(query.trim())} />
        )}
      </div>
    </div>
  );
}

function TreeList({
  nodes,
  onOpenFile,
  depth,
  flat,
}: {
  nodes: TreeNode[];
  onOpenFile: (path: string) => void;
  depth: number;
  flat: boolean;
}) {
  return (
    <div>
      {nodes.map((n) => (
        <TreeItem key={n.path} node={n} depth={depth} onOpenFile={onOpenFile} flat={flat} />
      ))}
    </div>
  );
}

function TreeItem({
  node,
  depth,
  onOpenFile,
  flat,
}: {
  node: TreeNode;
  depth: number;
  onOpenFile: (path: string) => void;
  flat: boolean;
}) {
  const [open, setOpen] = useState(depth < 1); // auto-open top level
  const pad = flat ? 0 : depth * 14;

  if (node.type === "file") {
    return (
      <div
        onClick={() => onOpenFile(node.path)}
        style={{
          padding: "6px 8px",
          marginLeft: pad,
          borderRadius: 8,
          cursor: "pointer",
          opacity: 0.92,
        }}
        onMouseEnter={(e) => ((e.currentTarget.style.background = "#0f1626"))}
        onMouseLeave={(e) => ((e.currentTarget.style.background = "transparent"))}
        title={node.path}
      >
        {flat ? node.path : node.name}
      </div>
    );
  }

  // dir
  return (
    <div>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "6px 8px",
          marginLeft: pad,
          borderRadius: 8,
          cursor: "pointer",
          opacity: 0.95,
          fontWeight: 600,
        }}
        onMouseEnter={(e) => ((e.currentTarget.style.background = "#0f1626"))}
        onMouseLeave={(e) => ((e.currentTarget.style.background = "transparent"))}
        title={node.path}
      >
        {open ? "▾ " : "▸ "}
        {node.name}
      </div>
      {open && node.children && (
        <TreeList nodes={node.children} onOpenFile={onOpenFile} depth={depth + 1} flat={false} />
      )}
    </div>
  );
}
