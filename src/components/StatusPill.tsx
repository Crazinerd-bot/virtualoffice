import clsx from 'clsx'

import type { AgentStatus } from '../types/office'

const labelMap: Record<AgentStatus, string> = {
  idle: 'Idle',
  working: 'Working',
  reviewing: 'Reviewing',
  blocked: 'Blocked',
  offline: 'Offline',
}

export function StatusPill({ status }: { status: AgentStatus }) {
  return <span className={clsx('status-pill', `status-${status}`)}>{labelMap[status]}</span>
}
