import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { MessageSquare, Send } from 'lucide-react'

import { agentTargets } from '../data/agents'
import type { ChatMessage } from '../types/chat'
import { formatRelativeIso } from '../lib/format'
import { useOfficeStore } from '../store/useOfficeStore'

const baseUrl = '/api/agent-chat'

export function AgentChatPanel() {
  const selectedAgentId = useOfficeStore((state) => state.selectedAgentId) ?? 'alicia'
  const agent = useMemo(() => agentTargets.find((entry) => entry.id === selectedAgentId) ?? agentTargets[0], [selectedAgentId])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const value = text.trim()
    if (!value) return

    const outgoing: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: value,
      timestamp: new Date().toISOString(),
    }

    setMessages((current) => [...current, outgoing])
    setText('')
    setPending(true)
    setError(null)

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          ...(agent.sessionKey ? { sessionKey: agent.sessionKey } : {}),
          ...(!agent.sessionKey && agent.label ? { label: agent.label } : {}),
          message: value,
        }),
      })

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`)
      }

      const data = await response.json()
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.reply ?? 'No reply returned.',
        timestamp: new Date().toISOString(),
      }
      setMessages((current) => [...current, reply])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'system',
          text: `Chat failed: ${message}`,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="panel chat-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Direct chat</p>
          <h2>{agent.name}</h2>
        </div>
        <MessageSquare size={18} />
      </div>

      <div className="chat-thread">
        {messages.length === 0 ? (
          <div className="chat-empty">Click an agent, then start chatting here.</div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`chat-bubble role-${message.role}`}>
              <p>{message.text}</p>
              <span>{formatRelativeIso(message.timestamp)}</span>
            </article>
          ))
        )}
      </div>

      <div className="desk-actions">
        <button
          type="button"
          className="secondary-action"
          disabled={pending}
          onClick={async () => {
            setPending(true)
            setError(null)
            try {
              const response = await fetch('/api/agent-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: agent.id, action: 'focus' }),
              })
              const data = await response.json()
              if (!response.ok) throw new Error(data.error ?? `Task request failed with ${response.status}`)
              setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'system', text: data.reply ?? 'Task started.', timestamp: new Date().toISOString() }])
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
              setPending(false)
            }
          }}
        >
          Run from desk
        </button>
      </div>
      <form className="chat-composer" onSubmit={submit}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder={`Message ${agent.name}...`} />
        <button type="submit" disabled={pending}>
          <Send size={16} />
        </button>
      </form>
      {error ? <div className="login-error">{error}</div> : null}
    </section>
  )
}
