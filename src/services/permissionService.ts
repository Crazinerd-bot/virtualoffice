import { agents } from '../data/commandCentreMock'

export const permissionService = {
  listRoles: async () => ['owner', 'admin', 'manager', 'agent_operator', 'viewer', 'developer', 'support', 'auditor'],
  getAgentPermissions: async (agentId: string) => agents.find((agent) => agent.id === agentId)?.permission,
  requiresApproval: async (action: string) => ['deploy', 'delete', 'billing', 'security_rules', 'sensitive_data', 'bulk_automation', 'permanent_memory'].some((danger) => action.includes(danger)),
}
