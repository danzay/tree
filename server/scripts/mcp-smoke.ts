import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['--import', 'tsx', 'server/mcp.ts'],
  cwd: projectDirectory,
  env: Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
  ),
  stderr: 'pipe',
})
const client = new Client({ name: 'vocabulary-smoke-test', version: '1.0.0' })

try {
  await client.connect(transport)
  const tools = await client.listTools()
  const search = await client.callTool({
    name: 'search_vocabulary',
    arguments: { query: 'to differ', includeNeedsReview: true, limit: 5 },
  })
  const searchData = search.structuredContent as { items?: Array<{ id: string; word: string }> }
  const match = searchData.items?.find((item) => item.word === 'to differ')
  if (!match) throw new Error('MCP search did not find to differ')

  const detail = await client.callTool({
    name: 'get_word_sense',
    arguments: { senseId: Number(match.id) },
  })
  const detailData = detail.structuredContent as {
    id?: string
    definition?: string | null
    updatedAt?: string
  }
  if (!detailData.updatedAt) throw new Error('MCP detail did not return updatedAt')

  const write = await client.callTool({
    name: 'set_definition',
    arguments: {
      senseId: Number(match.id),
      definition: detailData.definition ?? null,
      expectedUpdatedAt: detailData.updatedAt,
    },
  })
  const writeData = write.structuredContent as { updatedAt?: string }
  if (!writeData.updatedAt) throw new Error('MCP write did not return updatedAt')

  console.log(`MCP smoke test passed: ${tools.tools.length} tools, read and audited write succeeded`)
} finally {
  await client.close()
}
