"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
}

interface SearchResults {
  total_count: number;
  items: Repository[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "stars");
  const [order, setOrder] = useState(searchParams.get("order") || "desc");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/repo/search?q=${encodeURIComponent(query)}&sort=${sortBy}&order=${order}&page=${currentPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError("Failed to load search results");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, sortBy, order, currentPage]);

  const updateSort = (newSort: string, newOrder: string) => {
    setSortBy(newSort);
    setOrder(newOrder);
    setCurrentPage(1);
    router.push(`/search?q=${encodeURIComponent(query)}&sort=${newSort}&order=${newOrder}&page=1`);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    router.push(`/search?q=${encodeURIComponent(query)}&sort=${sortBy}&order=${order}&page=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = results ? Math.min(Math.ceil(results.total_count / 30), 34) : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#f1f5f9",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginBottom: 20,
              color: "#60a5fa",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            ← Back to Home
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Search Results
          </h1>
          {query && results && (
            <p style={{ fontSize: 16, color: "#94a3b8" }}>
              {results.total_count > 0 && results.items[0]?.owner.login.toLowerCase() === query.toLowerCase() 
                ? <>Showing repositories from: <strong style={{ color: "#f1f5f9" }}>{query}</strong></>
                : <>Showing results for: <strong style={{ color: "#f1f5f9" }}>{query}</strong></>
              }
            </p>
          )}
        </div>

        {/* Sort Controls */}
        {!loading && results && results.items.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: 14 }}>Sort by:</span>
            <button
              onClick={() => updateSort("stars", order)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(59, 130, 246, 0.3)",
                background:
                  sortBy === "stars"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(15, 23, 42, 0.6)",
                color: sortBy === "stars" ? "#60a5fa" : "#94a3b8",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
            >
              ⭐ Stars
            </button>
            <button
              onClick={() => updateSort("forks", order)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(59, 130, 246, 0.3)",
                background:
                  sortBy === "forks"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(15, 23, 42, 0.6)",
                color: sortBy === "forks" ? "#60a5fa" : "#94a3b8",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
            >
              🍴 Forks
            </button>
            <button
              onClick={() => updateSort("updated", order)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(59, 130, 246, 0.3)",
                background:
                  sortBy === "updated"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(15, 23, 42, 0.6)",
                color: sortBy === "updated" ? "#60a5fa" : "#94a3b8",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
            >
              🕒 Updated
            </button>
            <div
              style={{
                width: 1,
                height: 24,
                background: "rgba(148, 163, 184, 0.2)",
                margin: "0 4px",
              }}
            />
            <button
              onClick={() => updateSort(sortBy, order === "desc" ? "asc" : "desc")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(59, 130, 246, 0.3)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
            >
              {order === "desc" ? "↓ Descending" : "↑ Ascending"}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(12px)",
              borderRadius: 16,
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: "3px solid rgba(59, 130, 246, 0.2)",
                borderTopColor: "#60a5fa",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ marginTop: 16, color: "#94a3b8" }}>Searching GitHub...</p>
            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: 24,
              background: "rgba(239, 68, 68, 0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: 16,
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <>
            <div style={{ marginBottom: 16, color: "#94a3b8", fontSize: 14 }}>
              Found {results.total_count.toLocaleString()} repositories (showing page {currentPage} of {totalPages})
            </div>
            {results.items.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  background: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 16,
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                <p style={{ fontSize: 18, color: "#94a3b8" }}>No repositories found</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {results.items.map((repo) => (
                  <Link
                    key={repo.id}
                    href={`/repo/${repo.owner.login}/${repo.name}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        padding: 24,
                        background: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(12px)",
                        borderRadius: 16,
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(59, 130, 246, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "start", gap: 16 }}>
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h2
                            style={{
                              fontSize: 20,
                              fontWeight: 600,
                              color: "#60a5fa",
                              marginBottom: 4,
                            }}
                          >
                            {repo.full_name}
                          </h2>
                          {repo.description && (
                            <p
                              style={{
                                fontSize: 14,
                                color: "#cbd5e1",
                                marginBottom: 12,
                                lineHeight: 1.5,
                              }}
                            >
                              {repo.description}
                            </p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              gap: 16,
                              flexWrap: "wrap",
                              fontSize: 13,
                              color: "#94a3b8",
                            }}
                          >
                            {repo.language && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: "#60a5fa",
                                  }}
                                />
                                {repo.language}
                              </div>
                            )}
                            <div>⭐ {formatNumber(repo.stargazers_count)}</div>
                            <div>🍴 {formatNumber(repo.forks_count)}</div>
                            <div>
                              Updated {new Date(repo.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 32,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    background: currentPage === 1 
                      ? "rgba(15, 23, 42, 0.3)" 
                      : "rgba(15, 23, 42, 0.6)",
                    color: currentPage === 1 ? "#475569" : "#94a3b8",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: 14,
                    transition: "all 0.2s ease",
                  }}
                >
                  ← Previous
                </button>

                <div style={{ display: "flex", gap: 6 }}>
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          background: "rgba(15, 23, 42, 0.6)",
                          color: "#94a3b8",
                          cursor: "pointer",
                          fontSize: 14,
                          minWidth: 40,
                        }}
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span style={{ padding: "10px 8px", color: "#475569" }}>...</span>
                      )}
                    </>
                  )}

                  {/* Page numbers around current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === currentPage || 
                             page === currentPage - 1 || 
                             page === currentPage - 2 ||
                             page === currentPage + 1 || 
                             page === currentPage + 2;
                    })
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          background: page === currentPage 
                            ? "rgba(59, 130, 246, 0.3)" 
                            : "rgba(15, 23, 42, 0.6)",
                          color: page === currentPage ? "#60a5fa" : "#94a3b8",
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: page === currentPage ? 600 : 400,
                          minWidth: 40,
                          transition: "all 0.2s ease",
                        }}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span style={{ padding: "10px 8px", color: "#475569" }}>...</span>
                      )}
                      <button
                        onClick={() => goToPage(totalPages)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          background: "rgba(15, 23, 42, 0.6)",
                          color: "#94a3b8",
                          cursor: "pointer",
                          fontSize: 14,
                          minWidth: 40,
                        }}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    background: currentPage === totalPages 
                      ? "rgba(15, 23, 42, 0.3)" 
                      : "rgba(15, 23, 42, 0.6)",
                    color: currentPage === totalPages ? "#475569" : "#94a3b8",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontSize: 14,
                    transition: "all 0.2s ease",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default SearchContent;
