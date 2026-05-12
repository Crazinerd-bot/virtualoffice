import { integrations } from '../data/commandCentreMock'
import type { Integration } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<Integration>(integrations, 'integration')
export const integrationService = {
  listIntegrations: adapter.list,
  getIntegration: adapter.get,
  updateIntegration: adapter.update,
  testConnection: async (id: string) => ({ id, ok: true, message: 'Connection test queued server-side; frontend never receives raw secrets.' }),
}
