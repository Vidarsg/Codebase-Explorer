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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Filter files..."
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "rgba(17, 24, 39, 0.6)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: 10,
          color: "#f1f5f9",
          fontSize: 14,
          outline: "none",
          transition: "all 0.2s ease",
          marginBottom: 12,
          flexShrink: 0
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
          e.currentTarget.style.background = "rgba(17, 24, 39, 0.8)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
          e.currentTarget.style.background = "rgba(17, 24, 39, 0.6)";
        }}
      />

      {query.trim() && (
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, paddingLeft: 8 }}>
          {filtered.length} {filtered.length === 1 ? "match" : "matches"}
        </div>
      )}

      <div 
        style={{ 
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          color: "#e2e8f0",
          flex: 1,
          overflow: "auto"
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ color: "#64748b", padding: "20px 8px", textAlign: "center" }}>
            {query.trim() ? "No matching files" : "No files"}
          </div>
        ) : (
          <TreeList 
            nodes={filtered}
            onSelectFile={onSelectFile}
            depth={0}
            flat={Boolean(query.trim())}
            onLoadChildren={loadChildren}
            loadedChildren={loadedChildren}
            loading={loading}
          />
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
          padding: "7px 10px",
          marginLeft: pad,
          borderRadius: 6,
          cursor: "pointer",
          color: "#cbd5e1",
          transition: "all 0.15s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
          e.currentTarget.style.color = "#93c5fd";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#cbd5e1";
        }}
        title={node.path}
      >
        📄 {flat ? node.path : node.name}
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
          padding: "7px 10px",
          marginLeft: pad,
          borderRadius: 6,
          cursor: "pointer",
          color: "#e2e8f0",
          fontWeight: 600,
          transition: "all 0.15s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(168, 139, 250, 0.15)";
          e.currentTarget.style.color = "#c4b5fd";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#e2e8f0";
        }}
        title={node.path}
      >
        {isLoading ? "⟳ " : open ? "📂 " : "📁 "}
        {node.name}
      </div>
      {open && hasChildren && (
        <TreeList nodes={children} onSelectFile={onSelectFile} depth={depth + 1} flat={false} onLoadChildren={onLoadChildren} loadedChildren={loadedChildren} loading={loading} />
      )}
    </div>
  );
}
