import { watch } from "fs";
import config from "./config";
import { build } from "./build";
import type { ServerWebSocket } from "bun";

// Store WebSocket clients
const clients = new Set<ServerWebSocket<unknown>>();

// Initial build
await build();

// Set up file watcher for content.md
const watcher = watch(config.contentPath, async (event) => {
  console.log(`\n📝 ${config.contentPath} ${event}, rebuilding...`);
  try {
    await build();
    // Notify all connected clients to reload
    for (const client of clients) {
      client.send("reload");
    }
  } catch (error) {
    console.error("Build error:", error);
  }
});

// Hot reload script to inject into HTML
const hotReloadScript = `
<script>
(function() {
  const ws = new WebSocket('ws://localhost:3001');
  ws.onmessage = (event) => {
    if (event.data === 'reload') {
      location.reload();
    }
  };
  ws.onclose = () => {
    // Try to reconnect after 1 second
    setTimeout(() => location.reload(), 1000);
  };
})();
</script>
`;

// Set up WebSocket server for hot reload
const wsServer = Bun.serve({
  port: 3001,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return; // WebSocket upgrade successful
    }
    return new Response("WebSocket server", { status: 200 });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
    },
    close(ws) {
      clients.delete(ws);
    },
    message(ws, message) {
      // Handle messages if needed
    },
  },
});

// Set up dev server
const server = Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  development: true,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;

    if (filePath === "/index.html") {
      // Read the HTML file and inject hot reload script
      const file = Bun.file(`./dist/index.html`);
      if (await file.exists()) {
        let html = await file.text();
        // Inject hot reload script before closing body tag
        html = html.replace("</body>", `${hotReloadScript}</body>`);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    const file = Bun.file(`./dist${filePath}`);
    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`\n🚀 Dev server running at http://localhost:${server.port}`);
console.log(`🔄 Hot reload WebSocket on port ${wsServer.port}`);
console.log(`👀 Watching ${config.contentPath} for changes...`);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\nShutting down...");
  watcher.close();
  server.stop();
  wsServer.stop();
  process.exit(0);
});
