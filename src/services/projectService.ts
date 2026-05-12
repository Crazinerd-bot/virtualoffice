import { projects, tasks } from '../data/commandCentreMock'
import type { Project } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<Project>(projects, 'project')
export const projectService = {
  listProjects: adapter.list,
  getProject: adapter.get,
  createProject: adapter.create,
  updateProject: adapter.update,
  archiveProject: (id: string) => adapter.update(id, { projectStatus: 'archived', status: 'archived' }),
  getProjectDashboard: async (id: string) => ({ project: await adapter.get(id), tasks: tasks.filter((task) => task.projectId === id) }),
}
