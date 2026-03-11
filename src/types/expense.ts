// 费用类型枚举
export enum ExpenseType {
  FUEL = 1,
  TOLL = 2,
  PARKING = 3,
  MAINTENANCE = 4,
  OTHER = 5,
}

// 费用信息
export interface ExpenseVO {
  id: number
  tripId: number
  tripTitle: string
  type: ExpenseType
  typeDesc: string
  amount: number
  description: string
  expenseTime: string
  createdAt: string
}

// 费用请求
export interface ExpenseRequest {
  tripId?: number
  type: ExpenseType
  amount: number
  description?: string
  expenseTime?: string
}

// 费用列表查询参数
export interface ExpenseListParams {
  page?: number
  size?: number
  type?: ExpenseType
  tripId?: number
}

// 费用统计
export interface ExpenseStatisticsVO {
  totalAmount: number
  fuelAmount: number
  tollAmount: number
  parkingAmount: number
  maintenanceAmount: number
  otherAmount: number
  count: number
}