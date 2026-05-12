import { approvals } from '../data/commandCentreMock'
import type { ApprovalRequest } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<ApprovalRequest>(approvals, 'approval')
export const approvalService = {
  listApprovals: adapter.list,
  requestApproval: adapter.create,
  approveRequest: (id: string) => adapter.update(id, { approvalStatus: 'approved' }),
  rejectRequest: (id: string) => adapter.update(id, { approvalStatus: 'rejected' }),
  requestChanges: (id: string) => adapter.update(id, { approvalStatus: 'changes_requested' }),
}
