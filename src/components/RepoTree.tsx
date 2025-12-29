"use client";

import type { TreeNode } from "@/lib/types";
import { useMemo, useState } from "react";

export default function RepoTree({
  owner,
  repo,
  refName,
  nodes,
  onSelectFile,
}: {
  owner: string;
  repo: string;
  refName: string;
  nodes: TreeNode[];
  onSelectFile: (path: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [loadedChildren, setLoadedChildren] = useState<Map<string, TreeNode[]>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    // simple: filter by path substring, but keep tree flat-ish by listing matches
    const matches: TreeNode[] = [];
    const walk = (n: TreeNode) => {
      if (n.type === "file" && n.path.toLowerCase().includes(q)) matches.push(n);
      // Check loaded children too
      const childList = loadedChildren.get(n.path);
      if (childList) childList.forEach(walk);
    };
    nodes.forEach(walk);
    return matches.map((m) => ({ ...m })); // list view
  }, [nodes, query, loadedChildren]);

  const loadChildren = async (dirPath: string) => {
    if (loadedChildren.has(dirPath) || loading.has(dirPath)) return;

    const newLoading = new Set(loading);
    newLoading.add(dirPath);
    setLoading(newLoading);

    try {
      const res = await fetch(
        `/api/repo/tree?owner=${owner}&repo=${repo}&ref=${encodeURIComponent(refName)}&path=${encodeURIComponent(dirPath)}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Store loaded children
      const newLoadedChildren = new Map(loadedChildren);
      newLoadedChildren.set(dirPath, data.nodes || []);
      setLoadedChildren(newLoadedChildren);

      newLoading.delete(dirPath);
      setLoading(new Set(newLoading));
    } catch (e) {
      newLoading.delete(dirPath);
      setLoading(new Set(newLoading));
      console.error(`Failed to load ${dirPath}:`, e);
    }
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
          <TreeList nodes={filtered} onSelectFile={onSelectFile} depth={0} flat={Boolean(query.trim())} onLoadChildren={loadChildren} loadedChildren={loadedChildren} loading={loading} />
        )}
      </div>
    </div>
  );
}

function TreeList({
  nodes,
  onSelectFile,
  depth,
  flat,
  onLoadChildren,
  loadedChildren,
  loading,
}: {
  nodes: TreeNode[];
  onSelectFile: (path: string) => void;
  depth: number;
  flat: boolean;
  onLoadChildren: (path: string) => Promise<void>;
  loadedChildren: Map<string, TreeNode[]>;
  loading: Set<string>;
}) {
  return (
    <div>
      {nodes.map((n) => (
        <TreeItem key={n.path} node={n} depth={depth} onSelectFile={onSelectFile} flat={flat} onLoadChildren={onLoadChildren} loadedChildren={loadedChildren} loading={loading} />
      ))}
    </div>
  );
}

function TreeItem({
  node,
  depth,
  onSelectFile,
  flat,
  onLoadChildren,
  loadedChildren,
  loading,
}: {
  node: TreeNode;
  depth: number;
  onSelectFile: (path: string) => void;
  flat: boolean;
  onLoadChildren: (path: string) => Promise<void>;
  loadedChildren: Map<string, TreeNode[]>;
  loading: Set<string>;
}) {
  const [open, setOpen] = useState(false); // Start closed, open on demand
  const pad = flat ? 0 : depth * 14;
  const isLoading = loading.has(node.path);
  const children = loadedChildren.get(node.path) || node.children;

  const handleDirClick = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    // Load children if expanding and not loaded
    if (nextOpen && !loadedChildren.has(node.path) && node.children?.length === 0) {
      await onLoadChildren(node.path);
    }
  };

  if (node.type === "file") {
    return (
      <div
        onClick={() => onSelectFile(node.path)}
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
  const hasChildren = children && children.length > 0;

  return (
    <div>
      <div
        onClick={handleDirClick}
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
        {isLoading ? "⟳ " : open ? "▾ " : "▸ "}
        {node.name}
      </div>
      {open && hasChildren && (
        <TreeList nodes={children} onSelectFile={onSelectFile} depth={depth + 1} flat={false} onLoadChildren={onLoadChildren} loadedChildren={loadedChildren} loading={loading} />
      )}
    </div>
  );
}
