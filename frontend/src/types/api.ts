// API Response Types
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface PaginationQuery {
  page?: number
  pageSize?: number
}

export interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationResponse<T> {
  list: T[]
  pagination: Pagination
}

// Auth Types
export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
  name: string
  avatar?: string
}

export interface User {
  id: number
  username: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Trip Types
export interface Trip {
  id: number
  name: string
  userCount: number
  budget: number
  startDate: string
  endDate: string
  description?: string
  userId: number
  dayPlans?: DayPlan[]
  createdAt: string
  updatedAt: string
}

export interface CreateTripDto {
  name: string
  userCount?: number
  budget?: number
  startDate: string
  endDate: string
  description?: string
}

export interface UpdateTripDto extends Partial<CreateTripDto> {}

// DayPlan Types
export interface DayPlan {
  id: number
  tripId: number
  date: string
  dayNumber: number
  notes?: string
  items?: DayPlanItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateDayPlanDto {
  tripId: number
  date: string
  dayNumber: number
  notes?: string
}

export interface UpdateDayPlanDto extends Partial<Omit<CreateDayPlanDto, 'tripId'>> {}

// DayPlanItem Types
export enum PlanItemType {
  HOTEL = 'HOTEL',
  ATTRACTION = 'ATTRACTION',
  RESTAURANT = 'RESTAURANT',
  TRANSPORT = 'TRANSPORT',
  ACTIVITY = 'ACTIVITY',
  OTHER = 'OTHER',
}

export interface DayPlanItem {
  id: number
  dayPlanId: number
  tripId: number
  type: PlanItemType
  name: string
  address?: string
  startTime?: string
  endTime?: string
  duration?: number
  cost?: number
  notes?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateDayPlanItemDto {
  dayPlanId: number
  tripId: number
  type: PlanItemType
  name: string
  address?: string
  startTime?: string
  endTime?: string
  duration?: number
  cost?: number
  notes?: string
  order?: number
}

export interface UpdateDayPlanItemDto extends Partial<Omit<CreateDayPlanItemDto, 'dayPlanId' | 'tripId'>> {}

