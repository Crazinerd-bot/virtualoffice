import { useEffect } from 'react'
import './App.css'
import { OfficeCanvas } from './components/OfficeCanvas'
import { AgentChatPanel } from './components/AgentChatPanel'
import { BrainPanel } from './components/BrainPanel'
import { useOfficePolling } from './hooks/useOfficePolling'
import { useOfficeTicker } from './hooks/useOfficeTicker'
import { useOfficeStore } from './store/useOfficeStore'

function App() {
  const error = useOfficePolling()
  useOfficeTicker()

  const gateway = useOfficeStore((state) => state.gateway)
  const agents = useOfficeStore((state) => state.agents)
  const tasks = useOfficeStore((state) => state.tasks)
  const activity = useOfficeStore((state) => state.activity)
  const warnings = useOfficeStore((state) => state.warnings ?? [])
  const selectedAgentId = useOfficeStore((state) => state.selectedAgentId)
  const setSelectedAgentId = useOfficeStore((state) => state.setSelectedAgentId)

  useEffect(() => {
    if (!selectedAgentId && agents.length) setSelectedAgentId(agents[0].id)
  }, [agents, selectedAgentId, setSelectedAgentId])

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0] ?? null
  const selectedTask = tasks.find((task) => task.id.includes(selectedAgent?.id ?? '')) ?? tasks[0] ?? null

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">OpenClaw live operations</p>
          <h1>Virtual Office</h1>
          <p className="hero-copy">This view is driven by live OpenClaw session, thread, and brain data. Where a backend feed is missing, the UI says so explicitly.</p>
        </div>
        <div className="hero-metrics">
          <article className="metric-card">
            <span>Gateway</span>
            <strong>{gateway.connected ? 'Connected' : 'Disconnected'}</strong>
            <small>{gateway.url}</small>
          </article>
          <article className="metric-card">
            <span>Agents visible</span>
            <strong>{agents.length}</strong>
            <small>{selectedAgent ? `Focused on ${selectedAgent.name}` : 'Waiting for live data'}</small>
          </article>
          <article className="metric-card">
            <span>Task cards</span>
            <strong>{tasks.length}</strong>
            <small>Live sessions plus honest unavailable states</small>
          </article>
        </div>
      </section>

      {error ? <div className="login-error">{error}</div> : null}

      {warnings.length ? (
        <section className="panel warnings-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Integrity notices</p>
              <h2>Live data limits</h2>
            </div>
          </div>
          <ul className="warning-list">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </section>
      ) : null}

      <section className="workspace-grid">
        <section className="panel office-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Office map</p>
              <h2>Agent floor</h2>
            </div>
          </div>
          <OfficeCanvas />
        </section>

        <div className="side-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Focused agent</p>
                <h2>{selectedAgent?.name ?? 'No live agent selected'}</h2>
              </div>
            </div>
            {selectedAgent ? (
              <div className="detail-card-grid">
                <div className="detail-card"><span>Status</span><strong>{selectedAgent.status}</strong></div>
                <div className="detail-card"><span>Role</span><strong>{selectedAgent.role}</strong></div>
                <div className="detail-card"><span>Speech</span><strong>{selectedAgent.speechBubble ?? 'silent'}</strong></div>
                <div className="detail-card"><span>Note</span><strong>{selectedAgent.note}</strong></div>
              </div>
            ) : (
              <div className="chat-empty">No agent data yet.</div>
            )}
            {selectedTask ? (
              <div className="task-summary-card">
                <strong>{selectedTask.title}</strong>
                <p>{selectedTask.detail}</p>
                <small>Status: {selectedTask.status}</small>
              </div>
            ) : null}
          </section>

          <AgentChatPanel />
          <BrainPanel />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2>Live feed</h2>
          </div>
        </div>
        <div className="activity-list">
          {activity.length ? activity.map((item) => (
            <article key={item.id} className="activity-item">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <small>{item.agentId} · {item.kind}</small>
            </article>
          )) : <div className="chat-empty">No recent live activity.</div>}
        </div>
      </section>
    </main>
  )
}

export default App
