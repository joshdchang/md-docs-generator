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

// Convert markdown to HTML
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight)
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
          ? `<div class="navIndent" style="left: ${
              (h.depth - 2) * 14 - 5
            }px"></div>`
          : "";
      return `
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

// Generate the full HTML page
export function generateHtmlPage(
  markdownHtml: string,
  tocHtml: string,
  config: any = {}
): string {
  const { title = "Docs", logo = "", hero = null } = config;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script type="module" src="/src/main.ts"></script>
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body>
  ${generateHtmlBody(markdownHtml, tocHtml, { title, logo })}
</body>
</html>`;
}

// Generate just the body content (for dev mode)
export function generateHtmlBody(
  markdownHtml: string,
  tocHtml: string,
  config: any = {}
): string {
  const { title = "Docs", logo = "" } = config;

  return `
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
                <a href="https://github.com" class="iconButton" aria-label="View on GitHub" target="_blank" rel="noopener noreferrer">
                  <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                  </svg>
                </a>
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
            
            <div style="flex: 1"></div>
            <div class="footer">
              <a href="#" class="editLink">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  `;
}