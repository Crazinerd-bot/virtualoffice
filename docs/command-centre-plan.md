# AI Agent Command Centre Architecture Plan

## Existing app audit

- **Framework:** React 19, TypeScript, Vite, Zustand, Lucide icons, with Pixi dependencies still installed for future high-fidelity canvas work.
- **Existing components:** `OfficeCanvas`, `AgentChatPanel`, `BrainPanel`, and `StatusPill` rendered a virtual-office-first experience with a right rail, task list, activity stream, brain summaries, and basic chat/brain write calls.
- **Current virtual office files:** `src/components/OfficeCanvas.tsx`, `src/App.tsx`, `src/App.css`, and `src/types/office.ts` owned the decorative office floor, zones, agents, interactions, and status pills.
- **Current agent data model:** `AgentPresence` only contained identity, role, status, position, animation, current task, note, and optional speech bubble. It did not model permissions, tools, memories, cost limits, autonomy, workflows, approvals, or performance.
- **Current widgets:** office canvas, activity stream, selected-agent card, task list, document list, brain dashboard, brain detail form, and agent chat.
- **Current backend/API setup:** `server.mjs` exposes `/api/office-state`, `/api/agent-chat`, and `/api/brain-write`; the frontend polls `/api/office-state` every 15 seconds.
- **Current state management:** one Zustand `useOfficeStore` stores office snapshots, selected agent/task ids, gateway settings, and sprite tweening.
- **Current styling system:** custom CSS in `src/App.css` and `src/index.css`; no Tailwind or design-token package is configured.
- **Missing functionality:** project management, real agent management, approvals, cron jobs, workflow pipelines, memory governance, logs/audits, notifications, integrations, permissions, reports, command palette, responsive SaaS navigation, and meaningful room-level actions.
- **Breaking risks:** the live `/api/office-state` endpoint can be unavailable in development, old status unions are narrower than the desired production statuses, and replacing the office shell must preserve a useful mock/demo mode until real backend adapters are connected.

## Implementation plan

1. Introduce a richer `commandCentre` domain model with agents, tasks, projects, workflows, cron jobs, memories, approvals, conversations, notifications, logs, integrations, reports, permissions, and audit events.
2. Add mock/demo seed data for the current nine agents and operational objects so the product is usable without live integrations.
3. Create adapter-ready service modules for every backend domain. The initial implementation is in-memory/mock-backed through Zustand actions, but service contracts are shaped so Firebase, Supabase, REST, OpenClaw, or n8n adapters can be added later.
4. Build a new `useCommandCentreStore` Zustand store for command-centre state, filters, selection, drawers, command palette, notifications, and record-changing actions.
5. Replace the app shell with `CommandCentreLayout`: sidebar, top command bar, global command palette, mode switcher, agent status dock, notification centre, main dashboards, and right-side drawers.
6. Rebuild the virtual office as the visual layer of the operating system: each room opens an operational module and each agent sprite opens a functional detail drawer with chat, task, memory, log, permission, and control actions.
7. Implement first-pass modules: dashboard, virtual office, agent management, chat, task board, project board, workflow pipeline, cron table/editor, memory viewer/editor, approval queue, logs viewer, integration/settings surfaces, and report cards.
8. Ensure buttons either mutate local state, open a panel/module, create records, or display an integration-required operational explanation.
9. Validate with TypeScript/Vite build and lint where available, then commit and create a pull request.

## Proposed folder structure

```txt
src/
  components/command-centre/
    CommandCentreLayout.tsx
  constants/
    commandCentre.ts
  data/
    commandCentreMock.ts
  services/
    agentService.ts
    approvalService.ts
    conversationService.ts
    cronService.ts
    integrationService.ts
    logService.ts
    memoryService.ts
    permissionService.ts
    projectService.ts
    reportService.ts
    taskService.ts
    workflowService.ts
  store/
    useCommandCentreStore.ts
  types/
    commandCentre.ts
```

## Database/schema design

Every collection/table uses the base fields `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `status`, and `metadata`.

| Collection | Purpose | Key indexes |
| --- | --- | --- |
| `agents` | Agent identity, status, operating limits, cost limits, department, model/provider | `status`, `department`, `ownerId`, `createdAt` |
| `agent_profiles` | System prompt, personality, responsibilities, working hours, recommendations | `agentId`, `updatedAt` |
| `agent_permissions` | Tool, file, project, memory, autonomy, and sensitive-action permissions | `agentId`, `level`, `updatedAt` |
| `agent_tools` | Agent-tool assignments and permission levels | `agentId`, `toolId`, `status` |
| `agent_memories` | Agent-scoped memory pointers and usage records | `agentId`, `memoryId`, `updatedAt` |
| `memory_banks` | Memory entries, versions, approval state, confidence, visibility | `type`, `ownerAgentId`, `projectId`, `approvalStatus`, `updatedAt` |
| `projects` | Project dashboard, health, risks, stakeholders, repos, deployments | `status`, `ownerId`, `priority`, `deadline`, `createdAt` |
| `tasks` | Work execution, assignments, due dates, dependencies, linked records | `status`, `assignedAgentId`, `projectId`, `dueDate`, `priority` |
| `task_comments` | Threaded comments and review notes on tasks | `taskId`, `createdAt`, `createdBy` |
| `workflows` | Trigger/condition/step definitions | `status`, `type`, `ownerId`, `createdAt` |
| `workflow_runs` | Step execution, logs, outputs, retry/failure state | `workflowId`, `status`, `startedAt`, `assignedAgentId` |
| `cron_jobs` | Scheduled automations and approval requirements | `status`, `assignedAgentId`, `projectId`, `nextRunAt` |
| `cron_runs` | Run history, output, duration, failures, retry count | `cronJobId`, `status`, `startedAt` |
| `approvals` | Human approval queue for risky actions | `status`, `riskLevel`, `projectId`, `requestingAgentId`, `deadline` |
| `conversations` | One-on-one, group, project, and task-specific conversations | `type`, `projectId`, `taskId`, `updatedAt` |
| `messages` | Conversation messages, decisions, attachments, conversion links | `conversationId`, `senderId`, `createdAt`, `type` |
| `notifications` | In-app/email/push/WhatsApp notification records | `status`, `priority`, `type`, `createdAt` |
| `logs` | Operational logs, errors, tool calls, deployments, memory changes | `severity`, `type`, `agentId`, `projectId`, `createdAt` |
| `audit_events` | Immutable security and compliance audit trail | `eventType`, `actorId`, `targetId`, `createdAt` |
| `integrations` | Tool configuration metadata without frontend secrets | `status`, `type`, `lastUsedAt`, `assignedAgentIds` |
| `files` | Documents, attachments, prompt files, SOPs, deployment artifacts | `projectId`, `ownerId`, `type`, `createdAt` |
| `reports` | Generated daily/project/agent/security/SEO reports | `type`, `projectId`, `agentId`, `createdAt` |
| `system_settings` | Tenant, safety, notification, and default permission settings | `ownerId`, `updatedAt` |
| `departments` | Operations, development, security, support, growth, automation | `status`, `name` |
| `clients` | Client/company records and linked projects/tickets | `status`, `ownerId`, `createdAt` |
| `support_tickets` | Customer issues, SLA, sentiment, escalation state | `status`, `priority`, `assignedAgentId`, `clientId` |
| `code_reviews` | Code review outcomes, files changed, security findings | `taskId`, `reviewerAgentId`, `status`, `riskLevel` |
| `security_reviews` | Vulnerability and permission audit results | `projectId`, `riskLevel`, `status`, `createdAt` |
| `deployments` | Deployment approvals, environments, rollback notes, monitoring | `projectId`, `status`, `createdAt` |
| `incidents` | Production incidents, owners, timeline, postmortems | `severity`, `status`, `projectId`, `createdAt` |

## Component breakdown

- **Shell:** `CommandCentreLayout`, `SidebarNavigation`, `TopCommandBar`, `GlobalCommandPalette`, `NotificationCentre`.
- **Office layer:** `VirtualOfficeCanvas`, `OfficeRoom`, `AgentSprite`, `AgentStatusBadge`, `AgentQuickActions`.
- **Agent operations:** `AgentDetailDrawer`, `AgentChatPanel`, `AgentProfilePanel`, agent list/profile cards.
- **Work execution:** `TaskBoard`, `TaskCard`, `TaskDetailDrawer`, `ProjectBoard`, `ProjectCard`, `ProjectDetailPanel`.
- **Automation:** `WorkflowBuilder`, `WorkflowPipeline`, `WorkflowRunTimeline`, `CronJobTable`, `CronJobEditor`.
- **Knowledge/governance:** `MemoryBankViewer`, `MemoryEntryCard`, `MemoryEditor`, `ApprovalQueue`, `ApprovalCard`, `LogsViewer`.
- **Admin/insight:** `IntegrationManager`, `ReportsDashboard`, `AnalyticsCard`, `StatusMetricCard`, `SettingsPage`.
- **States and UX:** `EmptyState`, `LoadingSkeleton`, `ErrorState`, `ConfirmDialog`.

## Staged development roadmap

1. **First pass:** local production-grade command centre with complete domain types, mock data, Zustand state, functional modules, drawers, command palette, and adapter-ready services.
2. **Backend adapter phase:** connect services to real OpenClaw/Firebase/Supabase/REST sources, add auth, tenant scoping, RBAC enforcement, and websocket/SSE status updates.
3. **Agent orchestration phase:** implement durable workflow runner, approval gates, tool execution broker, retry policy, audit persistence, and model/provider routing.
4. **Operational integrations phase:** connect GitHub, Firebase, Gmail, calendar, WordPress, WooCommerce, WHMCS, DirectAdmin, WhatsApp/Telegram, analytics, SEO, and deployment monitoring.
5. **Governance phase:** add immutable audit storage, memory conflict resolution, sensitive-data policy checks, cost/rate limits, rollback playbooks, and incident postmortems.
6. **Scale phase:** introduce multi-user roles, client portals, report scheduling, mobile notifications, performance budgets, and enterprise observability.
