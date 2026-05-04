import fs from 'node:fs'
import { renderToString } from 'react-dom/server'
import React from 'react'

import App from '../src/App'
import { useOfficeStore } from '../src/store/useOfficeStore'

const state = {
  generatedAt: new Date().toISOString(),
  gateway: { connected: true, url: 'wss://office.esportsza.co.za/ws', lastUpdatedAt: new Date().toISOString() },
  agents: [
    { id: 'alicia', name: 'Alicia', role: 'Coordinator', color: '#7c3aed', status: 'working', initials: 'AL', face: '✨', avatarUrl: '/avatars/alicia-pixel.svg', animation: 'talking', deskId: 'desk-alicia', zoneId: 'zone-work-a', position: { x: 430, y: 164 }, target: { x: 430, y: 164 }, currentTaskId: 'task-office-1', note: 'Coordinating Mission Control', speechBubble: 'office live' },
    { id: 'angela', name: 'Angela', role: 'Guestlist Ops', color: '#10b981', status: 'working', initials: 'AN', face: '🧠', avatarUrl: '/avatars/angela-pixel.svg', animation: 'talking', deskId: 'desk-angela', zoneId: 'zone-work-b', position: { x: 618, y: 300 }, target: { x: 618, y: 300 }, currentTaskId: 'task-guestlist-1', note: 'Watching support', speechBubble: 'monitoring' },
    { id: 'oryn', name: 'Oryn', role: 'Drone Ops', color: '#f59e0b', status: 'idle', initials: 'OR', face: '🛠️', avatarUrl: '/avatars/oryn-pixel.svg', animation: 'sitting', deskId: 'desk-oryn', zoneId: 'zone-lounge', position: { x: 892, y: 336 }, target: { x: 892, y: 336 }, currentTaskId: 'task-drone-1', note: 'Standing by', speechBubble: 'standby' },
  ],
  tasks: [
    { id: 'task-office-1', title: 'Run live Mission Control', detail: 'Realtime office presence.', progress: 74, status: 'working', documentIds: ['doc-office-spec'], updatedAt: new Date().toISOString() },
    { id: 'task-guestlist-1', title: 'Guestlist production support readiness', detail: 'Live Firebase connectivity.', progress: 82, status: 'reviewing', documentIds: ['doc-angela-plan'], updatedAt: new Date().toISOString() },
    { id: 'task-drone-1', title: 'Prepare Drone by Nature integration brief', detail: 'Confirm auth and event sources.', progress: 18, status: 'idle', documentIds: ['doc-oryn-plan'], updatedAt: new Date().toISOString() },
  ],
  documents: [
    { id: 'doc-office-spec', title: 'Mission Control product brief', kind: 'spec', ownerId: 'alicia', status: 'active', updatedAt: new Date().toISOString() },
    { id: 'doc-angela-plan', title: 'Angela production support plan', kind: 'ops', ownerId: 'angela', status: 'review', updatedAt: new Date().toISOString() },
    { id: 'doc-oryn-plan', title: 'Oryn integration plan', kind: 'ops', ownerId: 'oryn', status: 'draft', updatedAt: new Date().toISOString() },
  ],
  interactions: [{ id: 'int-1', fromAgentId: 'alicia', toAgentId: 'angela', kind: 'handoff', label: 'Ops handoff' }],
  zones: [
    { id: 'zone-reception', label: 'Reception', x: 78, y: 76, width: 212, height: 128, tone: 'reception' },
    { id: 'zone-work-a', label: 'Workspace A', x: 308, y: 76, width: 486, height: 156, tone: 'workspace' },
    { id: 'zone-work-b', label: 'Workspace B', x: 308, y: 232, width: 486, height: 176, tone: 'workspace' },
    { id: 'zone-meeting', label: 'Meeting Suite', x: 814, y: 76, width: 190, height: 182, tone: 'meeting' },
    { id: 'zone-lounge', label: 'Lounge', x: 814, y: 282, width: 190, height: 126, tone: 'lounge' },
    { id: 'zone-corridor', label: 'Main Corridor', x: 78, y: 430, width: 926, height: 122, tone: 'corridor' },
  ],
  threadStates: [],
  selectedAgentId: 'alicia',
  selectedTaskId: 'task-office-1',
}

useOfficeStore.setState(state)
const html = renderToString(React.createElement(App))
fs.writeFileSync('/tmp/openclaw-office-render.html', html)
console.log(html.slice(0, 2000))
