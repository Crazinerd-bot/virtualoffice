import { create } from 'zustand'

import * as mock from '../data/commandCentreMock'
import type { Agent, AgentMemory, ApprovalRequest, CommandCentreView, Conversation, CronJob, Integration, LogEntry, Message, Notification, OfficeMode, Project, Report, Task, TaskStatus, Workflow } from '../types/commandCentre'

const nowIso = () => new Date().toISOString()
const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

type Drawer = 'agent' | 'task' | 'project' | 'cron' | 'memory' | 'approval' | 'notifications' | 'settings' | null

type CommandCentreState = {
  agents: Agent[]
  tasks: Task[]
  projects: Project[]
  workflows: Workflow[]
  cronJobs: CronJob[]
  memoryBanks: typeof mock.memoryBanks
  memories: AgentMemory[]
  approvals: ApprovalRequest[]
  conversations: Conversation[]
  messages: Message[]
  notifications: Notification[]
  logs: LogEntry[]
  integrations: Integration[]
  reports: Report[]
  rooms: typeof mock.rooms
  currentView: CommandCentreView
  currentMode: OfficeMode
  selectedAgentId: string | null
  selectedTaskId: string | null
  selectedProjectId: string | null
  selectedMemoryId: string | null
  selectedApprovalId: string | null
  selectedCronJobId: string | null
  activeDrawer: Drawer
  searchQuery: string
  commandPaletteOpen: boolean
  toast: string | null
  setView: (view: CommandCentreView) => void
  setMode: (mode: OfficeMode) => void
  openAgent: (agentId: string) => void
  openTask: (taskId: string) => void
  openProject: (projectId: string) => void
  openMemory: (memoryId: string) => void
  openApproval: (approvalId: string) => void
  openCron: (cronJobId: string) => void
  closeDrawer: () => void
  setSearchQuery: (query: string) => void
  toggleCommandPalette: (open?: boolean) => void
  showToast: (message: string) => void
  clearToast: () => void
  createTaskFromInstruction: (instruction: string, assignedAgentId?: string) => void
  addAgent: (name: string, title: string) => void
  pauseAgent: (agentId: string) => void
  resumeAgent: (agentId: string) => void
  archiveAgent: (agentId: string) => void
  sendMessage: (agentId: string, content: string, intent?: Message['intent']) => void
  convertMessageToTask: (messageId: string) => void
  saveMessageToMemory: (messageId: string) => void
  updateTaskStatus: (taskId: string, taskStatus: TaskStatus) => void
  createCronJob: (name?: string, assignedAgentId?: string) => void
  toggleCronJob: (cronJobId: string) => void
  runCronNow: (cronJobId: string) => void
  updateMemory: (memoryId: string, content: string) => void
  approveMemory: (memoryId: string) => void
  rejectMemory: (memoryId: string) => void
  approveRequest: (approvalId: string) => void
  rejectRequest: (approvalId: string) => void
  requestChanges: (approvalId: string) => void
  markNotificationRead: (notificationId: string) => void
  snoozeNotification: (notificationId: string) => void
  resolveLog: (logId: string) => void
  testIntegration: (integrationId: string) => void
}

const addLog = (state: CommandCentreState, log: Omit<LogEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'status' | 'metadata' | 'timestamp' | 'resolved'>): LogEntry[] => [
  { id: makeId('log'), createdAt: nowIso(), updatedAt: nowIso(), createdBy: 'owner', updatedBy: 'owner', status: 'active', metadata: {}, timestamp: nowIso(), resolved: false, ...log },
  ...state.logs,
]

export const useCommandCentreStore = create<CommandCentreState>((set, get) => ({
  agents: mock.agents,
  tasks: mock.tasks,
  projects: mock.projects,
  workflows: mock.workflows,
  cronJobs: mock.cronJobs,
  memoryBanks: mock.memoryBanks,
  memories: mock.memories,
  approvals: mock.approvals,
  conversations: mock.conversations,
  messages: mock.messages,
  notifications: mock.notifications,
  logs: mock.logs,
  integrations: mock.integrations,
  reports: mock.reports,
  rooms: mock.rooms,
  currentView: 'command',
  currentMode: 'command_centre',
  selectedAgentId: 'alicia',
  selectedTaskId: 'task-guestlist-review-loading',
  selectedProjectId: 'guestlist',
  selectedMemoryId: null,
  selectedApprovalId: null,
  selectedCronJobId: null,
  activeDrawer: null,
  searchQuery: '',
  commandPaletteOpen: false,
  toast: null,
  setView: (currentView) => set({ currentView, activeDrawer: null }),
  setMode: (currentMode) => set({ currentMode }),
  openAgent: (selectedAgentId) => set({ selectedAgentId, activeDrawer: 'agent' }),
  openTask: (selectedTaskId) => set({ selectedTaskId, activeDrawer: 'task' }),
  openProject: (selectedProjectId) => set({ selectedProjectId, activeDrawer: 'project' }),
  openMemory: (selectedMemoryId) => set({ selectedMemoryId, activeDrawer: 'memory' }),
  openApproval: (selectedApprovalId) => set({ selectedApprovalId, activeDrawer: 'approval' }),
  openCron: (selectedCronJobId) => set({ selectedCronJobId, activeDrawer: 'cron' }),
  closeDrawer: () => set({ activeDrawer: null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleCommandPalette: (open) => set((state) => ({ commandPaletteOpen: open ?? !state.commandPaletteOpen })),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  createTaskFromInstruction: (instruction, assignedAgentId = 'john') => {
    const state = get()
    const id = makeId('task')
    const newTask: Task = {
      id,
      createdAt: nowIso(), updatedAt: nowIso(), createdBy: 'owner', updatedBy: 'alicia', status: 'active', metadata: {},
      title: instruction.length > 80 ? `${instruction.slice(0, 77)}...` : instruction,
      description: `Alicia-created task from instruction: ${instruction}. Must include quality gate, review, risk notes, and user approval if risky.`,
      projectId: state.selectedProjectId ?? 'guestlist', department: 'Operations', assignedAgentId, createdByAgentId: 'alicia', priority: 'high', taskStatus: 'assigned', dueDate: nowIso(), dependencies: [], tags: ['alicia-delegated'], attachments: [], linkedConversationIds: [], linkedFileIds: [], linkedCommits: [], linkedTicketIds: [], linkedMemoryIds: [], approvalRequired: true, reviewRequired: true, securityReviewRequired: assignedAgentId === 'john' || assignedAgentId === 'drone-dev', deploymentRequired: false, recurring: false, estimatedEffortHours: 2, actualTimeHours: 0, notes: ['Created by Alicia from user instruction.'], acceptanceCriteria: ['Requirement is clear', 'Responsible agent confirms plan', 'Review result is attached', 'Final summary is ready for user approval'], finalOutput: '', reviewResult: 'Pending',
    }
    set({
      tasks: [newTask, ...state.tasks],
      selectedTaskId: id,
      activeDrawer: 'task',
      logs: addLog(state, { type: 'task_change', severity: 'success', agentId: 'alicia', projectId: newTask.projectId, title: 'Alicia created delegated task', detail: instruction, linkedRecordId: id }),
      toast: `Alicia created a task and assigned it to ${state.agents.find((a) => a.id === assignedAgentId)?.name ?? 'an agent'}.`,
    })
  },
  addAgent: (name, title) => {
    const state = get()
    const id = makeId(name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    const newAgent: Agent = { ...mock.agents[0], id, name, title, initials: name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase(), avatar: '🤖', role: 'custom', department: 'Custom', description: `${title} agent awaiting full configuration.`, status: 'active', currentStatus: 'idle', currentActivity: 'New agent awaiting test run.', activeTaskId: undefined, assignedTaskCount: 0, completedToday: 0, alertCount: 1, performanceScore: 0, costUsedToday: 0, roomId: 'operations', officePosition: { x: 10 + state.agents.length * 7, y: 88 }, createdAt: nowIso(), updatedAt: nowIso() }
    set({ agents: [...state.agents, newAgent], selectedAgentId: id, activeDrawer: 'agent', toast: `${name} created. Configure permissions before granting powerful tools.`, logs: addLog(state, { type: 'permission_change', severity: 'warning', agentId: id, title: 'New agent created', detail: 'New powerful agents require owner approval before sensitive permissions.', linkedRecordId: id }) })
  },
  pauseAgent: (agentId) => set((state) => ({ agents: state.agents.map((a) => a.id === agentId ? { ...a, currentStatus: 'paused', updatedAt: nowIso(), nextAction: 'Paused by owner' } : a), toast: 'Agent paused.', logs: addLog(state, { type: 'agent_action', severity: 'warning', agentId, title: 'Agent paused', detail: 'Human override paused the agent.', linkedRecordId: agentId }) })),
  resumeAgent: (agentId) => set((state) => ({ agents: state.agents.map((a) => a.id === agentId ? { ...a, currentStatus: 'idle', updatedAt: nowIso(), nextAction: 'Resume queued work' } : a), toast: 'Agent resumed.', logs: addLog(state, { type: 'agent_action', severity: 'success', agentId, title: 'Agent resumed', detail: 'Human override resumed the agent.', linkedRecordId: agentId }) })),
  archiveAgent: (agentId) => set((state) => ({ agents: state.agents.map((a) => a.id === agentId ? { ...a, status: 'archived', currentStatus: 'offline', updatedAt: nowIso() } : a), toast: 'Agent archived. Audit log recorded.', logs: addLog(state, { type: 'permission_change', severity: 'warning', agentId, title: 'Agent archived', detail: 'Agent archived by owner.', linkedRecordId: agentId }) })),
  sendMessage: (agentId, content, intent = 'ask') => {
    const state = get()
    let conversation = state.conversations.find((c) => c.participantAgentIds.includes(agentId) && c.type === 'one_on_one')
    const newConversations = [...state.conversations]
    if (!conversation) {
      conversation = { id: makeId('conv'), createdAt: nowIso(), updatedAt: nowIso(), createdBy: 'owner', updatedBy: 'owner', status: 'active', metadata: {}, title: `Chat with ${state.agents.find((a) => a.id === agentId)?.name ?? agentId}`, type: 'one_on_one', participantAgentIds: [agentId], pinnedMessageIds: [], decisionMessageIds: [] }
      newConversations.unshift(conversation)
    }
    const userMessage: Message = { id: makeId('msg'), createdAt: nowIso(), updatedAt: nowIso(), createdBy: 'owner', updatedBy: 'owner', status: 'active', metadata: {}, conversationId: conversation.id, senderType: 'user', senderId: 'owner', content, intent, attachments: [], internalNote: false, pinned: false, decision: false }
    const agent = state.agents.find((a) => a.id === agentId)
    const reply: Message = { ...userMessage, id: makeId('msg'), senderType: 'agent', senderId: agentId, content: `${agent?.name ?? 'Agent'} acknowledged. I will ${intent.replaceAll('_', ' ')} this with approval gates, logs, and memory capture where needed.`, intent: 'note', createdBy: agentId }
    set({ conversations: newConversations, messages: [...state.messages, userMessage, reply], selectedAgentId: agentId, activeDrawer: 'agent', toast: `Message sent to ${agent?.name ?? agentId}.`, logs: addLog(state, { type: 'agent_action', severity: 'info', agentId, title: 'Agent chat message', detail: content, linkedRecordId: conversation.id }) })
  },
  convertMessageToTask: (messageId) => {
    const message = get().messages.find((m) => m.id === messageId)
    if (message) get().createTaskFromInstruction(message.content, message.senderType === 'agent' ? message.senderId : 'alicia')
  },
  saveMessageToMemory: (messageId) => {
    const state = get()
    const message = state.messages.find((m) => m.id === messageId)
    if (!message) return
    const id = makeId('mem')
    const memory: AgentMemory = { ...mock.memories[0], id, title: `Saved conversation note`, content: message.content, type: 'decision', source: `message:${messageId}`, approvalStatus: 'pending', ownerAgentId: message.senderType === 'agent' ? message.senderId : 'alicia', createdAt: nowIso(), updatedAt: nowIso(), versionHistory: [{ version: 1, changedAt: nowIso(), changedBy: 'owner', summary: 'Saved from chat.' }], conflict: false }
    set({ memories: [memory, ...state.memories], selectedMemoryId: id, activeDrawer: 'memory', toast: 'Message saved to memory pending approval.', logs: addLog(state, { type: 'memory_change', severity: 'warning', agentId: memory.ownerAgentId, title: 'Memory created from chat', detail: memory.content, linkedRecordId: id }) })
  },
  updateTaskStatus: (taskId, taskStatus) => set((state) => ({ tasks: state.tasks.map((t) => t.id === taskId ? { ...t, taskStatus, updatedAt: nowIso() } : t), toast: `Task moved to ${taskStatus.replaceAll('_', ' ')}.`, logs: addLog(state, { type: 'task_change', severity: taskStatus === 'blocked' || taskStatus === 'failed' ? 'warning' : 'success', title: 'Task status updated', detail: `Task ${taskId} is now ${taskStatus}.`, linkedRecordId: taskId }) })),
  createCronJob: (name = 'Daily 8 AM report from Alicia', assignedAgentId = 'alicia') => {
    const state = get()
    const id = makeId('cron')
    const cron: CronJob = { ...mock.cronJobs[0], id, name, assignedAgentId, createdAt: nowIso(), updatedAt: nowIso(), schedule: '0 8 * * *', nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), lastRunAt: undefined, lastOutput: 'New cron job created. Real scheduler integration required for background execution.', enabled: true }
    set({ cronJobs: [cron, ...state.cronJobs], selectedCronJobId: id, activeDrawer: 'cron', currentView: 'cron', toast: 'Cron job created and visible in the manager.', logs: addLog(state, { type: 'cron_run', severity: 'success', agentId: assignedAgentId, title: 'Cron job created', detail: `${name} (${cron.schedule})`, linkedRecordId: id }) })
  },
  toggleCronJob: (cronJobId) => set((state) => ({ cronJobs: state.cronJobs.map((c) => c.id === cronJobId ? { ...c, enabled: !c.enabled, status: c.enabled ? 'paused' : 'active', updatedAt: nowIso() } : c), toast: 'Cron job state updated.', logs: addLog(state, { type: 'cron_run', severity: 'info', title: 'Cron toggled', detail: `Cron ${cronJobId} was toggled.`, linkedRecordId: cronJobId }) })),
  runCronNow: (cronJobId) => set((state) => ({ cronJobs: state.cronJobs.map((c) => c.id === cronJobId ? { ...c, lastRunAt: nowIso(), lastOutput: 'Manual dry-run completed. Connect scheduler adapter for live execution.', updatedAt: nowIso() } : c), toast: 'Cron dry-run completed. Scheduler integration note attached.', logs: addLog(state, { type: 'cron_run', severity: 'success', title: 'Cron manual run', detail: 'Manual dry-run executed in UI state.', linkedRecordId: cronJobId }) })),
  updateMemory: (memoryId, content) => set((state) => ({ memories: state.memories.map((m) => m.id === memoryId ? { ...m, content, approvalStatus: 'pending', updatedAt: nowIso(), versionHistory: [...m.versionHistory, { version: m.versionHistory.length + 1, changedAt: nowIso(), changedBy: 'owner', summary: 'Edited in memory viewer; approval required.' }] } : m), toast: 'Memory updated and moved to pending approval.', logs: addLog(state, { type: 'memory_change', severity: 'warning', title: 'Memory edited', detail: 'Permanent memory edits require approval.', linkedRecordId: memoryId }) })),
  approveMemory: (memoryId) => set((state) => ({ memories: state.memories.map((m) => m.id === memoryId ? { ...m, approvalStatus: 'approved', updatedAt: nowIso() } : m), toast: 'Memory approved.', logs: addLog(state, { type: 'memory_change', severity: 'success', title: 'Memory approved', detail: `Memory ${memoryId} approved.`, linkedRecordId: memoryId }) })),
  rejectMemory: (memoryId) => set((state) => ({ memories: state.memories.map((m) => m.id === memoryId ? { ...m, approvalStatus: 'rejected', updatedAt: nowIso() } : m), toast: 'Memory rejected.', logs: addLog(state, { type: 'memory_change', severity: 'warning', title: 'Memory rejected', detail: `Memory ${memoryId} rejected.`, linkedRecordId: memoryId }) })),
  approveRequest: (approvalId) => set((state) => ({ approvals: state.approvals.map((a) => a.id === approvalId ? { ...a, approvalStatus: 'approved', updatedAt: nowIso(), comments: [...a.comments, 'Approved by owner.'] } : a), toast: 'Approval granted. Audit event recorded.', logs: addLog(state, { type: 'approval', severity: 'success', title: 'Approval granted', detail: `Approval ${approvalId} granted by owner.`, linkedRecordId: approvalId }) })),
  rejectRequest: (approvalId) => set((state) => ({ approvals: state.approvals.map((a) => a.id === approvalId ? { ...a, approvalStatus: 'rejected', updatedAt: nowIso(), comments: [...a.comments, 'Rejected by owner.'] } : a), toast: 'Approval rejected. Requesting agent must stop.', logs: addLog(state, { type: 'approval', severity: 'warning', title: 'Approval rejected', detail: `Approval ${approvalId} rejected by owner.`, linkedRecordId: approvalId }) })),
  requestChanges: (approvalId) => set((state) => ({ approvals: state.approvals.map((a) => a.id === approvalId ? { ...a, approvalStatus: 'changes_requested', updatedAt: nowIso(), comments: [...a.comments, 'Owner requested changes before approval.'] } : a), toast: 'Changes requested from requesting agent.', logs: addLog(state, { type: 'approval', severity: 'info', title: 'Approval changes requested', detail: `Changes requested for approval ${approvalId}.`, linkedRecordId: approvalId }) })),
  markNotificationRead: (notificationId) => set((state) => ({ notifications: state.notifications.map((n) => n.id === notificationId ? { ...n, read: true, updatedAt: nowIso() } : n), toast: 'Notification marked as read.' })),
  snoozeNotification: (notificationId) => set((state) => ({ notifications: state.notifications.map((n) => n.id === notificationId ? { ...n, snoozedUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString(), updatedAt: nowIso() } : n), toast: 'Notification snoozed for 1 hour.' })),
  resolveLog: (logId) => set((state) => ({ logs: state.logs.map((l) => l.id === logId ? { ...l, resolved: true, updatedAt: nowIso() } : l), toast: 'Log marked resolved.' })),
  testIntegration: (integrationId) => set((state) => ({ integrations: state.integrations.map((i) => i.id === integrationId ? { ...i, lastUsedAt: nowIso(), logs: [`${nowIso()}: Test requested. ${i.enabled ? 'Connection metadata is available; server-side adapter required for live secret validation.' : 'Integration must be enabled and configured server-side.'}`, ...i.logs] } : i), toast: 'Integration test logged. Secrets remain server-side.' })),
}))
