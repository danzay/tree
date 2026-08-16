import { randomUUID, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'
import { createVocabularyMcpServer, ensureMcpApi, stopManagedMcpApi } from './mcp.ts'

const DEFAULT_HTTP_PORT = 3103
const MAX_REQUEST_BYTES = 1_048_576
const MCP_PATH = '/mcp'
const HEALTH_PATH = '/health'
const HTTP_HOST = process.env.MCP_HTTP_HOST ?? '127.0.0.1'
const HTTP_PORT = Number.parseInt(process.env.MCP_HTTP_PORT ?? String(DEFAULT_HTTP_PORT), 10)
const CONFIGURED_HTTP_TOKEN = process.env.MCP_HTTP_TOKEN ?? process.env.MCP_API_TOKEN

if (!Number.isInteger(HTTP_PORT) || HTTP_PORT < 1 || HTTP_PORT > 65_535) {
  throw new Error('MCP_HTTP_PORT must be an integer between 1 and 65535')
}

if (!CONFIGURED_HTTP_TOKEN) {
  throw new Error('MCP_HTTP_TOKEN or MCP_API_TOKEN is required')
}

const MCP_HTTP_TOKEN: string = CONFIGURED_HTTP_TOKEN
const TRANSPORTS = new Map<string, StreamableHTTPServerTransport>()

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { 'content-type': 'application/json' })
  response.end(JSON.stringify(body))
}

function sendMcpError(response: ServerResponse, statusCode: number, message: string): void {
  sendJson(response, statusCode, {
    jsonrpc: '2.0',
    error: { code: -32_000, message },
    id: null,
  })
}

function tokenMatches(authorization: string | undefined): boolean {
  const prefix = 'Bearer '
  if (!authorization?.startsWith(prefix)) {
    return false
  }

  const actual = Buffer.from(authorization.slice(prefix.length))
  const expected = Buffer.from(MCP_HTTP_TOKEN)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

async function parseJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let receivedBytes = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    receivedBytes += buffer.length
    if (receivedBytes > MAX_REQUEST_BYTES) {
      throw new Error('Request body is too large')
    }

    chunks.push(buffer)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

function findSession(request: IncomingMessage): StreamableHTTPServerTransport | undefined {
  const sessionId = request.headers['mcp-session-id']
  return typeof sessionId === 'string' ? TRANSPORTS.get(sessionId) : undefined
}

async function createSession(): Promise<StreamableHTTPServerTransport> {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: randomUUID,
    onsessioninitialized: (sessionId) => {
      TRANSPORTS.set(sessionId, transport)
    },
  })
  transport.onclose = () => {
    const sessionId = transport.sessionId
    if (sessionId) {
      TRANSPORTS.delete(sessionId)
    }
  }

  await createVocabularyMcpServer().connect(transport)
  return transport
}

async function handleMcpRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (!tokenMatches(request.headers.authorization)) {
    response.setHeader('www-authenticate', 'Bearer')
    sendMcpError(response, 401, 'Unauthorized')
    return
  }

  if (request.method === 'POST') {
    const body = await parseJsonBody(request)
    let transport = findSession(request)

    if (!transport && isInitializeRequest(body)) {
      transport = await createSession()
    }

    if (!transport) {
      sendMcpError(response, 400, 'Missing or invalid MCP session')
      return
    }

    await transport.handleRequest(request, response, body)
    return
  }

  if (request.method === 'GET' || request.method === 'DELETE') {
    const transport = findSession(request)
    if (!transport) {
      sendMcpError(response, 400, 'Missing or invalid MCP session')
      return
    }

    await transport.handleRequest(request, response)
    return
  }

  response.setHeader('allow', 'GET, POST, DELETE')
  sendMcpError(response, 405, 'Method not allowed')
}

await ensureMcpApi()

const HTTP_SERVER = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
      .pathname

    if (pathname === HEALTH_PATH && request.method === 'GET') {
      sendJson(response, 200, { status: 'ok', service: 'oxford-vocabulary-mcp' })
      return
    }

    if (pathname !== MCP_PATH) {
      sendJson(response, 404, { error: 'Not found' })
      return
    }

    await handleMcpRequest(request, response)
  } catch (error) {
    const message =
      error instanceof SyntaxError ? 'Invalid JSON request body' : 'MCP request failed'
    if (!response.headersSent) {
      sendMcpError(response, error instanceof SyntaxError ? 400 : 500, message)
    }
  }
})

async function shutdown(): Promise<void> {
  await Promise.allSettled([...TRANSPORTS.values()].map((transport) => transport.close()))
  HTTP_SERVER.close()
  stopManagedMcpApi()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

HTTP_SERVER.listen(HTTP_PORT, HTTP_HOST, () => {
  console.log(`Vocabulary MCP HTTP server listening on http://${HTTP_HOST}:${HTTP_PORT}${MCP_PATH}`)
})
