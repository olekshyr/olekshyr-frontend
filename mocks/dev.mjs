// `pnpm dev:mock`: the mock API plus `next dev` pointed at it.
// Extra arguments replace `dev`, e.g. `node mocks/dev.mjs build`.
import { spawn } from "node:child_process"

import { MOCK_API_URL, startMockApi } from "./server.mjs"

const args = process.argv.slice(2)
const server = await startMockApi()

const child = spawn(
  "pnpm",
  ["exec", "next", ...(args.length > 0 ? args : ["dev"])],
  {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      API_URL: MOCK_API_URL,
      PUBLIC_API_KEY: process.env.PUBLIC_API_KEY || "mock-key",
      // MyAnimeList, mocked too
      MAL_API_URL: `${MOCK_API_URL}/v2`,
      MAL_CLIENT_ID: "mock-client-id",
      MAL_USERNAME: "mock-user",
    },
  }
)

child.on("exit", (code) => {
  server.close()
  process.exit(code ?? 0)
})
