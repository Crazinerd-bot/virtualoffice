import { conversations, messages } from '../data/commandCentreMock'
import type { Conversation, Message } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const conversationAdapter = createMockAdapter<Conversation>(conversations, 'conversation')
const messageAdapter = createMockAdapter<Message>(messages, 'message')
export const conversationService = {
  listConversations: conversationAdapter.list,
  createConversation: conversationAdapter.create,
  getConversation: conversationAdapter.get,
  sendMessageToAgent: messageAdapter.create,
  sendGroupMessage: messageAdapter.create,
  convertMessageToTask: async (messageId: string) => ({ messageId, converted: 'task' }),
  saveMessageToMemory: async (messageId: string) => ({ messageId, converted: 'memory' }),
}
