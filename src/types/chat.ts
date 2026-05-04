export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  timestamp: string
}

export type AgentChatTarget = {
  id: string
  name: string
  sessionKey?: string
  label?: string
}
