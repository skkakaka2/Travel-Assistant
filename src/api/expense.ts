import { request } from '@/utils/request'
import type {
  ExpenseVO,
  ExpenseRequest,
  ExpenseStatisticsVO,
  PageData,
  ExpenseListParams,
} from '@/types'

export const expenseApi = {
  // 获取费用列表
  getList(params: ExpenseListParams) {
    return request.get<PageData<ExpenseVO>>('/expenses', { params })
  },

  // 获取费用详情
  get(id: number) {
    return request.get<ExpenseVO>(`/expenses/${id}`)
  },

  // 创建费用记录
  create(data: ExpenseRequest) {
    return request.post<ExpenseVO>('/expenses', data)
  },

  // 更新费用记录
  update(id: number, data: ExpenseRequest) {
    return request.put<ExpenseVO>(`/expenses/${id}`, data)
  },

  // 删除费用记录
  delete(id: number) {
    return request.delete<void>(`/expenses/${id}`)
  },

  // 获取费用统计
  getStatistics() {
    return request.get<ExpenseStatisticsVO>('/expenses/statistics')
  },

  // 获取时间段费用统计
  getStatisticsByPeriod(start: string, end: string) {
    return request.get<ExpenseStatisticsVO>('/expenses/statistics/period', {
      params: { start, end },
    })
  },
}