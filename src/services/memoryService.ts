import { memories } from '../data/commandCentreMock'
import type { AgentMemory } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<AgentMemory>(memories, 'memory')
export const memoryService = {
  listMemories: adapter.list,
  getMemory: adapter.get,
  createMemory: adapter.create,
  updateMemory: adapter.update,
  approveMemory: (id: string) => adapter.update(id, { approvalStatus: 'approved' }),
  rejectMemory: (id: string) => adapter.update(id, { approvalStatus: 'rejected' }),
  searchMemory: async (query: string) => (await adapter.list()).filter((memory) => `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())),
  mergeMemory: async (targetId: string, duplicateId: string) => ({ targetId, duplicateId, merged: true }),
  deleteMemory: adapter.delete,
}
