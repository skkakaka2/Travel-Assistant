<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTrips } from '@/api/trip'
import { getActivities } from '@/api/activity'
import { getExpenseStatistics } from '@/api/expense'
import { getBoundVehicles } from '@/api/user'
import type { Trip } from '@/types/trip'
import type { Activity } from '@/types/activity'
import type { ExpenseStatistics } from '@/types/expense'
import { formatDistance, formatDuration, formatMoney } from '@/utils/format'

const router = useRouter()

const loading = ref(false)

const stats = ref({
  vehicles: 0,
  trips: 0,
  activities: 0,
  expenses: 0
})

const recentTrips = ref<Trip[]>([])
const recentActivities = ref<Activity[]>([])
const expenseStats = ref<ExpenseStatistics | null>(null)

onMounted(async () => {
  await fetchDashboardData()
})

async function fetchDashboardData() {
  loading.value = true
  try {
    // 并行获取数据
    const [vehiclesRes, tripsRes, activitiesRes, expensesRes] = await Promise.all([
      getBoundVehicles(),
      getTrips({ page: 1, size: 5 }),
      getActivities({ page: 1, size: 5 }),
      getExpenseStatistics()
    ])
    
    // 车辆数量
    if (vehiclesRes.code === 200 && vehiclesRes.data) {
      stats.value.vehicles = vehiclesRes.data.length
    }
    
    // 行程
    if (tripsRes.code === 200 && tripsRes.data) {
      stats.value.trips = tripsRes.data.total || 0
      recentTrips.value = tripsRes.data.records || []
    }
    
    // 活动
    if (activitiesRes.code === 200 && activitiesRes.data) {
      stats.value.activities = activitiesRes.data.total || 0
      recentActivities.value = activitiesRes.data.records || []
    }
    
    // 费用
    if (expensesRes.code === 200 && expensesRes.data) {
      stats.value.expenses = expensesRes.data.count || 0
      expenseStats.value = expensesRes.data
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function goToTrips() {
  router.push('/trips')
}

function goToActivities() {
  router.push('/activities')
}

function goToExpenses() {
  router.push('/expenses')
}

function goToVehicles() {
  router.push('/vehicles')
}

function goToTripDetail(id: number) {
  router.push(`/trips/${id}`)
}

function goToActivityDetail(id: number) {
  router.push(`/activities/${id}`)
}

function getTripStatusColor(status: number): string {
  const colorMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return colorMap[status as keyof typeof colorMap] || 'info'
}

function getActivityStatusColor(status: number): string {
  const colorMap = {
    0: 'success',
    1: 'danger',
    2: 'info'
  }
  return colorMap[status as keyof typeof colorMap] || 'info'
}
</script>

<template>
  <div class="dashboard-page" v-loading="loading">
    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card" @click="goToVehicles">
        <div class="stat-icon">🚗</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.vehicles }}</div>
          <div class="stat-label">我的车辆</div>
        </div>
      </div>
      
      <div class="stat-card" @click="goToTrips">
        <div class="stat-icon">🗺️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.trips }}</div>
          <div class="stat-label">行程总数</div>
        </div>
      </div>
      
      <div class="stat-card" @click="goToActivities">
        <div class="stat-icon">🎉</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.activities }}</div>
          <div class="stat-label">参与活动</div>
        </div>
      </div>
      
      <div class="stat-card" @click="goToExpenses">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">{{ expenseStats ? formatMoney(expenseStats.totalAmount) : '¥0' }}</div>
          <div class="stat-label">总费用</div>
        </div>
      </div>
    </div>
    
    <!-- 近期行程 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>📍 近期行程</span>
          <el-button type="primary" link @click="goToTrips">
            查看全部
          </el-button>
        </div>
      </template>
      
      <div v-if="recentTrips.length === 0" class="empty-section">
        <EmptyState
          icon="🗺️"
          text="暂无行程"
          show-button
          button-text="新建行程"
          @action="router.push('/trips/create')"
        />
      </div>
      
      <div v-else class="trip-list">
        <div
          v-for="trip in recentTrips"
          :key="trip.id"
          class="trip-item"
          @click="goToTripDetail(trip.id)"
        >
          <div class="trip-header">
            <span class="trip-title">{{ trip.title || '未命名行程' }}</span>
            <el-tag :type="getTripStatusColor(trip.status)" size="small">
              {{ trip.statusDesc }}
            </el-tag>
          </div>
          <div class="trip-route">
            <span>🚩 {{ trip.startLocation }}</span>
            <span class="arrow">→</span>
            <span>🏁 {{ trip.endLocation }}</span>
          </div>
          <div class="trip-meta">
            <span v-if="trip.distance">📏 {{ formatDistance(trip.distance) }}</span>
            <span v-if="trip.duration">⏱️ {{ formatDuration(trip.duration) }}</span>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 近期活动 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>🎉 近期活动</span>
          <el-button type="primary" link @click="goToActivities">
            查看全部
          </el-button>
        </div>
      </template>
      
      <div v-if="recentActivities.length === 0" class="empty-section">
        <EmptyState
          icon="🎉"
          text="暂无活动"
          show-button
          button-text="创建活动"
          @action="router.push('/activities/create')"
        />
      </div>
      
      <div v-else class="activity-list">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="activity-item"
          @click="goToActivityDetail(activity.id)"
        >
          <div class="activity-header">
            <span class="activity-title">{{ activity.title }}</span>
            <el-tag :type="getActivityStatusColor(activity.status)" size="small">
              {{ activity.statusDesc }}
            </el-tag>
          </div>
          <div class="activity-meta">
            <span>📍 {{ activity.location || '未设置' }}</span>
            <span>👤 {{ activity.creatorNickname }}</span>
            <span>👥 {{ activity.currentParticipants }}人</span>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 费用概览 -->
    <el-card class="section-card" v-if="expenseStats">
      <template #header>
        <div class="card-header">
          <span>💰 费用概览</span>
          <el-button type="primary" link @click="goToExpenses">
            查看详情
          </el-button>
        </div>
      </template>
      
      <div class="expense-overview">
        <div class="expense-item">
          <span class="expense-icon">⛽</span>
          <span class="expense-name">油费</span>
          <span class="expense-amount">{{ formatMoney(expenseStats.fuelAmount) }}</span>
        </div>
        <div class="expense-item">
          <span class="expense-icon">🛣️</span>
          <span class="expense-name">过路费</span>
          <span class="expense-amount">{{ formatMoney(expenseStats.tollAmount) }}</span>
        </div>
        <div class="expense-item">
          <span class="expense-icon">🅿️</span>
          <span class="expense-name">停车费</span>
          <span class="expense-amount">{{ formatMoney(expenseStats.parkingAmount) }}</span>
        </div>
        <div class="expense-item">
          <span class="expense-icon">🔧</span>
          <span class="expense-name">维修费</span>
          <span class="expense-amount">{{ formatMoney(expenseStats.maintenanceAmount) }}</span>
        </div>
        <div class="expense-item">
          <span class="expense-icon">💰</span>
          <span class="expense-name">其他</span>
          <span class="expense-amount">{{ formatMoney(expenseStats.otherAmount) }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      border: 1px solid #eee;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: #FF6B35;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .stat-icon {
        font-size: 40px;
      }
      
      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #FF6B35;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  
  .section-card {
    margin-bottom: 24px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }
    
    .trip-list, .activity-list {
      .trip-item, .activity-item {
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #eee;
        margin-bottom: 12px;
        cursor: pointer;
        
        &:hover {
          border-color: #FF6B35;
          background: #FFF8F0;
        }
        
        .trip-header, .activity-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .trip-title, .activity-title {
            font-size: 16px;
            font-weight: bold;
          }
        }
        
        .trip-route {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
          
          .arrow {
            color: #FF6B35;
          }
        }
        
        .trip-meta, .activity-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #999;
        }
      }
    }
    
    .expense-overview {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      
      .expense-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        background: #FFF8F0;
        border-radius: 8px;
        
        .expense-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .expense-name {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .expense-amount {
          font-size: 16px;
          font-weight: bold;
          color: #FF6B35;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    .stats-section {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .expense-overview {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}
</style>