import { workflows } from '../data/commandCentreMock'
import type { Workflow } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<Workflow>(workflows, 'workflow')
export const workflowService = {
  listWorkflows: adapter.list,
  getWorkflow: adapter.get,
  createWorkflow: adapter.create,
  updateWorkflow: adapter.update,
  runWorkflow: (id: string) => adapter.update(id, { running: true }),
  pauseWorkflow: (id: string) => adapter.update(id, { running: false, status: 'paused' }),
  getWorkflowRun: adapter.get,
}
