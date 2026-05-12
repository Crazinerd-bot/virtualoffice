import { cronJobs } from '../data/commandCentreMock'
import type { CronJob } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<CronJob>(cronJobs, 'cron')
export const cronService = {
  listCronJobs: adapter.list,
  getCronJob: adapter.get,
  createCronJob: adapter.create,
  updateCronJob: adapter.update,
  pauseCronJob: (id: string) => adapter.update(id, { enabled: false, status: 'paused' }),
  resumeCronJob: (id: string) => adapter.update(id, { enabled: true, status: 'active' }),
  runCronNow: (id: string) => adapter.update(id, { lastRunAt: new Date().toISOString(), lastOutput: 'Manual run requested.' }),
  getCronHistory: async () => [],
}
