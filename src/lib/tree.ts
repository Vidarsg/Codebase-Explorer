import type { TreeNode } from "./types";

type FlatTreeItem = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};

export function buildTree(items: FlatTreeItem[]): TreeNode[] {
  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode>();

  function ensureDir(dirPath: string): TreeNode {
    if (dirMap.has(dirPath)) return dirMap.get(dirPath)!;

    const parts = dirPath.split("/").filter(Boolean);
    let curPath = "";
    let parentChildren = root;

    for (const part of parts) {
      curPath = curPath ? `${curPath}/${part}` : part;
      let node = dirMap.get(curPath);
      if (!node) {
        node = { name: part, path: curPath, type: "dir", children: [] };
        parentChildren.push(node);
        dirMap.set(curPath, node);
      }
      parentChildren = node.children!;
    }

    return dirMap.get(dirPath)!;
  }

  for (const it of items) {
    const parts = it.path.split("/");
    const name = parts[parts.length - 1]!;
    const parentDir = parts.slice(0, -1).join("/");

    const fileNode: TreeNode = {
      name,
      path: it.path,
      type: it.type === "tree" ? "dir" : "file",
      ...(it.type === "blob" ? { size: it.size ?? 0 } : { children: [] }),
    };

    if (!parentDir) {
      root.push(fileNode);
    } else {
      const dir = ensureDir(parentDir);
      dir.children!.push(fileNode);
    }

    if (fileNode.type === "dir") {
      dirMap.set(fileNode.path, fileNode);
    }
  }

  // sort dirs first, then alpha
  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const n of nodes) if (n.children) sortRec(n.children);
  };
  sortRec(root);

  return root;
}
