import { notifications } from '../data/commandCentreMock'
import type { Notification } from '../types/commandCentre'
import { createMockAdapter } from './serviceAdapter'

const adapter = createMockAdapter<Notification>(notifications, 'notification')
export const notificationService = {
  listNotifications: adapter.list,
  createNotification: adapter.create,
  markNotificationRead: (id: string) => adapter.update(id, { read: true }),
  snoozeNotification: (id: string, snoozedUntil = new Date(Date.now() + 3600000).toISOString()) => adapter.update(id, { snoozedUntil }),
}
