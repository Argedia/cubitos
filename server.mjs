import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";

const root = process.cwd();
const port = Number(process.env.PORT || 5174);
const dev = process.argv.includes("--dev");
const clients = new Set();
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};
const reloadClient = `<script>const live = new EventSource('/__reload'); live.addEventListener('change', () => location.reload());</script>`;
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (dev && url.pathname === "/__reload") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write(": connected\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }
  try {
    const relative =
      decodeURIComponent(url.pathname).replace(/^\//, "") || "index.html";
    if (
      !/^(index\.html|src\/[\w/.-]+|assets\/[\w/.-]+|Cubitos_[\w.-]+\.pdf)$/.test(
        relative,
      ) ||
      relative.split(/[\\/]/).includes("..")
    )
      throw Error();
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) throw Error();
    let body = await readFile(file);
    if (dev && relative === "index.html")
      body = Buffer.from(
        body.toString().replace("</body>", reloadClient + "</body>"),
      );
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("No encontrado");
  }
});
if (dev) {
  let debounce;
  watch(root, { recursive: true }, (_, file) => {
    if (!file || !/^(src[\\/]|assets[\\/]|index\.html$)/.test(file)) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      for (const client of clients)
        client.write("event: change\ndata: reload\n\n");
    }, 180);
  });
}
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Cubitos: http://localhost:${port}${dev ? " · Recarga automática activada" : ""}`,
  ),
);
