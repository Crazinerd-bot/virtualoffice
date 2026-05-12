import { logs } from '../data/commandCentreMock'
import type { LogEntry } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<LogEntry>(logs, 'log')
export const logService = {
  listLogs: adapter.list,
  createLog: adapter.create,
  searchLogs: async (query: string) => (await adapter.list()).filter((log) => `${log.title} ${log.detail} ${log.type}`.toLowerCase().includes(query.toLowerCase())),
  exportLogs: async () => JSON.stringify(await adapter.list(), null, 2),
}
