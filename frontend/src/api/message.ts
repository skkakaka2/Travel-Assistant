import { request } from '@/utils/request'
import type { Message } from '@/types/message'
import type { Result, PageResult, PageParams } from '@/types/api'

// 获取消息列表
export function getMessages(params?: PageParams): Promise<Result<PageResult<Message>>> {
  return request.get<PageResult<Message>>('/api/messages', params)
}

// 获取消息详情
export function getMessage(id: number): Promise<Result<Message>> {
  return request.get<Message>(`/api/messages/${id}`)
}

// 标记消息已读
export function markMessageRead(id: number): Promise<Result<void>> {
  return request.put<void>(`/api/messages/${id}/read`)
}

// 标记所有消息已读
export function markAllMessagesRead(): Promise<Result<void>> {
  return request.put<void>('/api/messages/read-all')
}

// 删除消息
export function deleteMessage(id: number): Promise<Result<void>> {
  return request.delete<void>(`/api/messages/${id}`)
}

// 获取未读消息数量
export function getUnreadCount(): Promise<Result<number>> {
  return request.get<number>('/api/messages/unread-count')
}