import http from 'node:http'
import { fileURLToPath } from 'url'
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
