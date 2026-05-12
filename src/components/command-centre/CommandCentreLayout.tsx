import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Activity, AlertTriangle, Bell, Bot, Brain, CalendarClock, CheckCircle2, ClipboardCheck, Command, Database, FileText, GitPullRequest, LayoutDashboard, Lock, Logs, MessageSquare, Moon, Network, Pause, Play, Plus, Search, Send, Settings, Shield, Sparkles, Sun, Users, Workflow, X } from 'lucide-react'
import clsx from 'clsx'

import { useCommandCentreStore } from '../../store/useCommandCentreStore'
import type { Agent, AgentStatus, CommandCentreView, CronJob, LogSeverity, MessageIntent, OfficeMode, Project, Task, TaskStatus } from '../../types/commandCentre'

const navItems: Array<{ view: CommandCentreView; label: string; icon: typeof LayoutDashboard }> = [
  { view: 'command', label: 'Command Centre', icon: LayoutDashboard },
  { view: 'office', label: 'Virtual Office', icon: Bot },
  { view: 'agents', label: 'Agents', icon: Users },
  { view: 'projects', label: 'Projects', icon: ClipboardCheck },
  { view: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { view: 'workflows', label: 'Workflows', icon: Workflow },
  { view: 'cron', label: 'Cron Jobs', icon: CalendarClock },
  { view: 'memory', label: 'Memory Banks', icon: Brain },
  { view: 'conversations', label: 'Conversations', icon: MessageSquare },
  { view: 'approvals', label: 'Approvals', icon: Shield },
  { view: 'support', label: 'Support', icon: Bell },
  { view: 'development', label: 'Development', icon: GitPullRequest },
  { view: 'security', label: 'Security', icon: Lock },
  { view: 'marketing', label: 'Marketing', icon: Activity },
  { view: 'reports', label: 'Reports', icon: FileText },
  { view: 'logs', label: 'Logs', icon: Logs },
  { view: 'integrations', label: 'Integrations', icon: Database },
  { view: 'settings', label: 'Settings', icon: Settings },
]

const modeItems: Array<{ mode: OfficeMode; label: string }> = [
  { mode: 'virtual_office', label: 'Virtual Office Mode' },
  { mode: 'command_centre', label: 'Command Centre Mode' },
  { mode: 'project_board', label: 'Project Board Mode' },
  { mode: 'agent_network', label: 'Agent Network Mode' },
  { mode: 'logs_monitoring', label: 'Logs / Monitoring Mode' },
]

const modeViewMap: Record<OfficeMode, CommandCentreView> = {
  virtual_office: 'office',
  command_centre: 'command',
  project_board: 'projects',
  agent_network: 'network',
  logs_monitoring: 'logs',
}

const statusLabel: Record<AgentStatus, string> = {
  idle: 'Idle', thinking: 'Thinking', planning: 'Planning', working: 'Working', waiting_for_tool: 'Waiting for tool', waiting_for_user: 'Waiting for user', reviewing: 'Reviewing', blocked: 'Blocked', completed: 'Completed', failed: 'Failed', paused: 'Paused', offline: 'Offline',
}

function fmt(value?: string) {
  if (!value) return 'Not run yet'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function agentName(id: string | undefined, agents: Agent[]) {
  return agents.find((agent) => agent.id === id)?.name ?? 'Unassigned'
}

function projectName(id: string | undefined, projects: Project[]) {
  return projects.find((project) => project.id === id)?.name ?? 'No project'
}

export function AgentStatusBadge({ status }: { status: AgentStatus | TaskStatus | LogSeverity | string }) {
  return <span className={clsx('cc-badge', `cc-badge-${status}`)}>{statusLabel[status as AgentStatus] ?? status.replaceAll('_', ' ')}</span>
}

export function StatusMetricCard({ label, value, detail, intent = 'info', onClick }: { label: string; value: string | number; detail: string; intent?: 'info' | 'success' | 'warning' | 'danger'; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'article'
  return <Tag className={clsx('metric-card', `metric-${intent}`)} onClick={onClick as never}><span>{label}</span><strong>{value}</strong><p>{detail}</p></Tag>
}

export function AnalyticsCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="cc-card"><div className="cc-card-head"><h3>{title}</h3>{action}</div>{children}</section>
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <div className="empty-state"><Sparkles size={22} /><h3>{title}</h3><p>{body}</p>{action}</div>
}

export function LoadingSkeleton() { return <div className="loading-skeleton" aria-label="Loading" /> }
export function ErrorState({ message }: { message: string }) { return <div className="error-state"><AlertTriangle size={18} />{message}</div> }

export function ConfirmDialog({ title, body, onConfirm, onCancel }: { title: string; body: string; onConfirm: () => void; onCancel: () => void }) {
  return <div className="confirm-dialog"><h3>{title}</h3><p>{body}</p><div><button className="ghost-button" onClick={onCancel}>Cancel</button><button className="danger-button" onClick={onConfirm}>Confirm</button></div></div>
}

export function SidebarNavigation() {
  const currentView = useCommandCentreStore((s) => s.currentView)
  const setView = useCommandCentreStore((s) => s.setView)
  return <aside className="sidebar-nav"><div className="brand-mark"><div>OC</div><span>AI Command Centre</span></div><nav>{navItems.map(({ view, label, icon: Icon }) => <button key={view} className={clsx(currentView === view && 'active')} onClick={() => setView(view)}><Icon size={17} />{label}</button>)}</nav></aside>
}

export function TopCommandBar() {
  const { searchQuery, setSearchQuery, toggleCommandPalette, notifications, currentMode, setMode, currentView, setView, toast, clearToast } = useCommandCentreStore()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { if (!toast) return; const id = window.setTimeout(clearToast, 3200); return () => window.clearTimeout(id) }, [toast, clearToast])
  return <header className="top-command-bar"><div><p className="eyebrow">Crazinerd / OpenClaw Operations</p><h1>{navItems.find((item) => item.view === currentView)?.label ?? 'Command Centre'}</h1></div><div className="global-search"><Search size={16} /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => toggleCommandPalette(true)} placeholder="Search or press ⌘K for commands" /><button onClick={() => toggleCommandPalette(true)}><Command size={15} /> Palette</button></div><select className="mode-select" value={currentMode} onChange={(e) => { const mode = e.target.value as OfficeMode; setMode(mode); setView(modeViewMap[mode]) }}>{modeItems.map((item) => <option key={item.mode} value={item.mode}>{item.label}</option>)}</select><button className="icon-button" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><button className="notif-button" onClick={() => useCommandCentreStore.setState({ activeDrawer: 'notifications' })}><Bell size={18} /><span>{notifications.filter((n) => !n.read).length}</span></button>{toast ? <div className="toast">{toast}</div> : null}</header>
}

export function GlobalCommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, setView, createTaskFromInstruction, createCronJob, openAgent, agents } = useCommandCentreStore()
  const [query, setQuery] = useState('')
  const commands = [
    { label: 'Create task', detail: 'Alicia creates and delegates a new task', action: () => createTaskFromInstruction(query || 'New operations task') },
    { label: 'Chat with Alicia', detail: 'Open Alicia detail and chat panel', action: () => openAgent('alicia') },
    { label: 'Assign this to John', detail: 'Create a John development task with Lia review', action: () => createTaskFromInstruction(query || 'New development task requiring Lia review', 'john') },
    { label: 'Show blocked tasks', detail: 'Open task board and filter mentally to blockers', action: () => setView('tasks') },
    { label: 'Create cron job', detail: 'Create a daily 8 AM Alicia report', action: () => createCronJob() },
    { label: 'Open memory bank', detail: 'Review memories and conflicts', action: () => setView('memory') },
    { label: 'Run security review', detail: 'Open Lia security dashboard', action: () => { setView('security'); openAgent('lia') } },
    { label: 'Show failed workflows', detail: 'Open workflow monitoring', action: () => setView('workflows') },
    { label: 'Create new agent', detail: 'Add a Finance Agent template', action: () => useCommandCentreStore.getState().addAgent('Finance Agent', 'Finance and Budget Controller') },
    { label: 'Generate daily report', detail: 'Open reports dashboard', action: () => setView('reports') },
  ]
  if (!commandPaletteOpen) return null
  return <div className="palette-backdrop" onClick={() => toggleCommandPalette(false)}><div className="command-palette" onClick={(e) => e.stopPropagation()}><div className="palette-search"><Command size={18} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type an instruction, agent, project, or command" /><button onClick={() => toggleCommandPalette(false)}><X size={16} /></button></div><div className="palette-results">{commands.map((command) => <button key={command.label} onClick={() => { command.action(); toggleCommandPalette(false) }}><strong>{command.label}</strong><span>{command.detail}</span></button>)}{agents.filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase())).map((agent) => <button key={agent.id} onClick={() => { openAgent(agent.id); toggleCommandPalette(false) }}><strong>Open {agent.name}</strong><span>{agent.title}</span></button>)}</div></div></div>
}

export function AgentStatusDock() {
  const { agents, openAgent } = useCommandCentreStore()
  return <div className="agent-dock">{agents.filter((a) => a.status !== 'archived').map((agent) => <button key={agent.id} onClick={() => openAgent(agent.id)} title={`${agent.name}: ${agent.currentActivity}`}><span>{agent.avatar}</span><AgentStatusBadge status={agent.currentStatus} /></button>)}</div>
}

export function CommandCentreHomeDashboard() {
  const { agents, tasks, approvals, workflows, cronJobs, notifications, projects, reports, openTask, setView, openAgent } = useCommandCentreStore()
  const activeAgents = agents.filter((a) => !['offline', 'paused'].includes(a.currentStatus)).length
  const failedTasks = tasks.filter((t) => t.taskStatus === 'failed').length
  const blockedTasks = tasks.filter((t) => t.taskStatus === 'blocked' || t.taskStatus === 'waiting_for_review').length
  const pendingApprovals = approvals.filter((a) => a.approvalStatus === 'pending').length
  const urgentSupport = notifications.filter((n) => ['support_escalation', 'deadline_approaching'].includes(n.type) && !n.read).length
  return <div className="dashboard-stack"><section className="metric-grid"><StatusMetricCard label="Active agents" value={activeAgents} detail="Working, planning, reviewing, or waiting" onClick={() => setView('agents')} /><StatusMetricCard label="Failed tasks" value={failedTasks} detail={`${blockedTasks} blocked or awaiting review`} intent={failedTasks ? 'danger' : 'success'} onClick={() => setView('tasks')} /><StatusMetricCard label="Pending approvals" value={pendingApprovals} detail="Risky actions awaiting you" intent="warning" onClick={() => setView('approvals')} /><StatusMetricCard label="Running workflows" value={workflows.filter((w) => w.running).length} detail="Automation pipelines active" onClick={() => setView('workflows')} /><StatusMetricCard label="Upcoming cron" value={cronJobs.filter((c) => c.enabled).length} detail="Scheduled automations" onClick={() => setView('cron')} /><StatusMetricCard label="Urgent support" value={urgentSupport} detail="SLA/client follow-up pressure" intent="warning" onClick={() => setView('support')} /></section><div className="content-grid three"><AnalyticsCard title="Today’s priority tasks" action={<button onClick={() => useCommandCentreStore.getState().createTaskFromInstruction('New priority task')}>New task</button>}><div className="list-stack">{tasks.slice(0, 5).map((task) => <TaskCard key={task.id} task={task} onOpen={() => openTask(task.id)} />)}</div></AnalyticsCard><AnalyticsCard title="Alicia recommendations" action={<button onClick={() => openAgent('alicia')}>Open Alicia</button>}><div className="recommendations"><p>1. Do not deploy Guestlist fixes until Lia review is complete.</p><p>2. Approve or revise Oryn’s quote follow-up before noon.</p><p>3. Convert Drone SEO image-alt findings into a recurring technical SEO cron.</p><p>4. Review paused Lia audit integration before next Monday.</p></div></AnalyticsCard><AnalyticsCard title="Project health"><div className="list-stack">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></AnalyticsCard></div><div className="content-grid two"><WorkflowPipeline /><ReportsDashboard reports={reports} /></div></div>
}

export function OfficeRoom({ room }: { room: ReturnType<typeof useCommandCentreStore.getState>['rooms'][number] }) {
  const setView = useCommandCentreStore((s) => s.setView)
  return <button className="office-room" style={{ '--accent': room.accent } as React.CSSProperties} onClick={() => setView(room.view)}><div><strong>{room.name}</strong><span>{room.department}</span></div><p>{room.description}</p><div>{room.metrics.map((metric) => <small key={metric.label}>{metric.label}: <b>{metric.value}</b></small>)}</div></button>
}

export function AgentQuickActions({ agent }: { agent: Agent }) {
  const store = useCommandCentreStore()
  const actions = [
    ['Chat', () => store.openAgent(agent.id)], ['Assign task', () => store.createTaskFromInstruction(`New task for ${agent.name}`, agent.id)], ['View tasks', () => store.setView('tasks')], ['View memory', () => store.setView('memory')], ['View logs', () => store.setView('logs')], ['Performance', () => store.openAgent(agent.id)], ['Prompt', () => store.openAgent(agent.id)], ['Edit', () => store.openAgent(agent.id)], [agent.currentStatus === 'paused' ? 'Resume' : 'Pause', () => agent.currentStatus === 'paused' ? store.resumeAgent(agent.id) : store.pauseAgent(agent.id)], ['Tools', () => store.setView('integrations')], ['Permissions', () => store.setView('settings')], ['Archive', () => store.archiveAgent(agent.id)],
  ] as const
  return <div className="quick-actions">{actions.map(([label, action]) => <button key={label} onClick={(e) => { e.stopPropagation(); action() }}>{label}</button>)}</div>
}

export function AgentSprite({ agent }: { agent: Agent }) {
  const openAgent = useCommandCentreStore((s) => s.openAgent)
  return <button className="agent-sprite" style={{ left: `${agent.officePosition.x}%`, top: `${agent.officePosition.y}%` }} onClick={() => openAgent(agent.id)}><span className="sprite-avatar">{agent.avatar}</span><span className="sprite-name">{agent.name}</span><AgentStatusBadge status={agent.currentStatus} /><small>{agent.currentActivity}</small>{agent.alertCount ? <b className="alert-dot">{agent.alertCount}</b> : null}<AgentQuickActions agent={agent} /></button>
}

export function VirtualOfficeCanvas() {
  const { rooms, agents } = useCommandCentreStore()
  return <section className="virtual-office"><div className="office-map"><div className="room-grid">{rooms.map((room) => <OfficeRoom key={room.id} room={room} />)}</div>{agents.filter((a) => a.status !== 'archived').map((agent) => <AgentSprite key={agent.id} agent={agent} />)}<div className="office-legend"><Network size={16} /> Visual layer: click rooms and sprites to operate real modules.</div></div></section>
}

export function AgentProfilePanel({ agent }: { agent: Agent }) {
  return <div className="profile-grid"><div><span>Autonomy</span><strong>{agent.autonomyLevel}/10</strong></div><div><span>Risk</span><strong>{agent.riskLevel}</strong></div><div><span>Cost today</span><strong>${agent.costUsedToday.toFixed(2)} / ${agent.costLimit}</strong></div><div><span>Daily limit</span><strong>{agent.assignedTaskCount}/{agent.dailyTaskLimit}</strong></div><div><span>Model</span><strong>{agent.defaultModelProvider}</strong></div><div><span>Working hours</span><strong>{agent.workingHours}</strong></div><div className="wide"><span>Responsibilities</span><p>{agent.responsibilities.join(' • ')}</p></div><div className="wide"><span>Permission summary</span><p>{agent.permission.level.replaceAll('_', ' ')} · delegate: {String(agent.permission.canDelegate)} · deploy: {String(agent.permission.canDeployCode)} · sensitive: {String(agent.permission.canAccessSensitiveData)}</p></div></div>
}

export function AgentChatPanel({ agent }: { agent: Agent }) {
  const { conversations, messages, sendMessage, convertMessageToTask, saveMessageToMemory } = useCommandCentreStore()
  const [intent, setIntent] = useState<MessageIntent>('ask')
  const [content, setContent] = useState('')
  const conversation = conversations.find((c) => c.participantAgentIds.includes(agent.id))
  const visibleMessages = messages.filter((m) => m.conversationId === conversation?.id).slice(-6)
  const submit = (e: FormEvent) => { e.preventDefault(); if (!content.trim()) return; sendMessage(agent.id, content.trim(), intent); setContent('') }
  return <div className="agent-chat"><div className="chat-messages">{visibleMessages.length ? visibleMessages.map((message) => <article key={message.id} className={clsx('chat-bubble', message.senderType)}><strong>{message.senderType === 'user' ? 'You' : agentName(message.senderId, useCommandCentreStore.getState().agents)}</strong><p>{message.content}</p><div><button onClick={() => convertMessageToTask(message.id)}>Create task</button><button onClick={() => saveMessageToMemory(message.id)}>Save memory</button></div></article>) : <EmptyState title="No chat yet" body="Send an instruction, review request, or approval note to this agent." />}</div><form className="chat-form" onSubmit={submit}><select value={intent} onChange={(e) => setIntent(e.target.value as MessageIntent)}>{['ask','instruct','delegate','review','approve','reject','save_to_memory','create_task','schedule_automation','request_report'].map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select><input value={content} onChange={(e) => setContent(e.target.value)} placeholder={`Message ${agent.name}`} /><button type="submit"><Send size={16} /> Send</button></form></div>
}

export function AgentDetailDrawer() {
  const { agents, tasks, memories, logs, selectedAgentId, pauseAgent, resumeAgent, createTaskFromInstruction } = useCommandCentreStore()
  const agent = agents.find((a) => a.id === selectedAgentId)
  if (!agent) return null
  const agentTasks = tasks.filter((task) => task.assignedAgentId === agent.id)
  const agentMemories = memories.filter((memory) => memory.ownerAgentId === agent.id)
  const agentLogs = logs.filter((log) => log.agentId === agent.id)
  return <DrawerShell title={agent.name} subtitle={agent.title}><div className="drawer-hero"><span>{agent.avatar}</span><div><AgentStatusBadge status={agent.currentStatus} /><p>{agent.currentActivity}</p><small>Last activity {fmt(agent.lastActivityAt)} · next: {agent.nextAction}</small></div></div><div className="drawer-actions"><button onClick={() => createTaskFromInstruction(`New task for ${agent.name}`, agent.id)}><Plus size={15} /> Assign task</button><button onClick={() => agent.currentStatus === 'paused' ? resumeAgent(agent.id) : pauseAgent(agent.id)}>{agent.currentStatus === 'paused' ? <Play size={15} /> : <Pause size={15} />}{agent.currentStatus === 'paused' ? 'Resume' : 'Pause'}</button><button onClick={() => useCommandCentreStore.setState({ currentView: 'integrations' })}>Tools</button><button onClick={() => useCommandCentreStore.setState({ currentView: 'settings' })}>Permissions</button></div><AgentProfilePanel agent={agent} /><AnalyticsCard title="Active tasks"><div className="list-stack">{agentTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={() => useCommandCentreStore.getState().openTask(task.id)} />)}</div></AnalyticsCard><AgentChatPanel agent={agent} /><AnalyticsCard title="Memory, logs, recommendations"><div className="mini-columns"><div><h4>Memories</h4>{agentMemories.map((m) => <button key={m.id} onClick={() => useCommandCentreStore.getState().openMemory(m.id)}>{m.title}</button>)}</div><div><h4>Logs</h4>{agentLogs.slice(0, 4).map((log) => <p key={log.id}>{log.title}</p>)}</div></div></AnalyticsCard></DrawerShell>
}

export function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { agents, projects, updateTaskStatus } = useCommandCentreStore()
  return <article className="task-card"><button className="card-open" onClick={onOpen}><div><strong>{task.title}</strong><p>{task.description}</p></div><AgentStatusBadge status={task.taskStatus} /></button><div className="card-meta"><span>{projectName(task.projectId, projects)}</span><span>{agentName(task.assignedAgentId, agents)}</span><span>{task.priority}</span><span>{fmt(task.dueDate)}</span></div><div className="inline-actions"><button onClick={() => updateTaskStatus(task.id, 'in_progress')}>Start</button><button onClick={() => updateTaskStatus(task.id, 'waiting_for_review')}>Request review</button><button onClick={() => updateTaskStatus(task.id, 'completed')}>Complete</button><button onClick={() => updateTaskStatus(task.id, 'blocked')}>Block</button></div></article>
}

export function TaskBoard() {
  const { tasks, openTask, createTaskFromInstruction } = useCommandCentreStore()
  const columns: TaskStatus[] = ['backlog', 'assigned', 'in_progress', 'waiting_for_review', 'needs_fixes', 'approved', 'completed', 'blocked']
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Task management</p><h2>Kanban board</h2></div><button onClick={() => createTaskFromInstruction('New task from board')}>Create task</button></div><div className="kanban">{columns.map((status) => <div key={status} className="kanban-col"><h3>{status.replaceAll('_', ' ')} <span>{tasks.filter((task) => task.taskStatus === status).length}</span></h3>{tasks.filter((task) => task.taskStatus === status).map((task) => <TaskCard key={task.id} task={task} onOpen={() => openTask(task.id)} />)}{!tasks.some((task) => task.taskStatus === status) ? <EmptyState title="Empty" body="Drag/drop will connect when backend workflow adapter is enabled." /> : null}</div>)}</div></section>
}

export function TaskDetailDrawer() {
  const { tasks, selectedTaskId, agents, projects, updateTaskStatus } = useCommandCentreStore()
  const task = tasks.find((t) => t.id === selectedTaskId)
  if (!task) return null
  return <DrawerShell title={task.title} subtitle={`${projectName(task.projectId, projects)} · ${agentName(task.assignedAgentId, agents)}`}><AgentStatusBadge status={task.taskStatus} /><p>{task.description}</p><div className="drawer-actions"><button onClick={() => updateTaskStatus(task.id, 'approved')}>Approve</button><button onClick={() => updateTaskStatus(task.id, 'needs_fixes')}>Reject / needs fixes</button><button onClick={() => updateTaskStatus(task.id, 'waiting_for_review')}>Add reviewer</button><button onClick={() => useCommandCentreStore.getState().createCronJob(`Recurring: ${task.title}`, task.assignedAgentId)}>Create recurring task</button></div><div className="profile-grid"><div><span>Priority</span><strong>{task.priority}</strong></div><div><span>Due</span><strong>{fmt(task.dueDate)}</strong></div><div><span>Estimated</span><strong>{task.estimatedEffortHours}h</strong></div><div><span>Actual</span><strong>{task.actualTimeHours}h</strong></div><div className="wide"><span>Acceptance criteria</span><ul>{task.acceptanceCriteria.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="wide"><span>Quality controls</span><p>Approval: {String(task.approvalRequired)} · Review: {String(task.reviewRequired)} · Security: {String(task.securityReviewRequired)} · Deployment: {String(task.deploymentRequired)}</p></div></div></DrawerShell>
}

export function ProjectCard({ project }: { project: Project }) {
  const openProject = useCommandCentreStore((s) => s.openProject)
  return <button className="project-card" onClick={() => openProject(project.id)}><div><strong>{project.name}</strong><span>{project.clientCompany}</span></div><p>{project.description}</p><div className="health-row"><span>Health {project.healthScore}%</span><progress value={project.healthScore} max={100} /><span>Risk {project.riskScore}%</span></div><AgentStatusBadge status={project.projectStatus} /></button>
}

export function ProjectBoard() {
  const { projects, tasks } = useCommandCentreStore()
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Project management</p><h2>Company project board</h2></div><button onClick={() => useCommandCentreStore.getState().showToast('Project templates ready: app, website, SEO, support, marketing, security, onboarding, launch, bug sprint, research.')}>Templates</button></div><div className="project-grid">{projects.map((project) => <div key={project.id}><ProjectCard project={project} /><div className="linked-tasks">{tasks.filter((task) => task.projectId === project.id).map((task) => <button key={task.id} onClick={() => useCommandCentreStore.getState().openTask(task.id)}>{task.title}</button>)}</div></div>)}</div></section>
}

export function ProjectDetailPanel() {
  const { projects, selectedProjectId, agents, tasks } = useCommandCentreStore()
  const project = projects.find((p) => p.id === selectedProjectId)
  if (!project) return null
  return <DrawerShell title={project.name} subtitle={`${project.clientCompany} · ${project.projectStatus.replaceAll('_', ' ')}`}><p>{project.description}</p><div className="profile-grid"><div><span>Owner</span><strong>{agentName(project.ownerAgentId, agents)}</strong></div><div><span>Deadline</span><strong>{project.deadline}</strong></div><div><span>Budget</span><strong>${project.budget.toLocaleString()}</strong></div><div><span>Priority</span><strong>{project.priority}</strong></div><div><span>Health</span><strong>{project.healthScore}%</strong></div><div><span>Risk</span><strong>{project.riskScore}%</strong></div><div className="wide"><span>Repositories</span><p>{project.linkedRepositories.join(', ')}</p></div></div><AnalyticsCard title="Tasks"><div className="list-stack">{tasks.filter((task) => task.projectId === project.id).map((task) => <TaskCard key={task.id} task={task} onOpen={() => useCommandCentreStore.getState().openTask(task.id)} />)}</div></AnalyticsCard></DrawerShell>
}

export function WorkflowPipeline() {
  const { workflows, agents } = useCommandCentreStore()
  const workflow = workflows[0]
  return <AnalyticsCard title="Code review and security pipeline" action={<button onClick={() => useCommandCentreStore.getState().setView('workflows')}>Open builder</button>}><div className="pipeline">{workflow.steps.map((step, index) => <div key={step.id} className={clsx('pipeline-step', step.status)}><span>{index + 1}</span><strong>{step.label}</strong><small>{agentName(step.assignedAgentId, agents)}</small><AgentStatusBadge status={step.status} /><p>{step.notes}</p></div>)}</div></AnalyticsCard>
}

export function WorkflowRunTimeline() { return <WorkflowPipeline /> }

export function WorkflowBuilder() {
  const { workflows, agents, showToast } = useCommandCentreStore()
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Workflow automation</p><h2>Visual workflow builder</h2></div><button onClick={() => showToast('Workflow draft saved. Connect backend runner to execute durable automations.')}>Save workflow draft</button></div><div className="content-grid two">{workflows.map((workflow) => <AnalyticsCard key={workflow.id} title={workflow.name}><p>{workflow.description}</p><div className="profile-grid"><div><span>Trigger</span><strong>{workflow.trigger.replaceAll('_', ' ')}</strong></div><div><span>Retry</span><strong>{workflow.retryPolicy}</strong></div><div><span>Failure</span><strong>{workflow.failureAction}</strong></div><div><span>Notify</span><strong>{workflow.notificationMethod}</strong></div></div><div className="pipeline compact">{workflow.steps.map((step) => <div key={step.id} className={clsx('pipeline-step', step.status)}><strong>{step.label}</strong><small>{agentName(step.assignedAgentId, agents)}</small><AgentStatusBadge status={step.status} /></div>)}</div></AnalyticsCard>)}</div></section>
}

export function CronJobEditor({ cron }: { cron: CronJob }) {
  const { toggleCronJob, runCronNow } = useCommandCentreStore()
  return <div className="drawer-actions"><button onClick={() => toggleCronJob(cron.id)}>{cron.enabled ? 'Pause' : 'Resume'}</button><button onClick={() => runCronNow(cron.id)}>Manual dry-run</button><button onClick={() => useCommandCentreStore.getState().showToast('Edit schedule panel opened. Persisting schedule requires backend scheduler adapter.')}>Edit schedule</button></div>
}

export function CronJobTable() {
  const { cronJobs, agents, openCron, createCronJob } = useCommandCentreStore()
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Cron and automation</p><h2>Cron job manager</h2></div><button onClick={() => createCronJob()}>Create daily 8 AM Alicia report</button></div><div className="table-card"><table><thead><tr><th>Name</th><th>Agent</th><th>Schedule</th><th>Next run</th><th>Status</th><th>Failures</th><th>Actions</th></tr></thead><tbody>{cronJobs.map((cron) => <tr key={cron.id}><td><button onClick={() => openCron(cron.id)}>{cron.name}</button><small>{cron.lastOutput}</small></td><td>{agentName(cron.assignedAgentId, agents)}</td><td>{cron.schedule}</td><td>{fmt(cron.nextRunAt)}</td><td><AgentStatusBadge status={cron.enabled ? 'active' : 'paused'} /></td><td>{cron.failureCount}</td><td><CronJobEditor cron={cron} /></td></tr>)}</tbody></table></div></section>
}

export function MemoryEntryCard({ memory }: { memory: ReturnType<typeof useCommandCentreStore.getState>['memories'][number] }) {
  const { openMemory, approveMemory, rejectMemory } = useCommandCentreStore()
  return <article className="memory-card"><button onClick={() => openMemory(memory.id)}><strong>{memory.title}</strong><p>{memory.content}</p></button><div className="card-meta"><AgentStatusBadge status={memory.approvalStatus} /><span>{memory.type}</span><span>{memory.visibility}</span><span>{memory.confidenceLevel}% confidence</span>{memory.conflict ? <span className="danger-text">Conflict</span> : null}</div><div className="inline-actions"><button onClick={() => approveMemory(memory.id)}>Approve</button><button onClick={() => rejectMemory(memory.id)}>Reject</button><button onClick={() => openMemory(memory.id)}>Edit</button></div></article>
}

export function MemoryBankViewer() {
  const { memories, memoryBanks, searchQuery } = useCommandCentreStore()
  const visible = memories.filter((m) => `${m.title} ${m.content} ${m.tags.join(' ')}`.toLowerCase().includes(searchQuery.toLowerCase()))
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Memory governance</p><h2>Memory bank viewer</h2></div><button onClick={() => useCommandCentreStore.getState().saveMessageToMemory('msg-2')}>Add memory from decision</button></div><div className="memory-bank-strip">{memoryBanks.map((bank) => <button key={bank.id}>{bank.name}<span>{bank.entryIds.length} entries</span></button>)}</div><div className="content-grid two">{visible.map((memory) => <MemoryEntryCard key={memory.id} memory={memory} />)}</div></section>
}

function MemoryEditorForm({ memory }: { memory: ReturnType<typeof useCommandCentreStore.getState>['memories'][number] }) {
  const { updateMemory, approveMemory, rejectMemory } = useCommandCentreStore()
  const [content, setContent] = useState(memory.content)
  return <DrawerShell title={memory.title} subtitle={`${memory.type} · ${memory.visibility}`}><textarea className="memory-editor" value={content} onChange={(e) => setContent(e.target.value)} /><div className="drawer-actions"><button onClick={() => updateMemory(memory.id, content)}>Save edit</button><button onClick={() => approveMemory(memory.id)}>Approve</button><button onClick={() => rejectMemory(memory.id)}>Reject</button></div><div className="profile-grid"><div><span>Confidence</span><strong>{memory.confidenceLevel}%</strong></div><div><span>Approval</span><strong>{memory.approvalStatus}</strong></div><div><span>Conflict</span><strong>{String(memory.conflict)}</strong></div><div><span>Used by</span><strong>{memory.lastUsedByAgentIds.join(', ')}</strong></div></div></DrawerShell>
}

export function MemoryEditor() {
  const { memories, selectedMemoryId } = useCommandCentreStore()
  const memory = memories.find((m) => m.id === selectedMemoryId)
  if (!memory) return null
  return <MemoryEditorForm key={`${memory.id}:${memory.content}`} memory={memory} />
}

export function ApprovalCard({ approval }: { approval: ReturnType<typeof useCommandCentreStore.getState>['approvals'][number] }) {
  const { agents, projects, openApproval, approveRequest, rejectRequest, requestChanges } = useCommandCentreStore()
  return <article className="approval-card"><button onClick={() => openApproval(approval.id)}><div><strong>{approval.title}</strong><p>{approval.summary}</p></div><AgentStatusBadge status={approval.approvalStatus} /></button><div className="card-meta"><span>{approval.type.replaceAll('_', ' ')}</span><span>{agentName(approval.requestingAgentId, agents)}</span><span>{projectName(approval.projectId, projects)}</span><span>{approval.riskLevel} risk</span></div><div className="inline-actions"><button onClick={() => approveRequest(approval.id)}>Approve</button><button onClick={() => rejectRequest(approval.id)}>Reject</button><button onClick={() => requestChanges(approval.id)}>Request changes</button></div></article>
}

export function ApprovalQueue() {
  const approvals = useCommandCentreStore((s) => s.approvals)
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Human approval system</p><h2>Approval queue</h2></div></div><div className="content-grid two">{approvals.map((approval) => <ApprovalCard key={approval.id} approval={approval} />)}</div></section>
}

export function LogsViewer() {
  const { logs, agents, projects, resolveLog, searchQuery } = useCommandCentreStore()
  const visible = logs.filter((log) => `${log.title} ${log.detail} ${log.type} ${log.severity}`.toLowerCase().includes(searchQuery.toLowerCase()))
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Logs and audit trail</p><h2>Operational logs</h2></div><button onClick={() => useCommandCentreStore.getState().showToast('Logs exported to JSON when backend storage adapter is connected.')}>Export logs</button></div><div className="log-list">{visible.map((log) => <article key={log.id} className={clsx('log-entry', log.severity)}><div><AgentStatusBadge status={log.severity} /><strong>{log.title}</strong><p>{log.detail}</p><small>{fmt(log.timestamp)} · {agentName(log.agentId, agents)} · {projectName(log.projectId, projects)} · {log.type.replaceAll('_', ' ')}</small></div><button onClick={() => resolveLog(log.id)}>{log.resolved ? 'Resolved' : 'Mark resolved'}</button></article>)}</div></section>
}

export function NotificationCentre() {
  const { notifications, markNotificationRead, snoozeNotification } = useCommandCentreStore()
  return <DrawerShell title="Notification centre" subtitle="In-app notifications with optional email/WhatsApp/Telegram adapters"><div className="list-stack">{notifications.map((notification) => <article key={notification.id} className={clsx('notification-card', notification.read && 'read')}><strong>{notification.title}</strong><p>{notification.body}</p><div className="card-meta"><span>{notification.type.replaceAll('_', ' ')}</span><span>{notification.priority}</span>{notification.snoozedUntil ? <span>Snoozed until {fmt(notification.snoozedUntil)}</span> : null}</div><div className="inline-actions"><button onClick={() => markNotificationRead(notification.id)}>Mark read</button><button onClick={() => snoozeNotification(notification.id)}>Snooze</button><button onClick={() => useCommandCentreStore.getState().showToast(`Opened related ${notification.relatedType}.`)}>Open related</button></div></article>)}</div></DrawerShell>
}

export function IntegrationManager() {
  const { integrations, agents, testIntegration } = useCommandCentreStore()
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Tool and integration management</p><h2>Integrations</h2></div></div><div className="content-grid three">{integrations.map((integration) => <AnalyticsCard key={integration.id} title={integration.name}><AgentStatusBadge status={integration.enabled ? 'active' : 'paused'} /><p>Secrets are stored server-side only. Frontend shows configuration metadata, never raw API keys.</p><div className="profile-grid"><div><span>Type</span><strong>{integration.type}</strong></div><div><span>API key</span><strong>{integration.apiKeyStatus.replaceAll('_', ' ')}</strong></div><div><span>Rate</span><strong>{integration.rateLimits}</strong></div><div><span>Failures</span><strong>{integration.failureCount}</strong></div><div className="wide"><span>Agents</span><p>{integration.assignedAgentIds.map((id) => agentName(id, agents)).join(', ')}</p></div></div><button onClick={() => testIntegration(integration.id)}>Test connection</button></AnalyticsCard>)}</div></section>
}

export function ReportsDashboard({ reports = useCommandCentreStore.getState().reports }: { reports?: ReturnType<typeof useCommandCentreStore.getState>['reports'] }) {
  return <AnalyticsCard title="Reports and analytics"><div className="report-grid">{reports.map((report) => <article key={report.id} className="report-card"><strong>{report.title}</strong><p>{report.summary}</p><div>{report.metrics.map((metric) => <span key={metric.label}>{metric.label}: <b>{metric.value}</b> <small>{metric.trend}</small></span>)}</div></article>)}</div></AnalyticsCard>
}

function SettingsPage() {
  const addAgent = useCommandCentreStore((s) => s.addAgent)
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Settings and permissions</p><h2>Role-based controls and safety gates</h2></div><button onClick={() => addAgent('Finance Agent', 'Finance and Budget Controller')}>Create Finance Agent</button></div><div className="content-grid two"><AnalyticsCard title="User roles"><p>Owner, Admin, Manager, Agent Operator, Viewer, Developer, Support, and Auditor roles are represented in the permission service and ready for backend enforcement.</p></AnalyticsCard><AnalyticsCard title="Production safety"><ul><li>Production deployments require approval.</li><li>Permanent memory edits enter pending approval.</li><li>Dangerous integrations show integration-required explanations.</li><li>Permission changes are logged.</li><li>Dry-run mode is used for cron jobs until the scheduler adapter is connected.</li></ul></AnalyticsCard></div></section>
}

function AgentDirectory() {
  const { agents, openAgent, addAgent } = useCommandCentreStore()
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Agent management</p><h2>Agents</h2></div><button onClick={() => addAgent('Finance Agent', 'Finance and Budget Controller')}>Create agent</button></div><div className="agent-grid">{agents.map((agent) => <button key={agent.id} className="agent-card" onClick={() => openAgent(agent.id)}><span>{agent.avatar}</span><strong>{agent.name}</strong><p>{agent.title}</p><AgentStatusBadge status={agent.currentStatus} /><small>{agent.assignedTaskCount} assigned · {agent.completedToday} completed today · score {agent.performanceScore}</small></button>)}</div></section>
}

function ConversationList() {
  const { conversations, messages, agents, openAgent } = useCommandCentreStore()
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Agent chat system</p><h2>Conversations</h2></div></div><div className="content-grid two">{conversations.map((conversation) => <AnalyticsCard key={conversation.id} title={conversation.title}><p>{conversation.type.replaceAll('_', ' ')} · {conversation.participantAgentIds.map((id) => agentName(id, agents)).join(', ')}</p>{messages.filter((m) => m.conversationId === conversation.id).slice(-3).map((message) => <button className="message-row" key={message.id} onClick={() => message.senderType === 'agent' && openAgent(message.senderId)}>{message.content}</button>)}</AnalyticsCard>)}</div></section>
}

function DepartmentDashboard({ department }: { department: 'support' | 'development' | 'security' | 'marketing' | 'network' }) {
  const { agents, tasks, projects, integrations } = useCommandCentreStore()
  const departmentMap = { support: ['Support'], development: ['Development'], security: ['Security'], marketing: ['Growth'], network: ['Operations', 'Development', 'Security', 'Support', 'Growth'] }
  const relevantAgents = agents.filter((agent) => departmentMap[department].includes(agent.department))
  return <section className="board-view"><div className="section-head"><div><p className="eyebrow">Department dashboard</p><h2>{department === 'network' ? 'Agent Network' : department}</h2></div></div><div className="content-grid three"><AnalyticsCard title="Agents">{relevantAgents.map((agent) => <button className="message-row" key={agent.id} onClick={() => useCommandCentreStore.getState().openAgent(agent.id)}>{agent.avatar} {agent.name} — {agent.currentActivity}</button>)}</AnalyticsCard><AnalyticsCard title="Work queue">{tasks.filter((task) => relevantAgents.some((agent) => agent.id === task.assignedAgentId)).map((task) => <button className="message-row" key={task.id} onClick={() => useCommandCentreStore.getState().openTask(task.id)}>{task.title}</button>)}</AnalyticsCard><AnalyticsCard title="Projects and tools"><p>{projects.map((p) => p.name).join(' · ')}</p><p>{integrations.map((i) => i.name).join(' · ')}</p></AnalyticsCard></div></section>
}

function DrawerShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const closeDrawer = useCommandCentreStore((s) => s.closeDrawer)
  return <aside className="detail-drawer"><div className="drawer-head"><div><p className="eyebrow">Detail panel</p><h2>{title}</h2><span>{subtitle}</span></div><button onClick={closeDrawer}><X size={18} /></button></div>{children}</aside>
}

function ActiveDrawer() {
  const activeDrawer = useCommandCentreStore((s) => s.activeDrawer)
  const selectedCronJobId = useCommandCentreStore((s) => s.selectedCronJobId)
  const cron = useCommandCentreStore((s) => s.cronJobs.find((job) => job.id === selectedCronJobId))
  const selectedApprovalId = useCommandCentreStore((s) => s.selectedApprovalId)
  const approval = useCommandCentreStore((s) => s.approvals.find((entry) => entry.id === selectedApprovalId))
  if (activeDrawer === 'agent') return <AgentDetailDrawer />
  if (activeDrawer === 'task') return <TaskDetailDrawer />
  if (activeDrawer === 'project') return <ProjectDetailPanel />
  if (activeDrawer === 'memory') return <MemoryEditor key={useCommandCentreStore.getState().selectedMemoryId ?? 'memory'} />
  if (activeDrawer === 'notifications') return <NotificationCentre />
  if (activeDrawer === 'cron' && cron) return <DrawerShell title={cron.name} subtitle={`${cron.schedule} · ${cron.timezone}`}><p>{cron.description}</p><CronJobEditor cron={cron} /><div className="profile-grid"><div><span>Last run</span><strong>{fmt(cron.lastRunAt)}</strong></div><div><span>Next run</span><strong>{fmt(cron.nextRunAt)}</strong></div><div><span>Failures</span><strong>{cron.failureCount}</strong></div><div><span>Approval</span><strong>{String(cron.approvalRequired)}</strong></div><div className="wide"><span>Prompt</span><p>{cron.actionPrompt}</p></div><div className="wide"><span>Last output</span><p>{cron.lastOutput}</p></div></div></DrawerShell>
  if (activeDrawer === 'approval' && approval) return <DrawerShell title={approval.title} subtitle={`${approval.type.replaceAll('_', ' ')} · ${approval.riskLevel} risk`}><p>{approval.fullDetails}</p><pre>{approval.diffOrChanges}</pre><p><strong>Recommendation:</strong> {approval.recommendation}</p><ApprovalCard approval={approval} /></DrawerShell>
  return null
}

function MainView() {
  const currentView = useCommandCentreStore((s) => s.currentView)
  if (currentView === 'command') return <CommandCentreHomeDashboard />
  if (currentView === 'office') return <VirtualOfficeCanvas />
  if (currentView === 'agents') return <AgentDirectory />
  if (currentView === 'projects') return <ProjectBoard />
  if (currentView === 'tasks') return <TaskBoard />
  if (currentView === 'workflows') return <WorkflowBuilder />
  if (currentView === 'cron') return <CronJobTable />
  if (currentView === 'memory') return <MemoryBankViewer />
  if (currentView === 'conversations') return <ConversationList />
  if (currentView === 'approvals') return <ApprovalQueue />
  if (currentView === 'support') return <DepartmentDashboard department="support" />
  if (currentView === 'development') return <DepartmentDashboard department="development" />
  if (currentView === 'security') return <DepartmentDashboard department="security" />
  if (currentView === 'marketing') return <DepartmentDashboard department="marketing" />
  if (currentView === 'reports') return <ReportsDashboard />
  if (currentView === 'logs') return <LogsViewer />
  if (currentView === 'integrations') return <IntegrationManager />
  if (currentView === 'settings') return <SettingsPage />
  if (currentView === 'network') return <DepartmentDashboard department="network" />
  return <ErrorState message="Unknown command centre view" />
}

export function CommandCentreLayout() {
  const toggleCommandPalette = useCommandCentreStore((s) => s.toggleCommandPalette)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); toggleCommandPalette(true) }
      if (event.key === 'Escape') toggleCommandPalette(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleCommandPalette])
  return <main className="command-centre-shell"><SidebarNavigation /><section className="workspace"><TopCommandBar /><MainView /><AgentStatusDock /></section><ActiveDrawer /><GlobalCommandPalette /></main>
}
