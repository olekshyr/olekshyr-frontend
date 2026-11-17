// A small HTTP server that answers with the MSW handlers, so the Next.js
// server (dev, build and start alike) can use the mock by pointing API_URL at it.
import { createServer } from "node:http"
import { pathToFileURL } from "node:url"

import { getResponse } from "msw"

import { handlers } from "./handlers.mjs"

export const MOCK_API_PORT = Number(process.env.MOCK_API_PORT ?? 8081)
export const MOCK_API_URL = `http://localhost:${MOCK_API_PORT}`

export function startMockApi() {
  const server = createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const request = new Request(new URL(req.url ?? "/", MOCK_API_URL), {
      method: req.method,
      body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
      headers: Object.entries(req.headers).flatMap(([name, value]) =>
        value === undefined ? [] : [[name, [value].flat().join(", ")]]
      ),
    })
    const response =
      (await getResponse(handlers, request)) ??
      new Response(null, { status: 404 })

    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(Buffer.from(await response.arrayBuffer()))
  })

  return new Promise((resolve) => {
    server.listen(MOCK_API_PORT, () => {
      console.log(`mock API on ${MOCK_API_URL}`)
      resolve(server)
    })
  })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await startMockApi()
}
