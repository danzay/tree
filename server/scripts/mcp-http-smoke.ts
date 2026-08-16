import { spawn } from 'node:child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const HTTP_PORT = Number.parseInt(process.env.MCP_HTTP_PORT ?? '3103', 10)
const HTTP_TOKEN = process.env.MCP_HTTP_TOKEN ?? process.env.MCP_API_TOKEN
const HTTP_URL = new URL(`http://127.0.0.1:${HTTP_PORT}/mcp`)

if (!HTTP_TOKEN) {
  throw new Error('MCP_HTTP_TOKEN or MCP_API_TOKEN is required')
}

const server = spawn(process.execPath, ['--import', 'tsx', 'server/mcp-http.ts'], {
  env: process.env,
  stdio: 'ignore',
})

async function waitForServer(): Promise<void> {
  const healthUrl = new URL('/health', HTTP_URL)
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(healthUrl)
      if (response.ok) {
        return
      }
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error('MCP HTTP server did not become healthy')
}

try {
  await waitForServer()
  const unauthorizedResponse = await fetch(HTTP_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'unauthorized-smoke', version: '1.0.0' },
      },
    }),
  })
  if (unauthorizedResponse.status !== 401) {
    throw new Error('MCP HTTP endpoint accepted an unauthenticated request')
  }

  const client = new Client({ name: 'mcp-http-smoke', version: '1.0.0' })
  const transport = new StreamableHTTPClientTransport(HTTP_URL, {
    requestInit: { headers: { authorization: `Bearer ${HTTP_TOKEN}` } },
  })

  await client.connect(transport)
  const tools = await client.listTools()
  if (!tools.tools.some((tool) => tool.name === 'search_vocabulary')) {
    throw new Error('MCP HTTP tool discovery did not return search_vocabulary')
  }

  await client.close()
  console.log(`MCP HTTP smoke test passed: ${tools.tools.length} tools discovered`)
} finally {
  if (server.exitCode === null) {
    server.kill('SIGTERM')
  }
}
