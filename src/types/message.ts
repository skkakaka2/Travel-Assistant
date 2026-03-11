// 消息类型枚举
export enum MessageType {
  SYSTEM = 0,
  TRIP = 1,
  ACTIVITY = 2,
}

// 消息信息
export interface MessageVO {
  id: number
  title: string
  content: string
  type: MessageType
  typeDesc: string
  isRead: boolean
  createdAt: string
}

// 消息列表查询参数
export interface MessageListParams {
  page?: number
  size?: number
  isRead?: number
}