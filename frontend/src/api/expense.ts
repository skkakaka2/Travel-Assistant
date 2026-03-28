import { request } from '@/utils/request'
import type { Expense, ExpenseRequest, ExpenseStatistics } from '@/types/expense'
import type { Result, PageResult, PageParams } from '@/types/api'

// 获取费用列表
export function getExpenses(params?: PageParams): Promise<Result<PageResult<Expense>>> {
  return request.get<PageResult<Expense>>('/api/expenses', params)
}

// 获取费用详情
export function getExpense(id: number): Promise<Result<Expense>> {
  return request.get<Expense>(`/api/expenses/${id}`)
}

// 创建费用记录
export function createExpense(data: ExpenseRequest): Promise<Result<Expense>> {
  return request.post<Expense>('/api/expenses', data)
}

// 更新费用记录
export function updateExpense(id: number, data: ExpenseRequest): Promise<Result<Expense>> {
  return request.put<Expense>(`/api/expenses/${id}`, data)
}

// 删除费用记录
export function deleteExpense(id: number): Promise<Result<void>> {
  return request.delete<void>(`/api/expenses/${id}`)
}

// 获取费用统计
export function getExpenseStatistics(): Promise<Result<ExpenseStatistics>> {
  return request.get<ExpenseStatistics>('/api/expenses/statistics')
}

// 获取时间段费用统计
export function getExpenseStatisticsByPeriod(startDate: string, endDate: string): Promise<Result<ExpenseStatistics>> {
  return request.get<ExpenseStatistics>('/api/expenses/statistics/period', { startDate, endDate })
}