import { randomBytes } from 'node:crypto'
import { chmod, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(scriptDirectory, '../../.env')
let envText = await readFile(envPath, 'utf8')
let changed = false

if (!/^MCP_API_TOKEN=\S+$/m.test(envText)) {
  const separator = envText.endsWith('\n') ? '' : '\n'
  const token = randomBytes(32).toString('base64url')
  envText = `${envText}${separator}MCP_API_TOKEN=${token}\n`
  changed = true
}

if (!/^MCP_API_PORT=\d+$/m.test(envText)) {
  const separator = envText.endsWith('\n') ? '' : '\n'
  envText = `${envText}${separator}MCP_API_PORT=3102\n`
  changed = true
}

if (changed) {
  await writeFile(envPath, envText, { mode: 0o600 })
}

await chmod(envPath, 0o600)
console.log(
  changed
    ? 'Local MCP credentials and port were configured in .env without displaying secrets'
    : 'Local MCP credentials and port are already configured',
)
