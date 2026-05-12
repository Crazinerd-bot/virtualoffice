import { create } from 'zustand'

import type { OfficeSnapshot } from '../types/office'

const gatewayUrl = import.meta.env.VITE_GATEWAY_URL ?? 'ws://127.0.0.1:18789'
const gatewayToken = import.meta.env.VITE_GATEWAY_TOKEN ?? ''

type OfficeState = OfficeSnapshot & {
  gatewayUrl: string
  gatewayToken: string
  selectedAgentId: string | null
  selectedTaskId: string | null
  setSelectedAgentId: (agentId: string | null) => void
  setSelectedTaskId: (taskId: string | null) => void
  hydrate: (snapshot: OfficeSnapshot) => void
  tickAgents: () => void
}

const lerp = (from: number, to: number, speed = 0.08) => from + (to - from) * speed

const emptyOfficeSnapshot: OfficeSnapshot = {
  generatedAt: '',
  gateway: {
    connected: false,
    url: gatewayUrl,
    lastUpdatedAt: '',
  },
  agents: [],
  tasks: [],
  documents: [],
  activity: [],
  interactions: [],
  threadStates: [],
  zones: [],
  brains: [],
}

export const useOfficeStore = create<OfficeState>((set) => ({
  ...emptyOfficeSnapshot,
  gatewayUrl,
  gatewayToken,
  selectedAgentId: null,
  selectedTaskId: null,
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  hydrate: (snapshot) => set((state) => ({ ...state, ...snapshot })),
  tickAgents: () =>
    set((state) => ({
      agents: state.agents.map((agent) => ({
        ...agent,
        position: {
          x: lerp(agent.position.x, agent.target.x),
          y: lerp(agent.position.y, agent.target.y),
        },
      })),
    })),
}))
