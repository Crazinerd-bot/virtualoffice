import { useMemo } from 'react'

import { useOfficeStore } from '../store/useOfficeStore'

const toneClassMap = {
  reception: 'zone-reception',
  workspace: 'zone-workspace',
  meeting: 'zone-meeting',
  lounge: 'zone-lounge',
  corridor: 'zone-corridor',
} as const

function bobOffset(animation: string, selected: boolean) {
  const lift = selected ? -6 : 0
  if (animation === 'walking') return `translateY(${lift - 6}px)`
  if (animation === 'talking') return `translateY(${lift - 4}px)`
  if (animation === 'pairing') return `translateY(${lift - 4}px)`
  if (animation === 'reviewing') return `translateY(${lift - 2}px)`
  return `translateY(${lift}px)`
}

export function OfficeCanvas() {
  const agents = useOfficeStore((state) => state.agents)
  const interactions = useOfficeStore((state) => state.interactions ?? [])
  const zones = useOfficeStore((state) => state.zones ?? [])
  const selectedAgentId = useOfficeStore((state) => state.selectedAgentId)
  const setSelectedAgentId = useOfficeStore((state) => state.setSelectedAgentId)
  const byId = useMemo(() => Object.fromEntries(agents.map((agent) => [agent.id, agent])), [agents])

  return (
    <div className="office-canvas-shell office-rich-stage">
      <div className="office-grid-backdrop" />
      <div className="office-pixel-floor" />

      {zones.map((zone) => (
        <div
          key={zone.id}
          className={`office-zone office-zone-rich ${toneClassMap[zone.tone ?? 'workspace']}`}
          style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height }}
        >
          <span className="office-zone-label">{zone.label}</span>
          <div className="office-zone-pixels" />
        </div>
      ))}

      <div className="office-desk desk-a" style={{ left: 382, top: 138 }} />
      <div className="office-desk desk-b" style={{ left: 568, top: 138 }} />
      <div className="office-desk desk-c" style={{ left: 566, top: 286 }} />
      <div className="office-desk desk-d" style={{ left: 846, top: 314 }} />
      <div className="office-desk desk-drone-a" style={{ left: 792, top: 456, width: 82, height: 40 }} />
      <div className="office-desk desk-drone-b" style={{ left: 880, top: 456, width: 82, height: 40 }} />
      <div className="office-desk desk-drone-c" style={{ left: 968, top: 456, width: 82, height: 40 }} />
      <div className="office-meeting-table" style={{ left: 856, top: 122 }} />
      <div className="office-lounge-sofa" style={{ left: 840, top: 332 }} />
      <div className="office-reception-desk" style={{ left: 126, top: 120 }} />
      <div className="office-plant" style={{ left: 238, top: 152 }} />
      <div className="office-plant" style={{ left: 972, top: 326 }} />
      <div className="office-plant" style={{ left: 1002, top: 520 }} />

      <div className="office-hall-label" style={{ left: 96, top: 452 }}>Crazinerd Virtual Office</div>
      <div className="office-hall-label" style={{ left: 796, top: 444 }}>Drone by Nature Ops</div>
      <div className="office-hall-label" style={{ left: 852, top: 108 }}>Meeting Room</div>
      <div className="office-hall-label" style={{ left: 844, top: 294 }}>Lounge</div>

      {interactions.map((interaction) => {
        const from = byId[interaction.fromAgentId]
        const to = byId[interaction.toAgentId]
        if (!from || !to) return null
        const width = Math.abs(to.position.x - from.position.x)
        const midX = (from.position.x + to.position.x) / 2
        const midY = (from.position.y + to.position.y) / 2
        return (
          <div key={interaction.id}>
            <div
              className="office-link office-link-rich"
              style={{
                left: Math.min(from.position.x, to.position.x),
                top: from.position.y + 18,
                width,
              }}
            />
            <div className="office-link-pulse" style={{ left: midX - 10, top: midY - 10 }} />
            <div className="office-link-label" style={{ left: midX - 48, top: midY - 28 }}>
              {interaction.label}
            </div>
          </div>
        )
      })}

      {agents.map((agent) => {
        const selected = selectedAgentId === agent.id
        return (
          <button
            key={agent.id}
            type="button"
            className={`office-agent office-agent-rich ${selected ? 'selected' : ''}`}
            style={{ left: agent.position.x - 26, top: agent.position.y - 26, transform: bobOffset(agent.animation, selected) }}
            onClick={() => setSelectedAgentId(agent.id)}
          >
            {agent.speechBubble ? <div className="office-agent-bubble">{agent.speechBubble}</div> : null}
            <div className="office-agent-shadow" />
            <div className="office-agent-pixel-frame" style={{ boxShadow: `0 0 0 2px ${agent.color}, 0 18px 26px rgba(2, 6, 23, 0.45)` }}>
              <div className="office-agent-glow" style={{ background: `${agent.color}33` }} />
              {agent.avatarUrl ? <img src={agent.avatarUrl} alt={agent.name} className="office-agent-avatar office-agent-avatar-rich" /> : <div className="office-agent-face">{agent.face}</div>}
            </div>
            <div className="office-agent-nameplate">
              <div className="office-agent-name">{agent.name}</div>
              <div className="office-agent-role">{agent.role}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
