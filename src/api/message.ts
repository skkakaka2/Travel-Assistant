import { request } from '@/utils/request'
import type { MessageVO, PageData, MessageListParams } from '@/types'

export const messageApi = {
  // 获取消息列表
  getList(params: MessageListParams) {
    return request.get<PageData<MessageVO>>('/messages', { params })
  },

  // 获取消息详情
  get(id: number) {
    return request.get<MessageVO>(`/messages/${id}`)
  },

  // 删除消息
  delete(id: number) {
    return request.delete<void>(`/messages/${id}`)
  },

  // 标记消息已读
  markAsRead(id: number) {
    return request.put<void>(`/messages/${id}/read`)
  },

  // 标记所有消息已读
  markAllAsRead() {
    return request.put<void>('/messages/read-all')
  },

  // 获取未读消息数量
  getUnreadCount() {
    return request.get<number>('/messages/unread-count')
  },
}