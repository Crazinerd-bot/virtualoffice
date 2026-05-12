import { agents } from '../data/commandCentreMock'
import type { Agent } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<Agent>(agents, 'agent')
export const agentService = {
  listAgents: adapter.list,
  getAgent: adapter.get,
  createAgent: adapter.create,
  updateAgent: adapter.update,
  deleteAgent: adapter.delete,
  pauseAgent: (id: string) => adapter.update(id, { currentStatus: 'paused' }),
  resumeAgent: (id: string) => adapter.update(id, { currentStatus: 'idle' }),
}
