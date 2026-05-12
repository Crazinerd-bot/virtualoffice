import { reports } from '../data/commandCentreMock'
import type { Report } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<Report>(reports, 'report')
export const reportService = {
  listReports: adapter.list,
  generateDailyReport: async () => (await adapter.list()).find((report) => report.type === 'daily_operations'),
  generateProjectReport: async (projectId: string) => (await adapter.list()).find((report) => report.projectId === projectId),
  generateAgentReport: async (agentId: string) => (await adapter.list()).find((report) => report.agentId === agentId),
  generateSecurityReport: async () => (await adapter.list()).find((report) => report.type === 'security'),
}
