import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";
import slugify from "slugify";
import type { Config } from "config";

export interface Heading {
  depth: number;
  text: string;
  id: string;
}

// Extract headings from markdown
export function extractHeadings(markdown: string): Heading[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const headings: Heading[] = [];

  visit(tree, "heading", (node: any) => {
    const depth = node.depth;
    let text = "";

    const extractText = (node: any): string => {
      if (node.type === "text") {
        return node.value;
      }
      if (node.type === "inlineCode") {
        return node.value;
      }
      if (node.type === "emphasis" || node.type === "strong") {
        return node.children.map(extractText).join("");
      }
      if (node.type === "link") {
        return node.children.map(extractText).join("");
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
}

// Custom rehype plugin to add copy buttons to code blocks
function rehypeAddCopyButtons() {
  return (tree: any) => {
    visit(
      tree,
      "element",
      (node: any, index: number | undefined, parent: any) => {
        if (node.tagName === "pre" && node.children?.[0]?.tagName === "code") {
          // Create a wrapper div with the copy button
          const wrapper = {
            type: "element",
            tagName: "div",
            properties: { className: ["code-block-wrapper"] },
            children: [
              // Keep the original pre element
              { ...node },
              {
                type: "element",
                tagName: "button",
                properties: {
                  className: ["copy-button"],
                  "aria-label": "Copy code",
                  "data-copied": "false",
                },
                children: [
                  {
                    type: "element",
                    tagName: "svg",
                    properties: {
                      className: ["copy-icon"],
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "16",
                      height: "16",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "rect",
                        properties: {
                          x: "9",
                          y: "9",
                          width: "13",
                          height: "13",
                          rx: "2",
                          ry: "2",
                        },
                        children: [],
                      },
                      {
                        type: "element",
                        tagName: "path",
                        properties: {
                          d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
                        },
                        children: [],
                      },
                    ],
                  },
                  {
                    type: "element",
                    tagName: "svg",
                    properties: {
                      className: ["check-icon"],
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "16",
                      height: "16",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "polyline",
                        properties: {
                          points: "20 6 9 17 4 12",
                        },
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          };

          // Replace the node in the parent's children array
          if (parent && index !== undefined) {
            parent.children[index] = wrapper;
          }
        }
      }
    );
  };
}

// Convert markdown to HTML
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeAddCopyButtons)
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}

// Generate table of contents HTML
export function generateTocHtml(headings: Heading[]): string {
  return headings
    .map((h) => {
      const depthClass = h.depth > 2 ? `depth${h.depth}` : "";
      const indent =
        h.depth > 2
          ? /*html*/ `<div class="navIndent" style="left: ${
              (h.depth - 2) * 14 - 5
            }px"></div>`
          : "";
      return /*html*/ `
      <li class="navItem">
        <a href="#${h.id}" class="navLink ${depthClass}">
          ${indent}
          ${h.text}
        </a>
      </li>
    `;
    })
    .join("");
}

// Generate just the body content (for dev mode)
export function generateHtmlBody(
  markdownHtml: string,
  tocHtml: string,
  config: Config
): string {
  const { title = "Docs", logo = "", githubUrl } = config;

  return /*html*/ `
    <div class="container">
      <input type="checkbox" id="sidebar-toggle" class="sidebar-toggle-input" />
      
      <!-- Mobile header -->
      <header class="mobileHeader">
        <a class="logoLink" href="/">
          ${logo}
          <span>${title}</span>
        </a>
        <div style="flex: 1"></div>
        
        <button type="button" class="iconButton" aria-label="Open Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </button>
        
        <label for="sidebar-toggle" aria-label="Toggle Sidebar" class="iconButton sidebar-toggle-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </label>
      </header>
      
      <!-- Main layout -->
      <main class="main">
        <label for="sidebar-toggle" class="sidebar-overlay" aria-hidden="true"></label>
        
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebarContent">
            <div style="display: flex; flex-direction: column; gap: 8px; padding: 0 16px;">
              <div class="desktopLogo" style="padding-top: 4px;">
                <a class="logoLink" href="/">
                  ${logo}
                  <span>${title}</span>
                </a>
              </div>
              
              <button type="button" class="searchButton">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                Search
                <div class="kbdGroup">
                  <kbd class="kbd">⌘</kbd>
                  <kbd class="kbd">K</kbd>
                </div>
              </button>
            </div>
            
            <!-- Navigation -->
            <div class="nav">
              <nav>
                <p class="navTitle">Contents</p>
                <ul class="navList">
                  ${tocHtml}
                </ul>
              </nav>
            </div>
            
            <!-- Footer with theme toggle -->
            <div class="sidebarFooter">
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                ${
                  githubUrl
                    ? `
                  <a href="${githubUrl}" class="iconButton" aria-label="View on GitHub" target="_blank" rel="noopener noreferrer">
                    <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                    </svg>
                  </a>
                `
                    : "<div></div>"
                }
                <button id="theme-toggle" class="themeToggle" aria-label="Toggle Theme">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="themeIcon light">
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="themeIcon moon">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>
        
        <!-- Content wrapper -->
        <div class="contentWrapper">
          <article class="article">
            <div class="markdown">
              ${markdownHtml}
            </div>
          </article>
        </div>
      </main>
    </div>
    
    <!-- Search Popover -->
    <div id="search-overlay" class="searchOverlay">
      <div class="searchPopover">
        <div class="searchHeader">
          <input 
            type="text" 
            id="search-input" 
            class="searchInput" 
            placeholder="Search documentation..."
            autocomplete="off"
            spellcheck="false"
          />
          <button type="button" class="searchClose" aria-label="Close search">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="searchResults" id="search-results">
          <div class="searchEmpty">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <p>Start typing to search</p>
          </div>
        </div>
        <div class="searchFooter">
          <div class="searchHint">
            <kbd class="kbd">↑</kbd>
            <kbd class="kbd">↓</kbd>
            to navigate
          </div>
          <div class="searchHint">
            <kbd class="kbd">Enter</kbd>
            to select
          </div>
          <div class="searchHint">
            <kbd class="kbd">Esc</kbd>
            to close
          </div>
        </div>
      </div>
    </div>
  `;
}
