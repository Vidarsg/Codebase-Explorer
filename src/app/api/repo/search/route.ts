import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q");
  const sort = searchParams.get("sort") || "stars";
  const order = searchParams.get("order") || "desc";
  const page = searchParams.get("page") || "1";
  const per_page = searchParams.get("per_page") || "30";

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    // Check if query is a GitHub username by trying to fetch user info
    let searchQuery = query;
    const headers = {
      Accept: "application/vnd.github.v3+json",
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      }),
    };

    // Try to check if it's a valid GitHub user
    if (/^[A-Za-z0-9_-]+$/.test(query.trim())) {
      try {
        const userResponse = await fetch(
          `https://api.github.com/users/${encodeURIComponent(query.trim())}`,
          { headers }
        );
        
        if (userResponse.ok) {
          // Valid user found, search for their repos
          searchQuery = `user:${query.trim()}`;
        }
      } catch {
        // Not a user, continue with normal search
      }
    }

    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      searchQuery
    )}&sort=${sort}&order=${order}&per_page=${per_page}&page=${page}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return NextResponse.json(
        { error: "GitHub API error", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
