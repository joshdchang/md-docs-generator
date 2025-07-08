import type { Plugin as VitePlugin } from "vite";
import {
  extractHeadings,
  markdownToHtml,
  generateTocHtml,
  generateHtmlBody,
} from "./generate";
import fs from "fs";
import path from "path";

import type { Plugin as RollupPlugin } from "rollup";

export interface MarkdownDocsOptions {
  content?: string;
  contentPath?: string;
  title?: string;
  logo?: string;
  outputPath?: string;
  mode?: "development" | "production";
}

export function markdownDocsPlugin(
  options: MarkdownDocsOptions = {}
): VitePlugin {
  const { mode = "production", content = "", contentPath } = options;

  return {
    name: "rollup-plugin-markdown-docs",

    async resolveId(source) {
      if (source === "virtual:markdown-docs") {
        return source;
      }
      return null;
    },

    async load(id) {
      if (id === "virtual:markdown-docs") {
        // In dev mode, return code that dynamically generates HTML
        if (mode === "development") {
          if (contentPath) {
            // Import the markdown file for hot reloading
            return `
              import { extractHeadings, markdownToHtml, generateTocHtml, generateHtmlBody } from "./src/generate";
              import markdownContent from "${contentPath}?raw";
              
              export async function renderDocs() {
                const title = "${options.title || "Documentation"}";
                const logo = \`${options.logo || ""}\`;
                
                const headings = extractHeadings(markdownContent);
                const markdownHtml = await markdownToHtml(markdownContent);
                const tocHtml = generateTocHtml(headings);
                
                document.getElementById("app").innerHTML = generateHtmlBody(markdownHtml, tocHtml, {
                  title,
                  logo,
                });
              }
              
              renderDocs();
              
              if (import.meta.hot) {
                import.meta.hot.accept(() => {
                  renderDocs();
                });
              }
            `;
          } else {
            // Use static content if no path provided
            return `
              import { extractHeadings, markdownToHtml, generateTocHtml, generateHtmlBody } from "./src/generate";
              
              const content = ${JSON.stringify(content)};
              
              export async function renderDocs() {
                const title = "${options.title || "Documentation"}";
                const logo = \`${options.logo || ""}\`;
                
                const headings = extractHeadings(content);
                const markdownHtml = await markdownToHtml(content);
                const tocHtml = generateTocHtml(headings);
                
                document.getElementById("app").innerHTML = generateHtmlBody(markdownHtml, tocHtml, {
                  title,
                  logo,
                });
              }
              
              renderDocs();
              
              if (import.meta.hot) {
                import.meta.hot.accept(() => {
                  renderDocs();
                });
              }
            `;
          }
        }

        // In production mode, just return an empty module
        // The Vite plugin handles the actual HTML generation
        return `export default {};`;
      }

      return null;
    },
  };
}

export function viteMarkdownDocsPlugin(
  options: MarkdownDocsOptions = {}
): VitePlugin {
  let isServe = false;
  let rollupPlugin: RollupPlugin;
  let bodyContent: string = "";
  let markdownFilePath: string | undefined;

  return {
    name: "vite-plugin-markdown-docs",

    async configResolved(config) {
      isServe = config.command === "serve";
      
      // Read content from file if contentPath is provided
      let content = options.content || "";
      if (options.contentPath) {
        markdownFilePath = path.resolve(options.contentPath);
        content = fs.readFileSync(markdownFilePath, "utf-8");
      }
      
      // Create the rollup plugin with the correct mode
      rollupPlugin = markdownDocsPlugin({
        ...options,
        content,
        contentPath: markdownFilePath,
        mode: isServe ? "development" : "production",
      });

      // Generate body content at config time for production
      if (!isServe && content) {
        const { title = "Documentation", logo = "" } = options;
        const headings = extractHeadings(content);
        const markdownHtml = await markdownToHtml(content);
        const tocHtml = generateTocHtml(headings);
        // Only generate the body content, not the full HTML
        bodyContent = generateHtmlBody(markdownHtml, tocHtml, { title, logo });
      }
    },

    resolveId(source, importer, options) {
      // Delegate to the rollup plugin with only the source parameter
      if (rollupPlugin?.resolveId) {
        const handler =
          typeof rollupPlugin.resolveId === "function"
            ? rollupPlugin.resolveId
            : rollupPlugin.resolveId.handler;
        return handler.call(this, source, importer, options);
      }
      return null;
    },

    load(id) {
      // Delegate to the rollup plugin
      if (rollupPlugin?.load) {
        const handler =
          typeof rollupPlugin.load === "function"
            ? rollupPlugin.load
            : rollupPlugin.load.handler;
        return handler.call(this, id);
      }
      return null;
    },

    transform(code, id) {
      // Delegate to the rollup plugin
      if (rollupPlugin?.transform) {
        const handler =
          typeof rollupPlugin.transform === "function"
            ? rollupPlugin.transform
            : rollupPlugin.transform.handler;
        return handler.call(this, code, id);
      }
      return null;
    },

    // Transform the index.html for production builds
    transformIndexHtml(html) {
      if (!isServe && bodyContent) {
        // Replace the body content while preserving Vite's asset processing
        return html.replace(
          /<body[^>]*>.*<\/body>/s,
          `<body>\n${bodyContent}\n</body>`
        );
      }
      return html;
    },
    
    // Handle hot reload for markdown file changes
    handleHotUpdate({ file, server }) {
      if (markdownFilePath && file === markdownFilePath) {
        // Trigger a full reload when the markdown file changes
        server.ws.send({
          type: "full-reload",
        });
        return [];
      }
    },
  };
}
