export type RecordStatus = 'active' | 'paused' | 'archived' | 'deleted' | 'draft' | 'completed' | 'failed'

export type BaseRecord = {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  status: RecordStatus | string
  metadata: Record<string, unknown>
}

export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'planning'
  | 'working'
  | 'waiting_for_tool'
  | 'waiting_for_user'
  | 'reviewing'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'offline'

export type AgentRole = 'operations' | 'developer' | 'security' | 'support' | 'research' | 'growth' | 'seo' | 'automation' | 'finance' | 'custom'
export type UserRole = 'owner' | 'admin' | 'manager' | 'agent_operator' | 'viewer' | 'developer' | 'support' | 'auditor'
export type AgentPermissionLevel = 'read_only' | 'suggest_only' | 'execute_with_approval' | 'execute_low_risk' | 'execute_full' | 'admin_agent'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type AgentPermission = {
  level: AgentPermissionLevel
  canDelegate: boolean
  canCreateCronJobs: boolean
  canModifyFiles: boolean
  canDeployCode: boolean
  canAccessSensitiveData: boolean
  requiresHumanApproval: boolean
  fileAccess: string[]
  projectAccess: string[]
  memoryAccess: string[]
  escalationRules: string[]
}

export type AgentTool = {
  id: string
  name: string
  type: string
  enabled: boolean
  permissionLevel: AgentPermissionLevel
  apiKeyStatus: 'not_configured' | 'configured_server_side' | 'expired' | 'error'
  lastUsedAt?: string
  failureCount: number
  rateLimit: string
  costLimit: number
}

export type Agent = BaseRecord & {
  name: string
  avatar: string
  initials: string
  role: AgentRole
  title: string
  department: string
  description: string
  systemPrompt: string
  personality: string
  responsibilities: string[]
  allowedTools: string[]
  connectedApis: string[]
  permission: AgentPermission
  workingHours: string
  autonomyLevel: number
  riskLevel: RiskLevel
  defaultModelProvider: string
  costLimit: number
  dailyTaskLimit: number
  currentStatus: AgentStatus
  currentActivity: string
  activeTaskId?: string
  statusStartedAt: string
  lastActivityAt: string
  lastMessage: string
  lastToolUsed?: string
  errorMessage?: string
  nextAction: string
  assignedTaskCount: number
  completedToday: number
  alertCount: number
  performanceScore: number
  costUsedToday: number
  roomId: string
  officePosition: { x: number; y: number }
}

export type TaskStatus =
  | 'backlog'
  | 'ready'
  | 'assigned'
  | 'in_progress'
  | 'waiting_for_user'
  | 'waiting_for_agent'
  | 'waiting_for_review'
  | 'needs_fixes'
  | 'approved'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled'

export type TaskPriority = Priority

export type Task = BaseRecord & {
  title: string
  description: string
  projectId: string
  department: string
  assignedAgentId: string
  createdByAgentId?: string
  priority: TaskPriority
  taskStatus: TaskStatus
  dueDate: string
  dependencies: string[]
  tags: string[]
  attachments: string[]
  linkedConversationIds: string[]
  linkedFileIds: string[]
  linkedCommits: string[]
  linkedTicketIds: string[]
  linkedMemoryIds: string[]
  approvalRequired: boolean
  reviewRequired: boolean
  securityReviewRequired: boolean
  deploymentRequired: boolean
  recurring: boolean
  estimatedEffortHours: number
  actualTimeHours: number
  notes: string[]
  acceptanceCriteria: string[]
  finalOutput?: string
  reviewResult?: string
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'at_risk' | 'delayed' | 'review' | 'completed' | 'archived'

export type Project = BaseRecord & {
  name: string
  description: string
  clientCompany: string
  projectStatus: ProjectStatus
  startDate: string
  deadline: string
  ownerAgentId: string
  assignedAgentIds: string[]
  humanStakeholders: string[]
  budget: number
  priority: Priority
  healthScore: number
  riskScore: number
  linkedTaskIds: string[]
  linkedFileIds: string[]
  linkedConversationIds: string[]
  linkedMemoryBankIds: string[]
  linkedAutomationIds: string[]
  linkedRepositories: string[]
  linkedDeployments: string[]
  template: string
}

export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'needs_fixes' | 'waiting_for_approval' | 'failed' | 'blocked'
export type WorkflowTrigger =
  | 'manual_instruction'
  | 'new_task'
  | 'new_support_ticket'
  | 'new_email'
  | 'new_website_form_entry'
  | 'new_whatsapp_message'
  | 'new_github_issue'
  | 'new_code_change'
  | 'failed_deployment'
  | 'cron_schedule'
  | 'keyword_ranking_drop'
  | 'missed_deadline'
  | 'security_alert'
  | 'user_approval'
  | 'agent_failure'

export type WorkflowStep = {
  id: string
  label: string
  assignedAgentId: string
  reviewerAgentId?: string
  approvalRequired: boolean
  status: WorkflowStepStatus
  notes: string
  startedAt?: string
  completedAt?: string
  output?: string
  logs: string[]
  reviewComments: string[]
}

export type Workflow = BaseRecord & {
  name: string
  description: string
  trigger: WorkflowTrigger
  conditions: string[]
  steps: WorkflowStep[]
  escalationRule: string
  outputDestination: string
  notificationMethod: string
  retryPolicy: string
  failureAction: string
  running: boolean
}

export type WorkflowRun = BaseRecord & {
  workflowId: string
  taskId?: string
  startedAt: string
  completedAt?: string
  statusSummary: string
  stepSnapshots: WorkflowStep[]
}

export type CronJob = BaseRecord & {
  name: string
  description: string
  schedule: string
  assignedAgentId: string
  actionPrompt: string
  projectId?: string
  timezone: string
  enabled: boolean
  lastRunAt?: string
  nextRunAt: string
  failureCount: number
  retryRules: string
  notifications: string[]
  outputDestination: string
  approvalRequired: boolean
  linkedMemoryBankId?: string
  linkedTools: string[]
  lastOutput: string
}

export type CronRun = BaseRecord & {
  cronJobId: string
  startedAt: string
  completedAt?: string
  output: string
  error?: string
  durationMs: number
}

export type MemoryType = 'agent' | 'project' | 'company' | 'client' | 'technical' | 'support' | 'marketing' | 'seo' | 'security' | 'decision' | 'sop' | 'prompt'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'

export type AgentMemory = BaseRecord & {
  title: string
  content: string
  type: MemoryType
  tags: string[]
  ownerAgentId?: string
  relatedProjectId?: string
  source: string
  confidenceLevel: number
  visibility: 'private' | 'team' | 'company' | 'sensitive'
  expiryDate?: string
  approvalStatus: ApprovalStatus
  versionHistory: Array<{ version: number; changedAt: string; changedBy: string; summary: string }>
  conflict: boolean
  lastUsedByAgentIds: string[]
}

export type MemoryBank = BaseRecord & {
  name: string
  type: MemoryType
  ownerAgentId?: string
  projectId?: string
  entryIds: string[]
  visibility: AgentMemory['visibility']
}

export type ApprovalRequest = BaseRecord & {
  title: string
  type: 'code_change' | 'deployment' | 'message' | 'client_response' | 'memory_update' | 'cron_job' | 'new_agent' | 'permission' | 'budget' | 'security_exception'
  requestingAgentId: string
  projectId?: string
  riskLevel: RiskLevel
  summary: string
  fullDetails: string
  diffOrChanges: string
  recommendation: string
  approvalStatus: ApprovalStatus
  reviewerAgentId?: string
  deadline: string
  comments: string[]
}

export type ConversationType = 'one_on_one' | 'group' | 'project' | 'task'
export type MessageIntent = 'ask' | 'instruct' | 'delegate' | 'review' | 'approve' | 'reject' | 'save_to_memory' | 'create_task' | 'schedule_automation' | 'request_report' | 'note'

export type Conversation = BaseRecord & {
  title: string
  type: ConversationType
  participantAgentIds: string[]
  projectId?: string
  taskId?: string
  pinnedMessageIds: string[]
  decisionMessageIds: string[]
}

export type Message = BaseRecord & {
  conversationId: string
  senderType: 'user' | 'agent' | 'system'
  senderId: string
  content: string
  intent: MessageIntent
  attachments: string[]
  internalNote: boolean
  pinned: boolean
  decision: boolean
}

export type Notification = BaseRecord & {
  title: string
  body: string
  type: 'task_assigned' | 'task_completed' | 'task_blocked' | 'approval_needed' | 'cron_failed' | 'workflow_failed' | 'security_alert' | 'support_escalation' | 'deadline_approaching' | 'agent_error' | 'deployment_status' | 'memory_conflict' | 'client_follow_up'
  priority: Priority
  read: boolean
  snoozedUntil?: string
  relatedType: string
  relatedId: string
}

export type LogSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical'
export type LogEntry = BaseRecord & {
  timestamp: string
  type: 'agent_action' | 'user_action' | 'task_change' | 'project_change' | 'cron_run' | 'workflow_run' | 'tool_call' | 'api_call' | 'file_change' | 'memory_change' | 'permission_change' | 'error' | 'security_event' | 'approval' | 'deployment'
  severity: LogSeverity
  agentId?: string
  projectId?: string
  title: string
  detail: string
  resolved: boolean
  linkedRecordId?: string
}

export type Integration = BaseRecord & {
  name: string
  type: string
  enabled: boolean
  assignedAgentIds: string[]
  permissionLevel: AgentPermissionLevel
  apiKeyStatus: AgentTool['apiKeyStatus']
  lastUsedAt?: string
  failureCount: number
  rateLimits: string
  costLimit: number
  logs: string[]
}

export type Report = BaseRecord & {
  title: string
  type: 'daily_operations' | 'weekly_company' | 'agent_performance' | 'project_health' | 'support_ticket' | 'marketing' | 'seo' | 'development' | 'security' | 'cron_reliability' | 'memory_health'
  projectId?: string
  agentId?: string
  summary: string
  metrics: Array<{ label: string; value: string; trend: string }>
}

export type AuditEvent = BaseRecord & {
  actorId: string
  actorType: 'user' | 'agent' | 'system'
  eventType: string
  targetType: string
  targetId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ipAddress?: string
}

export type CommandCentreView =
  | 'command'
  | 'office'
  | 'agents'
  | 'projects'
  | 'tasks'
  | 'workflows'
  | 'cron'
  | 'memory'
  | 'conversations'
  | 'approvals'
  | 'support'
  | 'development'
  | 'security'
  | 'marketing'
  | 'reports'
  | 'logs'
  | 'integrations'
  | 'settings'
  | 'network'

export type OfficeMode = 'virtual_office' | 'command_centre' | 'project_board' | 'agent_network' | 'logs_monitoring'

export type OfficeRoom = {
  id: string
  name: string
  department: string
  description: string
  view: CommandCentreView
  accent: string
  metrics: Array<{ label: string; value: string }>
}
