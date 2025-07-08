import {
  extractHeadings,
  markdownToHtml,
  generateTocHtml,
  generateHtmlBody,
} from "./generate";
import config from "./config";
import { readdir, rm } from "node:fs/promises";

const { contentPath, title } = config;

export async function build() {
  console.log("Building documentation...");

  console.log("Deleting dist directory...");
  if (await Bun.file("dist").exists()) {
    await rm("dist", { recursive: true, force: true });
  }

  // Generate HTML content
  console.log("Generating HTML content...");
  const content = await Bun.file(contentPath).text();
  const headings = extractHeadings(content);
  const markdownHtml = await markdownToHtml(content);
  const tocHtml = generateTocHtml(headings);
  const bodyContent = generateHtmlBody(markdownHtml, tocHtml, config);

  // Bundle with a single command - CSS imports are handled automatically
  console.log("Bundling with Bun...");
  await Bun.build({
    entrypoints: ["./main.ts"],
    outdir: "./dist",
    minify: true,
  });

  // Copy static assets
  console.log("Copying static assets...");
  const publicFiles = await readdir("public");
  for (const file of publicFiles) {
    console.log(`Copying ${file} to dist/`);
    await Bun.write(`dist/${file}`, Bun.file(`public/${file}`));
  }

  // Generate HTML
  const html = /*html*/ `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <link rel="stylesheet" href="/main.css">
  </head>
  <body>
  ${bodyContent}
  <script type="module" src="/main.js"></script>
  </body>
  </html>`;

  console.log("Writing index.html...");
  await Bun.write("dist/index.html", html);

  console.log("✓ Build complete!");
}

build().catch(console.error);
