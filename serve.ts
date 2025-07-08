Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  development: true,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`./dist${filePath}`);

    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("Not Found", { status: 404 });
  },
});
