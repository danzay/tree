import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { CEFR_LEVELS, PART_OF_SPEECH_CODES, PROGRESS_STATUSES } from './lib/vocabulary.ts'

const PROJECT_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const API_PORT = Number.parseInt(process.env.MCP_API_PORT ?? '3102', 10)
const API_BASE = `http://127.0.0.1:${API_PORT}`
const MCP_API_TOKEN = process.env.MCP_API_TOKEN

if (!MCP_API_TOKEN) {
  throw new Error('MCP_API_TOKEN is required. Run npm run mcp:token first.')
}

let managedApi: ChildProcess | undefined

async function apiRequest(pathname: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}${pathname}`, {
    ...init,
    headers: {
      authorization: `Bearer ${MCP_API_TOKEN}`,
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const body = (await response.json()) as Record<string, unknown>
  if (!response.ok) {
    throw new Error(
      typeof body.error === 'string' ? body.error : `Vocabulary API returned ${response.status}`,
    )
  }

  return body
}

async function apiIsHealthy(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/mcp/health`, {
      headers: { authorization: `Bearer ${MCP_API_TOKEN}` },
    })
    if (!response.ok) {
      return false
    }

    const body = (await response.json()) as { service?: string }
    return body.service === 'vocabulary-mcp-proxy'
  } catch {
    return false
  }
}

async function ensureApi(): Promise<void> {
  if (await apiIsHealthy()) {
    return
  }

  const tsxExecutable = path.join(PROJECT_DIRECTORY, 'node_modules/.bin/tsx')
  const apiEntry = path.join(PROJECT_DIRECTORY, 'server/index.ts')
  managedApi = spawn(tsxExecutable, [apiEntry], {
    cwd: PROJECT_DIRECTORY,
    env: { ...process.env, PORT: String(API_PORT) },
    stdio: 'ignore',
  })

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    if (await apiIsHealthy()) {
      return
    }

    if (managedApi.exitCode !== null) {
      break
    }
  }

  throw new Error('Vocabulary API could not be started')
}

function stopManagedApi() {
  if (managedApi?.exitCode === null) {
    managedApi.kill('SIGTERM')
  }
}

process.once('SIGINT', stopManagedApi)
process.once('SIGTERM', stopManagedApi)
process.once('exit', stopManagedApi)

function result(data: Record<string, unknown>, message: string) {
  return {
    structuredContent: data,
    content: [{ type: 'text' as const, text: message }],
  }
}

const MCP_SERVER = new McpServer(
  { name: 'oxford-vocabulary', version: '1.0.0' },
  {
    instructions:
      'Use sense IDs, never spelling alone, for updates. Before every write, call get_word_sense and pass its updatedAt value. Only write information explicitly requested or approved by the user. Never invent dictionary facts. No tool can run arbitrary SQL or delete data.',
  },
)

MCP_SERVER.registerTool(
  'search_vocabulary',
  {
    title: 'Search vocabulary',
    description:
      'Find vocabulary senses by headword prefix, CEFR level, part of speech, or learning status.',
    inputSchema: {
      query: z.string().trim().max(100).optional(),
      level: z.enum(CEFR_LEVELS).optional(),
      status: z.enum(PROGRESS_STATUSES).optional(),
      partOfSpeech: z.enum(PART_OF_SPEECH_CODES).optional(),
      language: z
        .string()
        .regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/)
        .default('ru'),
      includeNeedsReview: z.boolean().default(false),
      limit: z.number().int().min(1).max(50).default(20),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async (input) => {
    const query = new URLSearchParams({
      language: input.language,
      limit: String(input.limit),
      includeNeedsReview: String(input.includeNeedsReview),
    })
    if (input.query) {
      query.set('q', input.query)
    }

    if (input.level) {
      query.set('level', input.level)
    }

    if (input.status) {
      query.set('status', input.status)
    }

    if (input.partOfSpeech) {
      query.set('partOfSpeech', input.partOfSpeech)
    }

    const data = await apiRequest(`/api/words?${query}`)
    return result(data, `Found ${String(data.total ?? 0)} matching vocabulary senses.`)
  },
)

MCP_SERVER.registerTool(
  'get_word_sense',
  {
    title: 'Get word sense',
    description:
      'Get complete information for one vocabulary sense, including its concurrency-safe updatedAt value.',
    inputSchema: { senseId: z.number().int().positive() },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  async ({ senseId }) => {
    const data = await apiRequest(`/api/mcp/word-senses/${senseId}`)
    return result(data, `Loaded sense ${senseId} for ${String(data.word ?? 'the requested word')}.`)
  },
)

const WRITE_METADATA = {
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
} as const

MCP_SERVER.registerTool(
  'set_definition',
  {
    title: 'Set English definition',
    description:
      'Set or clear the English definition for a specific sense after the user approves it.',
    inputSchema: {
      senseId: z.number().int().positive(),
      definition: z.string().trim().min(1).max(4_000).nullable(),
      expectedUpdatedAt: z.iso.datetime(),
    },
    ...WRITE_METADATA,
  },
  async ({ senseId, definition, expectedUpdatedAt }) => {
    const data = await apiRequest(`/api/mcp/word-senses/${senseId}/definition`, {
      method: 'PATCH',
      body: JSON.stringify({ definition, expectedUpdatedAt }),
    })
    return result(data, `Updated the English definition for sense ${senseId}.`)
  },
)

MCP_SERVER.registerTool(
  'set_transcription',
  {
    title: 'Set transcription',
    description: 'Set or clear the pronunciation transcription for a specific sense.',
    inputSchema: {
      senseId: z.number().int().positive(),
      transcription: z.string().trim().min(1).max(300).nullable(),
      expectedUpdatedAt: z.iso.datetime(),
    },
    ...WRITE_METADATA,
  },
  async ({ senseId, transcription, expectedUpdatedAt }) => {
    const data = await apiRequest(`/api/mcp/word-senses/${senseId}/transcription`, {
      method: 'PATCH',
      body: JSON.stringify({ transcription, expectedUpdatedAt }),
    })
    return result(data, `Updated the transcription for sense ${senseId}.`)
  },
)

MCP_SERVER.registerTool(
  'set_cefr_level',
  {
    title: 'Set CEFR level',
    description: 'Set the A1-C2 level for a specific sense after confirming the intended meaning.',
    inputSchema: {
      senseId: z.number().int().positive(),
      level: z.enum(CEFR_LEVELS),
      expectedUpdatedAt: z.iso.datetime(),
    },
    ...WRITE_METADATA,
  },
  async ({ senseId, level, expectedUpdatedAt }) => {
    const data = await apiRequest(`/api/mcp/word-senses/${senseId}/level`, {
      method: 'PATCH',
      body: JSON.stringify({ level, expectedUpdatedAt }),
    })
    return result(data, `Updated the CEFR level for sense ${senseId} to ${level}.`)
  },
)

MCP_SERVER.registerTool(
  'set_translation',
  {
    title: 'Set translation',
    description:
      'Set the primary translation of a specific sense in a language. Provide languageName when introducing a new language code.',
    inputSchema: {
      senseId: z.number().int().positive(),
      language: z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/),
      languageName: z.string().trim().min(1).max(100).optional(),
      translation: z.string().trim().min(1).max(4_000),
      expectedUpdatedAt: z.iso.datetime(),
    },
    ...WRITE_METADATA,
  },
  async ({ senseId, language, languageName, translation, expectedUpdatedAt }) => {
    const data = await apiRequest(
      `/api/mcp/word-senses/${senseId}/translations/${encodeURIComponent(language)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ languageName, translation, expectedUpdatedAt }),
      },
    )
    return result(data, `Updated the ${language} translation for sense ${senseId}.`)
  },
)

MCP_SERVER.registerTool(
  'add_collocation',
  {
    title: 'Add collocation',
    description:
      'Add a collocation to a specific word sense. Repeating the same text is safe and does not create a duplicate.',
    inputSchema: {
      senseId: z.number().int().positive(),
      collocation: z.string().trim().min(1).max(500),
      expectedUpdatedAt: z.iso.datetime(),
    },
    ...WRITE_METADATA,
  },
  async ({ senseId, collocation, expectedUpdatedAt }) => {
    const data = await apiRequest(`/api/mcp/word-senses/${senseId}/collocations`, {
      method: 'POST',
      body: JSON.stringify({ collocation, expectedUpdatedAt }),
    })
    return result(data, `Added the collocation to sense ${senseId}.`)
  },
)

MCP_SERVER.registerTool(
  'set_parts_of_speech',
  {
    title: 'Set parts of speech',
    description:
      'Replace all grammatical classes for a sense. Call get_word_sense first and confirm the complete replacement list.',
    inputSchema: {
      senseId: z.number().int().positive(),
      partsOfSpeech: z.array(z.enum(PART_OF_SPEECH_CODES)).min(1).max(12),
      expectedUpdatedAt: z.iso.datetime(),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ senseId, partsOfSpeech, expectedUpdatedAt }) => {
    const data = await apiRequest(`/api/mcp/word-senses/${senseId}/parts-of-speech`, {
      method: 'PUT',
      body: JSON.stringify({ partsOfSpeech, expectedUpdatedAt }),
    })
    return result(data, `Replaced the parts of speech for sense ${senseId}.`)
  },
)

MCP_SERVER.registerTool(
  'set_learning_status',
  {
    title: 'Set learning status',
    description:
      'Set the single learner status for a specific sense and record the origin as manual.',
    inputSchema: {
      senseId: z.number().int().positive(),
      status: z.enum(PROGRESS_STATUSES),
      expectedUpdatedAt: z.iso.datetime(),
    },
    ...WRITE_METADATA,
  },
  async ({ senseId, status, expectedUpdatedAt }) => {
    const data = await apiRequest(`/api/mcp/word-senses/${senseId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, expectedUpdatedAt }),
    })
    return result(data, `Updated the learning status for sense ${senseId} to ${status}.`)
  },
)

await ensureApi()
await MCP_SERVER.connect(new StdioServerTransport())
