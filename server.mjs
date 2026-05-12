import http from 'node:http'
import { readFileSync, createReadStream, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const root = '/srv/openclaw-office'
const token = process.env.OPENCLAW_GATEWAY_TOKEN || ''
const port = Number(process.env.PORT || 4173)

function readJsonSafe(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function summarizeListPreview(items, field='detail') {
  if (!Array.isArray(items) || !items.length) return undefined
  const first = items[0]
  if (typeof first === 'string') return first
  return first?.summary || first?.title || first?.detail || first?.[field] || undefined
}

function loadBrainSummary(agentId, workspaceDir) {
  const root = join(workspaceDir, '.openclaw', 'brain')
  const meta = readJsonSafe(join(root, 'brain.json'), null)
  if (!meta) return null
  const memory = readJsonSafe(join(root, 'memory.json'), { long_term_memories: [], mistakes: [], lessons_learned: [], task_history: [], context_summaries: [] })
  const skills = readJsonSafe(join(root, 'skills.json'), { skills: [], new_skills: [] })
  const reflections = readJsonSafe(join(root, 'reflections.json'), { reflections: [] })
  const context = readJsonSafe(join(root, 'context-summary.json'), { summaries: [] })
  const instructions = readJsonSafe(join(root, 'instructions.json'), { reusable_instructions: [] })
  const isolation = readJsonSafe(join(root, 'isolation.json'), { access: { read: [agentId], write: [agentId] } })
  const updatedAt = [memory.updatedAt, skills.updatedAt, reflections.updatedAt, context.updatedAt, instructions.updatedAt].filter(Boolean).sort().at(-1)
  return {
    agentId,
    brainId: meta.brain_id || `brain-${agentId}`,
    root,
    updatedAt,
    isolation: {
      read: isolation?.access?.read || [agentId],
      write: isolation?.access?.write || [agentId],
    },
    buckets: [
      { key: 'long-term memories', count: memory.long_term_memories?.length || 0, preview: summarizeListPreview(memory.long_term_memories) },
      { key: 'skills', count: skills.skills?.length || 0, preview: summarizeListPreview(skills.skills) },
      { key: 'new skills', count: skills.new_skills?.length || 0, preview: summarizeListPreview(skills.new_skills) },
      { key: 'mistakes', count: memory.mistakes?.length || 0, preview: summarizeListPreview(memory.mistakes) },
      { key: 'lessons', count: memory.lessons_learned?.length || 0, preview: summarizeListPreview(memory.lessons_learned) },
      { key: 'task history', count: memory.task_history?.length || 0, preview: summarizeListPreview(memory.task_history) },
      { key: 'context summaries', count: context.summaries?.length || 0, preview: summarizeListPreview(context.summaries) },
      { key: 'instructions', count: instructions.reusable_instructions?.length || 0, preview: summarizeListPreview(instructions.reusable_instructions) },
      { key: 'reflections', count: reflections.reflections?.length || 0, preview: summarizeListPreview(reflections.reflections) },
    ],
    contextPack: {
      summaries: (context.summaries || []).slice(-3).map((item) => item.summary || item.title || '').filter(Boolean),
      lessons: (memory.lessons_learned || []).slice(-3).map((item) => item.detail || item.title || '').filter(Boolean),
      instructions: (instructions.reusable_instructions || []).slice(-3).map((item) => item.detail || item.title || '').filter(Boolean),
    },
  }
}


function writeJson(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

function ensureBrainScaffold(agentId, workspaceDir) {
  const rootDir = join(workspaceDir, '.openclaw', 'brain')
  mkdirSync(rootDir, { recursive: true })
  const now = new Date().toISOString()
  const files = {
    'brain.json': { schemaVersion: 1, agent_id: agentId, brain_id: `brain-${agentId === 'alicia' ? 'main' : agentId}`, root: rootDir, createdAt: now, buckets: { memory: 'memory.json', skills: 'skills.json', reflections: 'reflections.json', context_summary: 'context-summary.json', reusable_instructions: 'instructions.json' } },
    'memory.json': { schemaVersion: 1, agent_id: agentId, updatedAt: now, long_term_memories: [], mistakes: [], lessons_learned: [], task_history: [], context_summaries: [] },
    'skills.json': { schemaVersion: 1, agent_id: agentId, updatedAt: now, skills: [], new_skills: [] },
    'reflections.json': { schemaVersion: 1, agent_id: agentId, updatedAt: now, reflections: [] },
    'context-summary.json': { schemaVersion: 1, agent_id: agentId, updatedAt: now, summaries: [] },
    'instructions.json': { schemaVersion: 1, agent_id: agentId, updatedAt: now, reusable_instructions: [] },
    'isolation.json': { schemaVersion: 1, agent_id: agentId, access: { read: [agentId === 'alicia' ? 'main' : agentId], write: [agentId === 'alicia' ? 'main' : agentId], explicit_allow: [] } },
  }
  for (const [name, data] of Object.entries(files)) {
    const file = join(rootDir, name)
    if (!existsSync(file)) writeJson(file, data)
  }
  return rootDir
}

function appendUniqueEntry(list, matcher, entry) {
  if (!Array.isArray(list)) return [entry]
  if (list.some(matcher)) return list
  return [entry, ...list]
}

function enrichBrainFromWorkspace(agentId, workspaceDir) {
  const rootDir = ensureBrainScaffold(agentId, workspaceDir)
  const now = new Date().toISOString()
  const memoryPath = join(rootDir, 'memory.json')
  const skillsPath = join(rootDir, 'skills.json')
  const reflectionsPath = join(rootDir, 'reflections.json')
  const contextPath = join(rootDir, 'context-summary.json')
  const instructionsPath = join(rootDir, 'instructions.json')

  const memory = readJsonSafe(memoryPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, long_term_memories: [], mistakes: [], lessons_learned: [], task_history: [], context_summaries: [] })
  const skills = readJsonSafe(skillsPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, skills: [], new_skills: [] })
  const reflections = readJsonSafe(reflectionsPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, reflections: [] })
  const context = readJsonSafe(contextPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, summaries: [] })
  const instructions = readJsonSafe(instructionsPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, reusable_instructions: [] })

  const workspaceFiles = ['README.md', 'SYSTEM.md', 'IDENTITY.md', 'WORKFLOW_RULES.md', 'DELIVERY_SCOPE.md', 'ABUSE_REVIEW.md', 'DAILY_MARKETING_BRIEF.md', 'skills/STARTER_PACK.md']
    .map((name) => ({ name, path: join(workspaceDir, name) }))
    .filter((item) => existsSync(item.path))
    .map((item) => ({ ...item, preview: readFileSync(item.path, 'utf8').slice(0, 600).replace(/\s+/g, ' ').trim() }))

  for (const file of workspaceFiles) {
    skills.skills = appendUniqueEntry(skills.skills, (entry) => entry?.title === file.name, { title: file.name, detail: file.preview, savedAt: now })
  }

  const identity = workspaceFiles.find((item) => item.name === 'IDENTITY.md')
  if (identity) {
    memory.long_term_memories = appendUniqueEntry(memory.long_term_memories, (entry) => entry?.title === 'Identity profile', { title: 'Identity profile', detail: identity.preview, savedAt: now })
  }

    if (workspaceFiles.length) {
    context.summaries = appendUniqueEntry(context.summaries, (entry) => entry?.title === 'Workspace summary', { title: 'Workspace summary', summary: workspaceFiles.map((item) => item.name).join(', '), savedAt: now })
    instructions.reusable_instructions = appendUniqueEntry(instructions.reusable_instructions, (entry) => entry?.title === 'Workspace starter pack', { title: 'Workspace starter pack', detail: workspaceFiles.map((item) => item.name).join(', '), savedAt: now })
  }

  if (agentId === 'john') {
    reflections.reflections = appendUniqueEntry(reflections.reflections, (entry) => entry?.title === 'Current focus', { title: 'Current focus', detail: 'Engineering duplicate-account abuse prevention and app/web delivery work.', savedAt: now })
    memory.task_history = appendUniqueEntry(memory.task_history, (entry) => entry?.title === 'Abuse prevention lane', { title: 'Abuse prevention lane', detail: 'Backend-first risk controls, signup enforcement, admin controls.', savedAt: now })
  }
  if (agentId === 'lia') {
    reflections.reflections = appendUniqueEntry(reflections.reflections, (entry) => entry?.title === 'Current focus', { title: 'Current focus', detail: 'Security review for abuse detection, false positives, and rollout safety.', savedAt: now })
    memory.lessons_learned = appendUniqueEntry(memory.lessons_learned, (entry) => entry?.title === 'Security review posture', { title: 'Security review posture', detail: 'Abuse controls need layered detection with low false-positive risk.', savedAt: now })
  }
  if (agentId === 'presh') {
    reflections.reflections = appendUniqueEntry(reflections.reflections, (entry) => entry?.title === 'Current focus', { title: 'Current focus', detail: 'Daily marketing research, goer notifications, and host campaign support.', savedAt: now })
    memory.task_history = appendUniqueEntry(memory.task_history, (entry) => entry?.title === 'Marketing workflow', { title: 'Marketing workflow', detail: 'Prepare trend-backed campaign material for Angela handoff.', savedAt: now })
  }

  memory.updatedAt = now
  skills.updatedAt = now
  reflections.updatedAt = now
  context.updatedAt = now
  instructions.updatedAt = now

  writeJson(memoryPath, memory)
  writeJson(skillsPath, skills)
  writeJson(reflectionsPath, reflections)
  writeJson(contextPath, context)
  writeJson(instructionsPath, instructions)
}

function loadAngelaRuntimeActivity() {
  try {
    return JSON.parse(readFileSync('/root/.openclaw/workspace/angela/runtime_activity.json', 'utf8'))
  } catch {
    return { updatedAt: null, items: [] }
  }
}

function loadAngelaRuntimeThreads() {
  try {
    return JSON.parse(readFileSync('/root/.openclaw/workspace/angela/runtime_threads.json', 'utf8'))
  } catch {
    return { updatedAt: null, threads: [] }
  }
}

function loadOpenClawSessions() {
  try {
    const registry = JSON.parse(readFileSync('/root/.openclaw/agents/main/sessions/sessions.json', 'utf8'))
    return Object.entries(registry).map(([key, value]) => ({
      key,
      kind: value.chatType || 'direct',
      age: value.updatedAt ? `${Math.max(0, Math.round((Date.now() - value.updatedAt) / 60000))}m ago` : 'unknown',
      model: 'gpt-5.4',
      tokens: '',
      updatedAt: value.updatedAt || 0,
      sessionFile: value.sessionFile,
      lastTo: value.lastTo,
      origin: value.origin?.label || value.lastTo || null,
    }))
  } catch {
    return []
  }
}

function getSessionFreshnessMinutes(session) {
  if (!session?.updatedAt) return Number.POSITIVE_INFINITY
  return Math.max(0, Math.round((Date.now() - session.updatedAt) / 60000))
}

function inferStatusFromSession(session) {
  if (!session) return 'idle'
  const freshness = getSessionFreshnessMinutes(session)
  if (freshness <= 10) return 'working'
  if (freshness <= 60) return 'reviewing'
  return 'idle'
}

function inferAnimationFromStatus(status) {
  if (status === 'working') return 'talking'
  if (status === 'reviewing') return 'reviewing'
  if (status === 'blocked') return 'pairing'
  return 'sitting'
}

function inferProgressFromTokens(tokens) {
  if (!tokens) return 0
  const match = tokens.match(/\((\d+)%\)/)
  if (!match) return 0
  return Math.max(5, Math.min(95, Number(match[1])))
}

function mapSessionToAgentId(sessionKey = '') {
  if (sessionKey.includes('angela')) return 'angela'
  if (sessionKey.includes('john')) return 'john'
  if (sessionKey.includes('lia')) return 'lia'
  if (sessionKey.includes('presh')) return 'presh'
  if (sessionKey.includes('oryn')) return 'oryn'
  if (sessionKey.includes('drone-dev')) return 'drone-dev'
  if (sessionKey.includes('drone-growth')) return 'drone-growth'
  if (sessionKey.includes('subagent')) return 'oryn'
  return 'alicia'
}

function sessionTitleForAgent(agentId) {
  if (agentId === 'angela') return 'Angela live session'
  if (agentId === 'john') return 'John live session'
  if (agentId === 'lia') return 'Lia live session'
  if (agentId === 'presh') return 'Presh live session'
  if (agentId === 'oryn') return 'Oryn live session'
  if (agentId === 'drone-dev') return 'Drone Dev live session'
  if (agentId === 'drone-growth') return 'Drone Growth live session'
  return 'Mission Control live session'
}

function sessionToTask(session, index) {
  const agentId = mapSessionToAgentId(session.key)
  const status = inferStatusFromSession(session)
  const progress = inferProgressFromTokens(session.tokens)
  return {
    id: `task-session-${index}`,
    title: sessionTitleForAgent(agentId),
    detail: `${session.origin || session.key} · ${session.age}. This task card reflects live session presence, not a structured backend task feed.`,
    progress,
    status,
    documentIds: [],
    updatedAt: new Date().toISOString(),
    ownerId: agentId,
    completedItems: [],
    todoItems: ['Connect a real task source if you want structured task details here.'],
  }
}

function honestPlaceholderTask(agent) {
  return {
    id: `task-unavailable-${agent.id}`,
    title: `${agent.name} task data unavailable`,
    detail: 'This screen no longer shows invented work items. A real backend task feed is still missing for this agent.',
    progress: 0,
    status: 'blocked',
    documentIds: [],
    updatedAt: new Date().toISOString(),
    ownerId: agent.id,
    todoItems: ['Connect this agent to a real backend task source.'],
    completedItems: [],
  }
}

const officeZones = [
  { id: 'zone-reception', label: 'Reception', x: 78, y: 76, width: 212, height: 128, tone: 'reception' },
  { id: 'zone-work-a', label: 'Workspace A', x: 308, y: 76, width: 486, height: 156, tone: 'workspace' },
  { id: 'zone-work-b', label: 'Workspace B', x: 308, y: 232, width: 486, height: 176, tone: 'workspace' },
  { id: 'zone-meeting', label: 'Meeting Suite', x: 814, y: 76, width: 190, height: 182, tone: 'meeting' },
  { id: 'zone-lounge', label: 'Lounge', x: 814, y: 282, width: 190, height: 126, tone: 'lounge' },
  { id: 'zone-corridor', label: 'Main Corridor', x: 78, y: 430, width: 680, height: 122, tone: 'corridor' },
  { id: 'zone-drone-ops', label: 'Drone by Nature Ops', x: 772, y: 430, width: 232, height: 122, tone: 'workspace' },
]

const officeState = {
  generatedAt: new Date().toISOString(),
  gateway: {
    connected: Boolean(token),
    url: process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789',
    lastUpdatedAt: new Date().toISOString(),
  },
  agents: [],
  tasks: [],
  documents: [],
  interactions: [],
  zones: officeZones,
  activity: [],
  brains: [],
  warnings: [],
}

const defaultAgents = [
  { id: 'alicia', name: 'Alicia', role: 'Coordinator', color: '#7c3aed', status: 'working', initials: 'AL', face: '✨', avatarUrl: '/avatars/alicia-pixel.svg', animation: 'reviewing', deskId: 'desk-alicia', zoneId: 'zone-work-a', position: { x: 430, y: 164 }, target: { x: 430, y: 164 }, currentTaskId: 'task-office-1', note: 'Coordinating Mission Control and agent routing', speechBubble: 'office live' },
  { id: 'angela', name: 'Angela', role: 'Guestlist Ops', color: '#10b981', status: 'idle', initials: 'AN', face: '🧠', avatarUrl: '/avatars/angela-pixel.svg', animation: 'sitting', deskId: 'desk-angela', zoneId: 'zone-work-b', position: { x: 618, y: 300 }, target: { x: 618, y: 300 }, currentTaskId: 'task-guestlist-1', note: 'Watching Guestlist support, verification, payments, and moderation', speechBubble: 'monitoring' },
  { id: 'oryn', name: 'Oryn', role: 'Drone Ops Manager', color: '#f59e0b', status: 'working', initials: 'OR', face: '🛠️', avatarUrl: '/avatars/oryn-pixel-small.svg', animation: 'talking', deskId: 'desk-oryn', zoneId: 'zone-drone-ops', position: { x: 912, y: 470 }, target: { x: 912, y: 470 }, currentTaskId: 'task-drone-1', note: 'Running Drone by Nature chat and plugin rollout planning', speechBubble: 'ops live' },
  { id: 'drone-dev', name: 'Drone Dev', role: 'WordPress Developer', color: '#2563eb', status: 'working', initials: 'DD', face: '🧩', avatarUrl: '/avatars/drone-dev-pixel.svg', animation: 'reviewing', deskId: 'desk-drone-dev', zoneId: 'zone-drone-ops', position: { x: 826, y: 510 }, target: { x: 826, y: 510 }, currentTaskId: 'task-drone-dev-1', note: 'Drone by Nature WordPress and DirectAdmin development', speechBubble: 'building' },
  { id: 'drone-growth', name: 'Drone Growth', role: 'SEO and Growth', color: '#c026d3', status: 'reviewing', initials: 'DG', face: '📈', avatarUrl: '/avatars/drone-growth-pixel.svg', animation: 'pairing', deskId: 'desk-drone-growth', zoneId: 'zone-drone-ops', position: { x: 994, y: 510 }, target: { x: 994, y: 510 }, currentTaskId: 'task-drone-growth-1', note: 'Drone by Nature SEO and growth strategy', speechBubble: 'auditing' },
  { id: 'john', name: 'John', role: 'Senior Developer', color: '#2563eb', status: 'working', initials: 'JO', face: '💻', avatarUrl: '/avatars/drone-dev-pixel.svg', animation: 'reviewing', deskId: 'desk-john', zoneId: 'zone-work-a', position: { x: 530, y: 164 }, target: { x: 530, y: 164 }, currentTaskId: 'task-john-1', note: 'Driving app and website engineering work', speechBubble: 'coding' },
  { id: 'lia', name: 'Lia', role: 'Cybersecurity Specialist', color: '#dc2626', status: 'reviewing', initials: 'LI', face: '🛡️', avatarUrl: '/avatars/drone-growth-pixel.svg', animation: 'pairing', deskId: 'desk-lia', zoneId: 'zone-work-a', position: { x: 660, y: 164 }, target: { x: 660, y: 164 }, currentTaskId: 'task-lia-1', note: 'Reviewing abuse prevention and security posture', speechBubble: 'reviewing' },
  { id: 'presh', name: 'Presh', role: 'Marketing Researcher', color: '#db2777', status: 'working', initials: 'PR', face: '📈', avatarUrl: '/avatars/drone-growth-pixel.svg', animation: 'talking', deskId: 'desk-presh', zoneId: 'zone-meeting', position: { x: 904, y: 164 }, target: { x: 904, y: 164 }, currentTaskId: 'task-presh-1', note: 'Curating daily goer and host notification material', speechBubble: 'researching' },
]

setInterval(() => {
  officeState.generatedAt = new Date().toISOString()
  officeState.gateway.lastUpdatedAt = officeState.generatedAt
  const angelaRuntime = loadAngelaRuntimeActivity()
  const angelaThreads = loadAngelaRuntimeThreads()
  const liveSessions = loadOpenClawSessions()
  const hasAngelaThreads = angelaThreads.threads.length > 0
  const hasAngelaActivity = angelaRuntime.items.length > 0

  const sessionMap = {
    alicia: liveSessions.find((s) => s.key === 'agent:main:whatsapp:direct:+27745741910') || liveSessions.find((s) => mapSessionToAgentId(s.key) === 'alicia'),
    angela: liveSessions.find((s) => s.key === 'agent:main:angela-production') || liveSessions.find((s) => mapSessionToAgentId(s.key) === 'angela'),
    oryn: liveSessions.find((s) => s.key.includes('oryn')) || liveSessions.find((s) => s.key.includes('subagent')),
    john: liveSessions.find((s) => mapSessionToAgentId(s.key) === 'john'),
    lia: liveSessions.find((s) => mapSessionToAgentId(s.key) === 'lia'),
    presh: liveSessions.find((s) => mapSessionToAgentId(s.key) === 'presh'),
  }

  const agentMap = new Map([...defaultAgents, ...officeState.agents].map((agent) => [agent.id, agent]))
  officeState.agents = defaultAgents.map((seed) => ({ ...(agentMap.get(seed.id) || seed) })).map((agent) => {
    const session = sessionMap[agent.id] || null
    const liveStatus = inferStatusFromSession(session)

    if (agent.id === 'alicia') {
      const status = liveStatus === 'idle' ? 'working' : liveStatus
      return {
        ...agent,
        status,
        animation: inferAnimationFromStatus(status),
        target: { x: 430, y: 164 },
        note: session ? `Live session ${session.age}` : agent.note,
        speechBubble: session ? 'office live' : 'routing office',
      }
    }

    if (agent.id === 'angela') {
      const status = hasAngelaThreads ? 'reviewing' : hasAngelaActivity ? 'working' : liveStatus
      return {
        ...agent,
        status,
        animation: hasAngelaThreads ? 'talking' : inferAnimationFromStatus(status),
        target: { x: 618, y: 300 },
        note: session ? `Live session ${session.age}` : agent.note,
        speechBubble: hasAngelaThreads ? 'support live' : hasAngelaActivity ? 'watching' : session ? 'monitoring' : 'standby',
      }
    }

    if (agent.id === 'john') {
      const status = session ? liveStatus : 'working'
      return {
        ...agent,
        status,
        animation: inferAnimationFromStatus(status),
        target: { x: 530, y: 164 },
        note: session ? `Live session ${session.age}` : agent.note,
        speechBubble: session ? 'coding' : 'planning',
      }
    }

    if (agent.id === 'lia') {
      const status = session ? liveStatus : 'reviewing'
      return {
        ...agent,
        status,
        animation: inferAnimationFromStatus(status === 'idle' ? 'reviewing' : status),
        target: { x: 660, y: 164 },
        note: session ? `Live session ${session.age}` : agent.note,
        speechBubble: session ? 'reviewing' : 'guarding',
      }
    }

    if (agent.id === 'presh') {
      const status = session ? liveStatus : 'working'
      return {
        ...agent,
        status,
        animation: inferAnimationFromStatus(status === 'idle' ? 'working' : status),
        target: { x: 904, y: 164 },
        note: session ? `Live session ${session.age}` : agent.note,
        speechBubble: session ? 'researching' : 'drafting',
      }
    }

    return {
      ...agent,
      status: liveStatus,
      animation: inferAnimationFromStatus(liveStatus),
      target: { x: 892, y: 336 },
      note: session ? `Live session ${session.age}` : agent.note,
      speechBubble: session ? 'standby' : 'offline',
    }
  })

  const liveAngelaTasks = angelaThreads.threads.slice(0, 3).map((thread, index) => ({
    id: `task-angela-live-${index}`,
    title: `Support thread: ${thread.issueType}`,
    detail: thread.latestUserMessage,
    progress: thread.status === 'resolved' ? 100 : thread.status === 'awaiting_user' ? 60 : thread.status === 'in_progress' ? 72 : 48,
    status: thread.status === 'resolved' ? 'reviewing' : thread.status === 'awaiting_user' ? 'blocked' : 'working',
    documentIds: [],
    updatedAt: thread.updatedAt || officeState.generatedAt,
    ownerId: 'angela',
    completedItems: [],
    todoItems: thread.status === 'awaiting_user' ? ['Waiting for user reply.'] : [],
  }))
  officeState.threadStates = angelaThreads.threads.slice(0, 5)
  const sessionTasks = liveSessions
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 8)
    .map(sessionToTask)

  const activeTaskOwners = new Set([...liveAngelaTasks, ...sessionTasks].map((task) => task.ownerId).filter(Boolean))
  const placeholderTasks = officeState.agents
    .filter((agent) => !activeTaskOwners.has(agent.id))
    .map(honestPlaceholderTask)

  officeState.tasks = [...liveAngelaTasks, ...sessionTasks, ...placeholderTasks].slice(0, 12)
  officeState.documents = []
  officeState.warnings = [
    'Task cards without a real task backend now say so explicitly.',
    'The documents panel is currently unavailable because no live document source is connected.',
    'Brain summaries are live only when the matching workspace brain files exist and can be read.',
  ]

  officeState.activity = [
    ...liveSessions
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 3)
      .map((session, index) => ({
      id: `session-live-${index}`,
      timestamp: officeState.generatedAt,
      agentId: mapSessionToAgentId(session.key),
      kind: 'system',
      title: 'OpenClaw session active',
      detail: `${session.key} · ${session.age} · ${session.tokens || session.model}`,
    })),
    ...angelaRuntime.items.slice(0, 5).map((item, index) => ({
      id: `angela-live-${index}`,
      timestamp: item.at || officeState.generatedAt,
      agentId: 'angela',
      kind: item.type === 'ticket' ? 'message' : 'system',
      title: item.title,
      detail: item.detail,
    })),
    { id: 'act-1', timestamp: officeState.generatedAt, agentId: 'alicia', kind: 'task', title: 'Mission Control is live', detail: 'Office now auto-refreshes and no manual reload should be needed.' },
    { id: 'act-2', timestamp: officeState.generatedAt, agentId: 'angela', kind: 'system', title: 'Angela 5-minute watch enabled', detail: 'Guestlist production checks are now scheduled every 5 minutes.' },
    { id: 'act-3', timestamp: officeState.generatedAt, agentId: 'oryn', kind: 'message', title: 'Idle support presence', detail: 'Oryn remains available for future integration and ops work.' },
  ].slice(0, 8)
  officeState.interactions = hasAngelaThreads || hasAngelaActivity
    ? [{ id: 'int-live', fromAgentId: 'alicia', toAgentId: 'angela', kind: 'handoff', label: 'Ops handoff' }]
    : []

  ;[['alicia','/root/.openclaw/workspace'],['angela','/root/.openclaw/workspace/angela'],['oryn','/root/.openclaw/workspace/oryn'],['drone-dev','/root/.openclaw/workspace/drone-dev'],['drone-growth','/root/.openclaw/workspace/drone-growth'],['john','/root/.openclaw/workspace/john'],['lia','/root/.openclaw/workspace/lia'],['presh','/root/.openclaw/workspace/presh']].forEach(([agentId, workspaceDir]) => enrichBrainFromWorkspace(agentId, workspaceDir))

  officeState.brains = [
    loadBrainSummary('alicia', '/root/.openclaw/workspace'),
    loadBrainSummary('angela', '/root/.openclaw/workspace/angela'),
    loadBrainSummary('oryn', '/root/.openclaw/workspace/oryn'),
    loadBrainSummary('drone-dev', '/root/.openclaw/workspace/drone-dev'),
    loadBrainSummary('drone-growth', '/root/.openclaw/workspace/drone-growth'),
    loadBrainSummary('john', '/root/.openclaw/workspace/john'),
    loadBrainSummary('lia', '/root/.openclaw/workspace/lia'),
    loadBrainSummary('presh', '/root/.openclaw/workspace/presh'),
  ].filter(Boolean)
}, 5000)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}


function saveBrainEntry(agentId, bucket, title, detail) {
  const workspaceMap = {
    alicia: '/root/.openclaw/workspace',
    angela: '/root/.openclaw/workspace/angela',
    oryn: '/root/.openclaw/workspace/oryn',
    'drone-dev': '/root/.openclaw/workspace/drone-dev',
    'drone-growth': '/root/.openclaw/workspace/drone-growth',
  }
  const root = join(workspaceMap[agentId], '.openclaw', 'brain')
  const memoryPath = join(root, 'memory.json')
  const reflectionsPath = join(root, 'reflections.json')
  const contextPath = join(root, 'context-summary.json')
  const now = new Date().toISOString()
  if (bucket === 'reflections') {
    const data = readJsonSafe(reflectionsPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, reflections: [] })
    data.reflections.push({ title, detail, savedAt: now })
    data.updatedAt = now
    writeFileSync(reflectionsPath, JSON.stringify(data, null, 2) + '\n')
    return
  }
  if (bucket === 'context_summaries') {
    const data = readJsonSafe(contextPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, summaries: [] })
    data.summaries.push({ title, summary: detail, savedAt: now })
    data.updatedAt = now
    writeFileSync(contextPath, JSON.stringify(data, null, 2) + '\n')
    return
  }
  const data = readJsonSafe(memoryPath, { schemaVersion: 1, agent_id: agentId, updatedAt: now, long_term_memories: [], mistakes: [], lessons_learned: [], task_history: [], context_summaries: [] })
  data[bucket] ||= []
  data[bucket].push({ title, detail, savedAt: now })
  data.updatedAt = now
  writeFileSync(memoryPath, JSON.stringify(data, null, 2) + '\n')
}

async function runDeskTask(agentId) {
  if (agentId === 'angela') {
    return await sendAgentMessage({ agentId: 'angela', message: 'Give me a concise operational status update and next actions from your current desk context.' })
  }
  if (agentId === 'oryn') {
    return { reply: 'Oryn desk task triggered. Current role is standby and integration prep.' }
  }
  return { reply: 'Alicia desk task triggered. Mission Control remains active in this main session.' }
}

async function sendAgentMessage(body) {
  const { agentId, sessionKey, label, message } = body

  if (agentId === 'alicia') {
    return { reply: 'Alicia is this main Mission Control assistant. For now, keep chatting with me in WhatsApp while I finish the in-app loopback path.' }
  }

  if (agentId === 'angela') {
    const response = await fetch('http://127.0.0.1:18789/tools/invoke', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'sessions_spawn',
        args: {
          task: message,
          agentId: 'angela',
          runtime: 'subagent',
          mode: 'run',
          cleanup: 'delete',
          timeoutSeconds: 180,
          runTimeoutSeconds: 180,
          lightContext: true,
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Gateway error ${response.status}: ${text}`)
    }

    const data = await response.json()
    const reply = data?.result?.reply
      ?? data?.result?.content?.find?.((item) => item?.type === 'text')?.text

    return { reply: reply ?? 'No reply returned.' }
  }

  if (!sessionKey && !label) {
    throw new Error('No target session available for this agent yet.')
  }

  const response = await fetch('http://127.0.0.1:18789/tools/invoke', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tool: 'sessions_send',
      args: {
        ...(sessionKey ? { sessionKey } : {}),
        ...(!sessionKey && label ? { label } : {}),
        message,
        timeoutSeconds: 120,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gateway error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const directReply = data?.result?.reply
  const toolText = data?.result?.content?.find?.((item) => item?.type === 'text')?.text

  if (directReply) return { reply: directReply }

  if (toolText) {
    try {
      const parsed = JSON.parse(toolText)
      return { reply: parsed.reply ?? parsed.error ?? 'No reply returned.' }
    } catch {
      return { reply: toolText }
    }
  }

  return { reply: 'No reply returned.' }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/office-state') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(officeState))
      return
    }

    if (req.method === 'POST' && req.url === '/api/agent-chat') {
      const body = await readJson(req)
      const payload = await sendAgentMessage(body)
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(payload))
      return
    }

    if (req.method === 'POST' && req.url === '/api/brain-write') {
      const body = await readJson(req)
      saveBrainEntry(body.agentId, body.bucket, body.title, body.detail)
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: true, message: `Saved to ${body.agentId} brain.` }))
      return
    }

    if (req.method === 'POST' && req.url === '/api/agent-task') {
      const body = await readJson(req)
      const payload = await runDeskTask(body.agentId)
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(payload))
      return
    }

    const rawPath = req.url === '/' ? '/index.html' : req.url || '/index.html'
    const safePath = normalize(rawPath).replace(/^\.\.(\/|\\|$)+/, '')
    let filePath = join(root, safePath)

    if (!existsSync(filePath) || rawPath.startsWith('/api/')) {
      filePath = join(root, 'index.html')
    }

    const type = mime[extname(filePath)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type })
    createReadStream(filePath).pipe(res)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }))
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`openclaw-office server listening on http://127.0.0.1:${port}`)
})
