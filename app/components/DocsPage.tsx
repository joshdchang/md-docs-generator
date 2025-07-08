import React, { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import remarkParse from "remark-parse";
import rehypeRaw from "rehype-raw";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import slugify from "slugify";
import "./DocsPage.css";
import "highlight.js/styles/github.css";

interface Heading {
  depth: number;
  text: string;
  id: string;
}

interface DocsPageProps {
  /** Raw markdown string to render */
  markdown: string;
  /** Optional initial theme */
  defaultTheme?: "light" | "dark";
  /** Optional title */
  title?: string;
  /** Optional logo/icon */
  logo?: React.ReactNode;
  /** Optional hero section with badges */
  hero?: {
    title?: string;
    subtitle?: string;
    badges?: Array<{
      href: string;
      src: string;
      alt: string;
    }>;
    links?: Array<{
      href: string;
      text: string;
    }>;
  };
}

/**
 * Extract headings (h1–h6) from markdown so we can build a TOC.
 */
const extractHeadings = (markdown: string): Heading[] => {
  const tree = unified().use(remarkParse).parse(markdown);
  const headings: Heading[] = [];
  visit(tree, "heading", (node: any) => {
    const depth = node.depth;
    let text = "";

    // Extract text from all children, not just direct text nodes
    const extractText = (node: any): string => {
      if (node.type === "text") {
        return node.value;
      }
      if (node.children) {
        return node.children.map(extractText).join("");
      }
      return "";
    };

    text = extractText(node);

    if (text.trim()) {
      const id = slugify(text, { lower: true, strict: true });
      headings.push({ depth, text, id });
    }
  });
  return headings;
};

/** Get CSS class for heading depth */
const getDepthClass = (depth: number) => {
  if (depth <= 2) return "";
  return `depth${depth}`;
};

/**
 * One‑page documentation component, inspired by zod.dev.
 *
 * • GitHub‑flavored markdown (tables, strikethrough, task lists, …)
 * • Syntax‑highlighted code blocks (highlight.js)
 * • Auto‑generated in‑page table of contents
 * • Clickable light/dark theme toggle
 *
 * Uses CSS modules for styling with GitHub-like markdown rendering.
 */
export const DocsPage: React.FC<DocsPageProps> = ({
  markdown,
  defaultTheme = "light",
  title = "Docs",
  logo,
  hero,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(defaultTheme);

  // Apply / remove global `dark` class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const headings = useMemo(() => extractHeadings(markdown), [markdown]);

  /* --------------------------------- render -------------------------------- */
  return (
    <div className={`container ${theme === "dark" ? "dark" : ""}`}>
      {/* Hidden checkbox for CSS-only sidebar toggle */}
      <input type="checkbox" id="sidebar-toggle" className="sidebar-toggle-input" />
      {/* ─────────── Mobile header (md:hidden) ─────────── */}
      <header className="mobileHeader">
        <a className="logoLink" href="/">
          {logo}
          <span>{title}</span>
        </a>
        <div style={{ flex: 1 }}></div>

        {/* Search button */}
        <button type="button" className="iconButton" aria-label="Open Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </button>

        {/* Sidebar toggle */}
        <label
          htmlFor="sidebar-toggle"
          aria-label="Toggle Sidebar"
          className="iconButton sidebar-toggle-label"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </label>
      </header>

      {/* ─────────── Main layout ─────────── */}
      <main className="main">
        {/* Overlay label to close sidebar when clicked */}
        <label htmlFor="sidebar-toggle" className="sidebar-overlay" aria-hidden="true"></label>
        {/* Left sidebar */}
        <aside className="sidebar">
          <div className="sidebarContent">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "0 16px",
              }}
            >
              {/* Logo for desktop */}
              <div className="desktopLogo" style={{ paddingTop: "4px" }}>
                <a className="logoLink" href="/">
                  {logo}
                  <span>{title}</span>
                </a>
              </div>

              {/* Search button desktop */}
              <button type="button" className="searchButton">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginLeft: "4px" }}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                Search
                <div className="kbdGroup">
                  <kbd className="kbd">⌘</kbd>
                  <kbd className="kbd">K</kbd>
                </div>
              </button>
            </div>

            {/* Navigation */}
            <div className="nav">
              <nav>
                <p className="navTitle">Contents</p>
                <ul className="navList">
                  {headings.map((h) => (
                    <li key={h.id} className="navItem">
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          // Close sidebar on mobile
                          const toggle = document.getElementById('sidebar-toggle') as HTMLInputElement;
                          if (toggle) toggle.checked = false;
                          const element = document.getElementById(h.id);
                          if (element) {
                            const offset = 80; // Header height + some padding
                            const elementPosition =
                              element.getBoundingClientRect().top;
                            const offsetPosition =
                              elementPosition + window.pageYOffset - offset;
                            window.scrollTo({
                              top: offsetPosition,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className={`navLink ${
                          getDepthClass(h.depth) ? getDepthClass(h.depth) : ""
                        }`}
                      >
                        {h.depth > 2 && (
                          <div
                            className="navIndent"
                            style={{ left: (h.depth - 2) * 14 - 5 }}
                          />
                        )}
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Footer with theme toggle */}
            <div className="sidebarFooter">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <a
                  href="https://github.com"
                  className="iconButton"
                  aria-label="View on GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="20"
                    height="20"
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                  </svg>
                </a>
                <button
                  onClick={() =>
                    setTheme((t) => (t === "light" ? "dark" : "light"))
                  }
                  className={`themeToggle ${theme === "dark" ? "dark" : ""}`}
                  aria-label="Toggle Theme"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="themeIcon light"
                  >
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="themeIcon moon"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Page content wrapper */}
        <div className="contentWrapper">
          {/* Main content */}
          <article className="article">
            {/* Markdown content */}
            <div className="markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
              >
                {markdown}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <div style={{ flex: 1 }}></div>
            <div className="footer">
              <a href="#" className="editLink">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                </svg>
                Edit on GitHub
              </a>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default DocsPage;
