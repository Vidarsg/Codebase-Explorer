export type RepoMeta = {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  updatedAt: string;
  homepage: string | null;
  languages: Record<string, number>; // bytes by language
};

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
};

export type FileData = {
  path: string;
  name: string;
  size: number;
  encoding: "base64" | "none";
  content: string; // decoded text (empty if too large/binary)
  truncated: boolean;
  githubUrl: string;
};
