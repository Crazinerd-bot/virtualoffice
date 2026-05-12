import { tasks } from '../data/commandCentreMock'
import type { Task, TaskStatus } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<Task>(tasks, 'task')
export const taskService = {
  listTasks: adapter.list,
  getTask: adapter.get,
  createTask: adapter.create,
  updateTask: adapter.update,
  deleteTask: adapter.delete,
  assignTask: (id: string, assignedAgentId: string) => adapter.update(id, { assignedAgentId, taskStatus: 'assigned' }),
  completeTask: (id: string) => adapter.update(id, { taskStatus: 'completed' }),
  blockTask: (id: string) => adapter.update(id, { taskStatus: 'blocked' }),
  requestReview: (id: string) => adapter.update(id, { taskStatus: 'waiting_for_review', reviewRequired: true }),
  approveTask: (id: string) => adapter.update(id, { taskStatus: 'approved' }),
  rejectTask: (id: string) => adapter.update(id, { taskStatus: 'needs_fixes' as TaskStatus }),
}
