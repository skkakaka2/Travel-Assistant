// 消息类型枚举
export enum MessageType {
  SYSTEM = 1,
  ACTIVITY = 2,
  TRIP = 3,
  EXPENSE = 4
}

// 消息信息
export interface Message {
  id: number
  title: string
  content: string
  type: MessageType
  typeDesc: string
  isRead: boolean
  createdAt: string
}