import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Brain, PlusCircle, Sparkles } from 'lucide-react'

import { formatRelativeIso } from '../lib/format'
import { useOfficeStore } from '../store/useOfficeStore'

const bucketOptions = [
  { value: 'long_term_memories', label: 'Memory' },
  { value: 'lessons_learned', label: 'Lesson' },
  { value: 'reflections', label: 'Reflection' },
  { value: 'mistakes', label: 'Mistake' },
  { value: 'context_summaries', label: 'Context summary' },
] as const

export function BrainPanel() {
  const selectedAgentId = useOfficeStore((state) => state.selectedAgentId)
  const brains = useOfficeStore((state) => state.brains ?? [])
  const brain = useMemo(() => brains.find((entry) => entry.agentId === selectedAgentId) ?? null, [brains, selectedAgentId])
  const [bucket, setBucket] = useState<(typeof bucketOptions)[number]['value']>('long_term_memories')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!brain || !title.trim() || !detail.trim()) return
    setPending(true)
    setResult(null)
    setError(null)
    try {
      const response = await fetch('/api/brain-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: brain.agentId, bucket, title: title.trim(), detail: detail.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? `Request failed with ${response.status}`)
      setResult(data.message ?? 'Saved.')
      setTitle('')
      setDetail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setPending(false)
    }
  }

  if (!brain) return null

  return (
    <section className="panel brain-detail-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Brain detail</p>
          <h2>{brain.brainId}</h2>
        </div>
        <Brain size={18} />
      </div>

      <div className="detail-card-grid">
        <div className="detail-card"><span>Agent</span><strong>{brain.agentId}</strong></div>
        <div className="detail-card"><span>Updated</span><strong>{brain.updatedAt ? formatRelativeIso(brain.updatedAt) : 'ready'}</strong></div>
        <div className="detail-card"><span>Read access</span><strong>{brain.isolation.read.join(', ')}</strong></div>
        <div className="detail-card"><span>Write access</span><strong>{brain.isolation.write.join(', ')}</strong></div>
      </div>

      <div className="brain-preview-block">
        <div className="panel-header compact-head">
          <strong>Compact context pack</strong>
          <Sparkles size={16} />
        </div>
        <div className="brain-context-list">
          {[...(brain.contextPack?.summaries ?? []), ...(brain.contextPack?.lessons ?? []), ...(brain.contextPack?.instructions ?? [])].map((item, index) => (
            <p key={`${brain.agentId}-ctx-${index}`}>{item}</p>
          ))}
          {!((brain.contextPack?.summaries?.length ?? 0) + (brain.contextPack?.lessons?.length ?? 0) + (brain.contextPack?.instructions?.length ?? 0)) ? (
            <div className="chat-empty">No compact context yet.</div>
          ) : null}
        </div>
      </div>

      <form className="brain-form" onSubmit={submit}>
        <div className="panel-header compact-head">
          <strong>Add memory / lesson / reflection</strong>
          <PlusCircle size={16} />
        </div>
        <select value={bucket} onChange={(event) => setBucket(event.target.value as typeof bucket)}>
          {bucketOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Detail" rows={4} />
        <button type="submit" className="primary-action" disabled={pending}>{pending ? 'Saving...' : 'Save to brain'}</button>
      </form>

      {result ? <div className="success-note">{result}</div> : null}
      {error ? <div className="login-error">{error}</div> : null}
    </section>
  )
}
