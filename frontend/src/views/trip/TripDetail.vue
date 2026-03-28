<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTrip, startTrip, endTrip, cancelTrip, deleteTrip } from '@/api/trip'
import type { Trip } from '@/types/trip'
import { formatDistance, formatDuration, formatDate, getTripStatusTag } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const trip = ref<Trip | null>(null)
const loading = ref(false)

const tripId = Number(route.params.id)

onMounted(async () => {
  await fetchTrip()
})

async function fetchTrip() {
  loading.value = true
  try {
    const res = await getTrip(tripId)
    if (res.code === 200 && res.data) {
      trip.value = res.data
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleStart() {
  await ElMessageBox.confirm('确定要开始这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
  
  loading.value = true
  try {
    await startTrip(tripId)
    ElMessage.success('行程已开始')
    await fetchTrip()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleEnd() {
  await ElMessageBox.confirm('确定要结束这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  })
  
  loading.value = true
  try {
    await endTrip(tripId)
    ElMessage.success('行程已结束')
    await fetchTrip()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  await ElMessageBox.confirm('确定要取消这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await cancelTrip(tripId)
    ElMessage.success('行程已取消')
    await fetchTrip()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  router.push(`/trips/${tripId}/edit`)
}

async function handleDelete() {
  await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await deleteTrip(tripId)
    ElMessage.success('删除成功')
    router.push('/trips')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleAddExpense() {
  router.push(`/expenses/create?tripId=${tripId}`)
}
</script>

<template>
  <div class="trip-detail-page" v-loading="loading">
    <el-card v-if="trip">
      <template #header>
        <div class="card-header">
          <span>🗺️ {{ trip.title || '行程详情' }}</span>
          <el-tag :type="getTripStatusTag(trip.status).color">
            {{ trip.statusDesc }}
          </el-tag>
        </div>
      </template>
      
      <div class="trip-info">
        <!-- 路线信息 -->
        <div class="route-section">
          <div class="route-display">
            <div class="route-point start">
              <div class="point-icon">🚩</div>
              <div class="point-info">
                <div class="point-label">起点</div>
                <div class="point-address">{{ trip.startLocation }}</div>
              </div>
            </div>
            
            <div class="route-line">
              <div class="line-arrow">→</div>
              <div class="line-info">
                <span v-if="trip.distance">{{ formatDistance(trip.distance) }}</span>
                <span v-if="trip.duration">{{ formatDuration(trip.duration) }}</span>
              </div>
            </div>
            
            <div class="route-point end">
              <div class="point-icon">🏁</div>
              <div class="point-info">
                <div class="point-label">终点</div>
                <div class="point-address">{{ trip.endLocation }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 详细信息 -->
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">🚗</div>
            <div class="info-content">
              <div class="info-label">车辆</div>
              <div class="info-value">{{ trip.vehicleModel || '未指定' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">📏</div>
            <div class="info-content">
              <div class="info-label">距离</div>
              <div class="info-value">{{ trip.distance ? formatDistance(trip.distance) : '未知' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">⏱️</div>
            <div class="info-content">
              <div class="info-label">预计时长</div>
              <div class="info-value">{{ trip.duration ? formatDuration(trip.duration) : '未知' }}</div>
            </div>
          </div>
          
          <div class="info-item" v-if="trip.startTime">
            <div class="info-icon">🕐</div>
            <div class="info-content">
              <div class="info-label">开始时间</div>
              <div class="info-value">{{ formatDate(trip.startTime, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
          </div>
          
          <div class="info-item" v-if="trip.endTime">
            <div class="info-icon">🕐</div>
            <div class="info-content">
              <div class="info-label">结束时间</div>
              <div class="info-value">{{ formatDate(trip.endTime, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">📅</div>
            <div class="info-content">
              <div class="info-label">创建时间</div>
              <div class="info-value">{{ formatDate(trip.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="trip.status === 0"
          type="success"
          @click="handleStart"
        >
          🚀 开始行程
        </el-button>
        <el-button
          v-if="trip.status === 1"
          type="warning"
          @click="handleEnd"
        >
          🏁 结束行程
        </el-button>
        <el-button
          v-if="trip.status === 0 || trip.status === 1"
          type="danger"
          @click="handleCancel"
        >
          ❌ 取消行程
        </el-button>
        <el-button type="primary" @click="handleAddExpense">
          💰 添加费用
        </el-button>
        <el-button
          v-if="trip.status === 0"
          @click="handleEdit"
        >
          📝 编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete">
          删除
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.trip-detail-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
  }
  
  .trip-info {
    .route-section {
      margin-bottom: 24px;
      
      .route-display {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%);
        border-radius: 12px;
        
        .route-point {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .point-icon {
            font-size: 32px;
          }
          
          .point-info {
            .point-label {
              font-size: 12px;
              color: #999;
              margin-bottom: 4px;
            }
            
            .point-address {
              font-size: 16px;
              font-weight: bold;
            }
          }
        }
        
        .route-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 32px;
          
          .line-arrow {
            font-size: 24px;
            color: #FF6B35;
          }
          
          .line-info {
            display: flex;
            gap: 12px;
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f5f5f5;
        
        .info-icon {
          font-size: 24px;
        }
        
        .info-content {
          .info-label {
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 14px;
            font-weight: bold;
          }
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #eee;
  }
}

@media (max-width: 768px) {
  .trip-detail-page .trip-info .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trip-detail-page .trip-info .route-section .route-display {
    flex-direction: column;
    
    .route-line {
      margin: 16px 0;
      
      .line-arrow {
        transform: rotate(90deg);
      }
    }
  }
}
</style>