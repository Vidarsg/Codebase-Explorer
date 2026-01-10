# Codebase Explorer

A modern, interactive web application for exploring GitHub repositories directly in your browser. Browse repository file trees, view code, and share specific files via URL.

## Features

- 🌳 **Interactive File Tree** – Browse repository structure with lazy-load expansion for large repos
- 📄 **Code Viewer** – Clean, readable code display
- 🔍 **File Search** – Filter files by name/type in the tree
- 🔗 **Shareable Links** – URL-based file selection (`?path=...&ref=...`) for sharing specific files
- 📊 **Repository Metadata** – View stats (stars, forks, open issues, languages)
- 🎨 **Modern UI** – Glassmorphism design with gradient backgrounds and smooth interactions
- 🌙 **Dark Mode** – Built-in dark color scheme optimized for code readability
- ⚡ **Performance** – Load-on-expand for nested directories to handle large repositories

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Inline CSS with glassmorphism effects (backdrop-filter, rgba)
- **API**: GitHub REST API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
git clone https://github.com/Vidarsg/Codebase-Explorer.git
cd codebase-explorer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Home Page**: Enter a GitHub repository in the format `owner/repo` or paste a full GitHub URL
2. **Repository View**: 
   - Browse the file tree on the left (click folders to expand/collapse)
   - Use the search box to filter files
   - Click any file to view its contents on the right
3. **Share**: Copy the URL from the address bar—it includes the selected file path and ref (branch/tag)
4. **GitHub Link**: Click "View on GitHub →" to jump to the repository on GitHub.com

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page with repo input
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── api/
│   │   └── repo/
│   │       ├── meta/         # Repository metadata endpoint
│   │       ├── tree/         # File tree endpoint (lazy-load)
│   │       └── file/         # File content endpoint
│   └── repo/
│       ├── [owner]/[repo]/   # Repository explorer page
│       └── blob/[...path]/   # Direct file viewer page
├── components/
│   ├── FileViewer.tsx        # Code display component
│   ├── RepoHeader.tsx        # Repository info & stats
│   ├── RepoInput.tsx         # Repository search form
│   └── RepoTree.tsx          # File tree with lazy loading
├── lib/
│   ├── github.ts             # GitHub API wrapper
│   ├── tree.ts               # Tree building utilities
│   └── types.ts              # TypeScript interfaces
└── types/
    └── react-syntax-highlighter.d.ts  # Type declarations
```

## API Routes

- `GET /api/repo/meta?owner=...&repo=...` – Fetch repository metadata
- `GET /api/repo/tree?owner=...&repo=...&ref=...&path=...` – Fetch file tree (with optional path for nested directories)
- `GET /api/repo/file?owner=...&repo=...&ref=...&path=...` – Fetch file contents

## Features in Detail

### Load-on-Expand
Directories are loaded only when expanded, improving performance for large repositories. The tree API supports path parameters to fetch nested directory contents directly from GitHub.

### Shareable URLs
Files are selected via the `path` query parameter, and the current branch/ref is included as `ref`. This allows users to share links like:
```
/repo/owner/repo?ref=main&path=src/components/Button.tsx
```

### Search & Filter
The file tree includes a search bar that filters files by name in real-time. When searching, the tree switches to a flat list view.

## Limitations

- Files larger than GitHub's preview limit may not display (use "View on GitHub" instead)
- Syntax highlighting is disabled for cleaner, more readable code display
- Repository trees truncated by GitHub (10,000+ files) use load-on-expand to work around size limits

## Future Enhancements

- [ ] Syntax highlighting with better theme support
- [ ] Multi-language file diff viewer
- [ ] Bookmark favorite repositories
- [ ] Dark/light theme toggle
- [ ] Code minimap for large files
- [ ] Line number jumping
