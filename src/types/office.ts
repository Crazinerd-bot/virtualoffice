export type AgentStatus = 'idle' | 'working' | 'reviewing' | 'blocked' | 'offline'

export type AgentTask = {
  id: string
  title: string
  detail: string
  progress: number
  status: AgentStatus
  documentIds: string[]
  updatedAt: string
  completedItems?: string[]
  todoItems?: string[]
}

export type AgentPresence = {
  id: string
  name: string
  role: string
  color: string
  status: AgentStatus
  initials: string
  face: string
  avatarUrl?: string
  animation: 'walking' | 'sitting' | 'talking' | 'reviewing' | 'pairing'
  deskId?: string
  zoneId?: string
  position: { x: number; y: number }
  target: { x: number; y: number }
  currentTaskId?: string
  note: string
  speechBubble?: string
}

export type ActivityItem = {
  id: string
  timestamp: string
  agentId: string
  kind: 'task' | 'document' | 'system' | 'message'
  title: string
  detail: string
}

export type OfficeDocument = {
  id: string
  title: string
  kind: 'spec' | 'code' | 'ops' | 'design'
  ownerId: string
  status: 'draft' | 'active' | 'review' | 'done'
  updatedAt: string
}

export type OfficeInteraction = {
  id: string
  fromAgentId: string
  toAgentId: string
  kind: 'handoff' | 'discussion' | 'status'
  label: string
}

export type OfficeThreadState = {
  conversationId: string
  otherUid: string
  issueType: string
  status: 'active' | 'in_progress' | 'awaiting_user' | 'resolved'
  latestUserMessage: string
  latestReply: string
  updatedAt: string
}

export type OfficeZone = {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  tone?: 'reception' | 'workspace' | 'meeting' | 'lounge' | 'corridor'
}

export type AgentBrainBucketSummary = {
  key: string
  count: number
  preview?: string
}

export type AgentBrainSummary = {
  agentId: string
  brainId: string
  root: string
  updatedAt?: string
  isolation: {
    read: string[]
    write: string[]
  }
  buckets: AgentBrainBucketSummary[]
  contextPack?: {
    summaries: string[]
    lessons: string[]
    instructions: string[]
  }
}

export type OfficeSnapshot = {
  generatedAt: string
  gateway: {
    connected: boolean
    url: string
    lastUpdatedAt: string
  }
  agents: AgentPresence[]
  tasks: AgentTask[]
  documents: OfficeDocument[]
  activity: ActivityItem[]
  interactions?: OfficeInteraction[]
  threadStates?: OfficeThreadState[]
  zones?: OfficeZone[]
  brains?: AgentBrainSummary[]
}
