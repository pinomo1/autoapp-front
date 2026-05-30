import http from 'node:http'
import { fileURLToPath } from 'url'
import path from 'node:path'
import fs from 'fs'

// Import the compiled server entry
import * as serverModule from './dist/server/server.js'

const port = process.env.PORT ? Number(process.env.PORT) : 3000
const host = process.env.HOST || '0.0.0.0'

// serverModule.default should be an object created by createServerEntry
// with a `fetch` method that accepts a Request and returns a Response.
const entry = serverModule.default ?? serverModule
if (!entry || typeof entry.fetch !== 'function') {
  console.error('Server entry does not export a `.fetch` handler. Aborting.')
  process.exit(1)
}

async function handle(nodeReq, nodeRes) {
  try {
    const url = new URL(nodeReq.url || '/', `http://${nodeReq.headers.host || `${host}:${port}`}`)
    const pathname = decodeURIComponent(url.pathname)

    // Serve static client files (Vite build output) directly from dist/client for common asset paths
    if (nodeReq.method === 'GET') {
      // Restrict to known public paths
      const publicPrefixes = ['/assets/', '/favicon.ico', '/logo192.png', '/logo512.png', '/manifest.json', '/robots.txt']
      const shouldServe = publicPrefixes.some((p) => pathname === p || pathname.startsWith(p))
      if (shouldServe) {
        // Prevent path traversal
        const clientRoot = path.resolve(process.cwd(), 'dist', 'client')
        const fsPath = path.join(clientRoot, pathname)
        if (fsPath.indexOf(clientRoot) === 0 && fs.existsSync(fsPath) && fs.statSync(fsPath).isFile()) {
          const ext = path.extname(fsPath).slice(1).toLowerCase()
          const contentType = (() => {
            switch (ext) {
              case 'css': return 'text/css; charset=utf-8'
              case 'js': return 'application/javascript; charset=utf-8'
              case 'json': return 'application/json; charset=utf-8'
              case 'png': return 'image/png'
              case 'jpg':
              case 'jpeg': return 'image/jpeg'
              case 'svg': return 'image/svg+xml'
              case 'ico': return 'image/x-icon'
              case 'woff2': return 'font/woff2'
              case 'woff': return 'font/woff'
              case 'map': return 'application/octet-stream'
              default: return 'application/octet-stream'
            }
          })()
          const stat = fs.statSync(fsPath)
          nodeRes.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': String(stat.size),
            'Cache-Control': ext === 'css' || ext === 'js' || pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600'
          })
          const stream = fs.createReadStream(fsPath)
          stream.pipe(nodeRes)
          return
        }
      }
    }

    // Build a Request from the Node incoming message
    const headers = new Headers()
    for (const [key, value] of Object.entries(nodeReq.headers)) {
      if (value === undefined) continue
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v)
      } else {
        headers.set(key, String(value))
      }
    }

    const requestInit = {
      method: nodeReq.method,
      headers,
      // stream the body if present
      body: nodeReq.method === 'GET' || nodeReq.method === 'HEAD' ? null : nodeReq,
    }

    const req = new Request(url.toString(), requestInit)
    const res = await entry.fetch(req)

    // copy status and headers
    nodeRes.writeHead(res.status, Object.fromEntries(res.headers))

    // stream body
    if (res.body) {
      const reader = res.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        nodeRes.write(Buffer.from(value))
      }
      nodeRes.end()
    } else {
      nodeRes.end()
    }
  } catch (err) {
    console.error('Unhandled error in request handler:', err)
    try {
      nodeRes.writeHead(500, { 'Content-Type': 'text/plain' })
      nodeRes.end('Internal Server Error')
    } catch {}
  }
}

const server = http.createServer(handle)
server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`)
})

// Graceful shutdown
process.on('SIGINT', () => server.close(() => process.exit(0)))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
