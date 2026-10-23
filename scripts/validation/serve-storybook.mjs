import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, resolve, sep } from "node:path"

const root = resolve("storybook-static")
const port = Number(process.argv[2])

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
}

if (!existsSync(resolve(root, "index.html")) || !Number.isInteger(port) || port <= 0) {
  throw new Error("Built Storybook and a valid isolated port are required")
}

createServer((request, response) => {
  let file

  try {
    const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname)

    file = resolve(root, `.${path === "/" ? "/index.html" : path}`)
  } catch {
    response.writeHead(400).end()

    return
  }

  if (!file.startsWith(`${root}${sep}`) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end()

    return
  }

  response.writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" })
  createReadStream(file).pipe(response)
}).listen(port, "127.0.0.1")
