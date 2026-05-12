import { Bot, FileText, LayoutDashboard, Radio, Workflow } from 'lucide-react'

import { AgentChatPanel } from './components/AgentChatPanel'
import { BrainPanel } from './components/BrainPanel'
import { OfficeCanvas } from './components/OfficeCanvas'
import { StatusPill } from './components/StatusPill'
import { useOfficePolling } from './hooks/useOfficePolling'
import { useOfficeTicker } from './hooks/useOfficeTicker'
import { formatRelativeIso } from './lib/format'
import { useOfficeStore } from './store/useOfficeStore'
import './App.css'

function App() {
  useOfficeTicker()
  const officeError = useOfficePolling()

  const {
    agents,
    tasks,
    documents,
    activity,
    gateway,
    generatedAt,
    selectedAgentId,
    setSelectedAgentId,
    selectedTaskId,
    setSelectedTaskId,
    threadStates,
    brains,
    warnings,
  } = useOfficeStore()

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0] ?? null
  const selectedTask = tasks.find((task) => task.id === (selectedTaskId ?? selectedAgent?.currentTaskId)) ?? tasks[0] ?? null
  const taskOwner = agents.find((agent) => agent.currentTaskId === selectedTask?.id) ?? selectedAgent
  const taskDocuments = documents.filter((doc) => selectedTask?.documentIds.includes(doc.id))
  const selectedThread = selectedAgent?.id === 'angela' ? (threadStates?.[0] ?? null) : null
  const awaitingUserThreads = (threadStates ?? []).filter((thread) => thread.status === 'awaiting_user')

  if (!selectedAgent || !selectedTask) {
    return (
      <main className="app-shell">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Crazinerd Mission Control</p>
              <h2>{officeError ? 'Office unavailable' : 'Office loading'}</h2>
            </div>
          </div>
          <div className="chat-empty">
            {officeError ? `Live office data is unavailable: ${officeError}` : 'Waiting for live office state...'}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Crazinerd Mission Control</p>
          <h1>Crazinerd Virtual Office</h1>
        </div>
        <div className="topbar-meta">
          <div className="signal-pill">
            <Radio size={14} />
            <span>{gateway.connected ? 'Gateway live' : 'Gateway offline'}</span>
          </div>
          <div className="timestamp">Refreshed {formatRelativeIso(generatedAt)}</div>
        </div>
      </header>

      <section className="hero-grid">
        {warnings?.length ? (
          <section className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Data availability</p>
                <h2>Some sections are limited</h2>
              </div>
            </div>
            <div className="chat-empty">{warnings.join(' ')}</div>
          </section>
        ) : null}
        <div className="office-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live floor</p>
              <h2>Agent workspace</h2>
            </div>
            <div className="legend">
              <span><Bot size={14} /> Agents</span>
              <span><Workflow size={14} /> Tasks</span>
              <span><FileText size={14} /> Docs</span>
            </div>
          </div>
          <OfficeCanvas />
        </div>

        <aside className="stream-panel panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Right rail</p>
              <h2>Activity stream</h2>
            </div>
          </div>
          <div className="activity-list">
            {activity.map((item) => {
              const agent = agents.find((entry) => entry.id === item.agentId)
              return (
                <button key={item.id} className="activity-item" onClick={() => setSelectedAgentId(item.agentId)}>
                  <div className="activity-avatar" style={{ background: agent?.color ?? '#64748b' }}>
                    {agent?.initials ?? '??'}
                  </div>
                  <div className="activity-copy">
                    <div className="activity-meta">
                      <strong>{item.title}</strong>
                      <span>{formatRelativeIso(item.timestamp)}</span>
                    </div>
                    <p>{item.detail}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>
      </section>

      <section className="dashboard-grid">
        <section className="panel focus-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Selected agent</p>
              <h2>{selectedAgent.name}</h2>
            </div>
            <StatusPill status={selectedAgent.status} />
          </div>
          <p className="lead">{selectedAgent.role}</p>
          <p className="muted">{selectedAgent.note}</p>
          <div className="detail-card-grid">
            <div className="detail-card">
              <span>Current task</span>
              <strong>{selectedTask.title}</strong>
            </div>
            <div className="detail-card">
              <span>Task progress</span>
              <strong>{selectedTask.progress}%</strong>
            </div>
            <div className="detail-card">
              <span>Gateway</span>
              <strong>{gateway.url}</strong>
            </div>
            <div className="detail-card">
              <span>Office generated</span>
              <strong>{formatRelativeIso(generatedAt)}</strong>
            </div>
          </div>

          <div className="task-detail-panel">
            <div className="task-detail-head">
              <div>
                <p className="eyebrow">Selected task</p>
                <h3>{selectedTask.title}</h3>
              </div>
              <StatusPill status={selectedTask.status} />
            </div>
            <p className="task-detail-copy">{selectedTask.detail}</p>
            <div className="task-detail-meta-grid">
              <div className="task-detail-list-card">
                <span>Assigned agent</span>
                <strong>{taskOwner?.name ?? 'Unassigned'}</strong>
                <p className="muted">{taskOwner?.role ?? 'No role attached yet.'}</p>
              </div>
              <div className="task-detail-list-card">
                <span>Linked docs</span>
                {taskDocuments.length ? (
                  <ul>
                    {taskDocuments.map((doc) => <li key={doc.id}>{doc.title}</li>)}
                  </ul>
                ) : (
                  <p className="muted">No live documents are linked to this task.</p>
                )}
              </div>
            </div>
            <div className="task-detail-columns">
              <div className="task-detail-list-card">
                <span>Done</span>
                {selectedTask.completedItems?.length ? (
                  <ul>
                    {selectedTask.completedItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="muted">No completed items are being reported for this task.</p>
                )}
              </div>
              <div className="task-detail-list-card">
                <span>To do</span>
                {selectedTask.todoItems?.length ? (
                  <ul>
                    {selectedTask.todoItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="muted">No structured todo feed is connected for this task.</p>
                )}
              </div>
            </div>
          </div>
          {selectedThread ? (
            <div className="thread-brief">
              <div className="thread-brief-head">
                <strong>Live support context</strong>
                <StatusPill status={selectedThread.status === 'resolved' ? 'reviewing' : selectedThread.status === 'awaiting_user' ? 'blocked' : 'working'} />
              </div>
              <p><strong>Issue:</strong> {selectedThread.issueType}</p>
              <p><strong>User said:</strong> {selectedThread.latestUserMessage}</p>
              <p><strong>Angela replied:</strong> {selectedThread.latestReply}</p>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Execution board</p>
              <h2>Tasks</h2>
            </div>
            <LayoutDashboard size={18} />
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <button key={task.id} className="task-card" onClick={() => setSelectedTaskId(task.id)}>
                <div className="task-head">
                  <strong>{task.title}</strong>
                  <StatusPill status={task.status} />
                </div>
                <p>{task.detail}</p>
                {task.progress > 0 ? (
                  <div className="progress-row">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span>{task.progress}%</span>
                  </div>
                ) : (
                  <p className="muted">No live progress feed is connected for this task yet.</p>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Awaiting you</p>
              <h2>User actions</h2>
            </div>
          </div>
          <div className="task-list">
            {awaitingUserThreads.length ? awaitingUserThreads.map((thread) => (
              <article key={thread.conversationId} className="task-card awaiting-card">
                <div className="task-head">
                  <strong>{thread.issueType}</strong>
                  <StatusPill status="blocked" />
                </div>
                <p>{thread.latestReply}</p>
              </article>
            )) : <div className="chat-empty">Nothing is waiting on you right now.</div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Agent brains</p>
              <h2>Brain dashboard</h2>
            </div>
            <Bot size={18} />
          </div>
          <div className="doc-list brain-list">
            {(brains ?? []).length ? (
              (brains ?? []).map((brain) => {
                const owner = agents.find((agent) => agent.id === brain.agentId)
                return (
                  <article key={brain.agentId} className="doc-card brain-card" onClick={() => setSelectedAgentId(brain.agentId)}>
                    <div className="doc-topline">
                      <span className="doc-kind">{brain.brainId}</span>
                      <span className="doc-status">{brain.updatedAt ? formatRelativeIso(brain.updatedAt) : 'ready'}</span>
                    </div>
                    <strong>{owner?.name ?? brain.agentId}</strong>
                    <p>{brain.root}</p>
                    <div className="brain-bucket-grid">
                      {brain.buckets.map((bucket) => (
                        <div key={bucket.key} className="brain-bucket-pill">
                          <span>{bucket.key}</span>
                          <strong>{bucket.count}</strong>
                        </div>
                      ))}
                    </div>
                    {brain.contextPack ? (
                      <div className="brain-preview">
                        {brain.contextPack.summaries[0] ? <p><strong>Summary:</strong> {brain.contextPack.summaries[0]}</p> : null}
                        {brain.contextPack.lessons[0] ? <p><strong>Lesson:</strong> {brain.contextPack.lessons[0]}</p> : null}
                      </div>
                    ) : null}
                  </article>
                )
              })
            ) : <div className="chat-empty">Brain data is not available yet.</div>}
          </div>
        </section>

        <AgentChatPanel />

        <BrainPanel />

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Knowledge surface</p>
              <h2>Documents</h2>
            </div>
            <FileText size={18} />
          </div>
          <div className="doc-list">
            {documents.length ? (
              documents.map((doc) => {
                const owner = agents.find((agent) => agent.id === doc.ownerId)
                return (
                  <article key={doc.id} className="doc-card">
                    <div className="doc-topline">
                      <span className="doc-kind">{doc.kind}</span>
                      <span className="doc-status">{doc.status}</span>
                    </div>
                    <strong>{doc.title}</strong>
                    <p>{owner?.name ?? 'Unknown owner'}</p>
                  </article>
                )
              })
            ) : <div className="chat-empty">No live document feed is connected yet.</div>}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
