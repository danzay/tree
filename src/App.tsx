import { useEffect, useState } from 'react'
import './App.css'

const levels = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const statuses = ['', 'new', 'learning', 'reviewing', 'learned', 'known', 'suspended']

interface VocabularySense {
  id: string
  word: string
  definition: string | null
  transcription: string | null
  level: string
  reviewStatus: string
  status: string
  partsOfSpeech: string[]
  translations: Array<{ language: string; text: string }>
}

interface WordsResponse {
  items: VocabularySense[]
  total: number
}

interface StatsResponse {
  senses: number
  headwords: number
  byLevel: Record<string, number>
  byStatus: Record<string, number>
  reconciliation: Record<string, number>
}

function App() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('')
  const [words, setWords] = useState<WordsResponse>({ items: [], total: 0 })
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/stats', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load vocabulary statistics')
        return response.json() as Promise<StatsResponse>
      })
      .then(setStats)
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === 'AbortError')) {
          setError(caught instanceof Error ? caught.message : 'Unknown error')
        }
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const delay = window.setTimeout(() => {
      const params = new URLSearchParams({ limit: '30', language: 'ru' })
      if (search.trim()) params.set('q', search.trim())
      if (level) params.set('level', level)
      if (status) params.set('status', status)

      setLoading(true)
      setError(null)
      fetch(`/api/words?${params}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error('Could not load vocabulary')
          return response.json() as Promise<WordsResponse>
        })
        .then(setWords)
        .catch((caught: unknown) => {
          if (!(caught instanceof DOMException && caught.name === 'AbortError')) {
            setError(caught instanceof Error ? caught.message : 'Unknown error')
          }
        })
        .finally(() => setLoading(false))
    }, 180)

    return () => {
      window.clearTimeout(delay)
      controller.abort()
    }
  }, [search, level, status])

  return (
    <main>
      <header className="page-header">
        <p className="eyebrow">Oxford vocabulary</p>
        <h1>Vocabulary library</h1>
        <p className="intro">Search imported word senses by CEFR level and learning status.</p>
      </header>

      {stats && (
        <section className="stats" aria-label="Vocabulary statistics">
          <div><strong>{stats.senses.toLocaleString()}</strong><span>senses</span></div>
          <div><strong>{stats.headwords.toLocaleString()}</strong><span>headwords</span></div>
          <div><strong>{(stats.reconciliation.official_gap ?? 0).toLocaleString()}</strong><span>official gaps</span></div>
        </section>
      )}

      <section className="filters" aria-label="Vocabulary filters">
        <label className="search-field">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Start typing a word…" />
        </label>
        <label>
          <span>Level</span>
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            {levels.map((item) => <option key={item || 'all'} value={item}>{item || 'All levels'}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statuses.map((item) => <option key={item || 'all'} value={item}>{item ? item.replace('_', ' ') : 'All statuses'}</option>)}
          </select>
        </label>
      </section>

      <div className="results-heading">
        <h2>Word senses</h2>
        <span>{words.total.toLocaleString()} matches</span>
      </div>

      {error && <p className="message error" role="alert">{error}</p>}
      {loading && <p className="message">Loading…</p>}
      {!loading && !error && words.items.length === 0 && <p className="message">No matching vocabulary found.</p>}

      <section className="word-list" aria-live="polite">
        {words.items.map((sense) => (
          <article className="word-card" key={sense.id}>
            <div className="word-title">
              <div>
                <h3>{sense.word}</h3>
                <p>{sense.transcription || 'No transcription'}</p>
              </div>
              <span className="level">{sense.level}</span>
            </div>
            <p className="translation">{sense.translations[0]?.text || 'Translation needs review'}</p>
            <p className="definition">{sense.definition || 'English definition not yet supplied.'}</p>
            <footer>
              <span>{sense.partsOfSpeech.join(' · ') || 'part of speech unknown'}</span>
              <span className={`status status-${sense.status}`}>{sense.status}</span>
              {sense.reviewStatus === 'needs_review' && <span className="review">needs review</span>}
            </footer>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
