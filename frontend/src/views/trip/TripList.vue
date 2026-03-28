<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTrips, deleteTrip, startTrip, endTrip, cancelTrip } from '@/api/trip'
import type { Trip } from '@/types/trip'
import { formatDistance, formatDuration, getTripStatusTag } from '@/utils/format'

const router = useRouter()

const trips = ref<Trip[]>([])
const loading = ref(false)
const total = ref(0)

const statusFilter = ref<number | null>(null)

onMounted(async () => {
  await fetchTrips()
})

async function fetchTrips() {
  loading.value = true
  try {
    const params: any = {}
    if (statusFilter.value !== null) {
      params.status = statusFilter.value
    }
    const res = await getTrips(params)
    if (res.code === 200 && res.data) {
      trips.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push('/trips/create')
}

function handleView(id: number) {
  router.push(`/trips/${id}`)
}

function handleEdit(id: number) {
  router.push(`/trips/${id}/edit`)
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await deleteTrip(id)
    ElMessage.success('删除成功')
    await fetchTrips()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleStart(id: number) {
  await ElMessageBox.confirm('确定要开始这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
  
  loading.value = true
  try {
    await startTrip(id)
    ElMessage.success('行程已开始')
    await fetchTrips()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleEnd(id: number) {
  await ElMessageBox.confirm('确定要结束这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  })
  
  loading.value = true
  try {
    await endTrip(id)
    ElMessage.success('行程已结束')
    await fetchTrips()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleCancel(id: number) {
  await ElMessageBox.confirm('确定要取消这个行程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await cancelTrip(id)
    ElMessage.success('行程已取消')
    await fetchTrips()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleStatusChange() {
  fetchTrips()
}
</script>

<template>
  <div class="trip-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🗺️ 行程管理</span>
          <div class="header-actions">
            <el-select
              v-model="statusFilter"
              placeholder="状态筛选"
              clearable
              style="width: 120px"
              @change="handleStatusChange"
            >
              <el-option label="全部" :value="null" />
              <el-option label="未开始" :value="0" />
              <el-option label="进行中" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已取消" :value="3" />
            </el-select>
            <el-button type="primary" @click="handleCreate">
              新建行程
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="trips.length === 0 && !loading" class="empty-state">
        <EmptyState
          icon="🗺️"
          text="暂无行程"
          show-button
          button-text="新建行程"
          @action="handleCreate"
        />
      </div>
      
      <div v-else class="trip-list">
        <div
          v-for="trip in trips"
          :key="trip.id"
          class="trip-item"
        >
          <div class="trip-content" @click="handleView(trip.id)">
            <div class="trip-header">
              <span class="trip-title">{{ trip.title || '未命名行程' }}</span>
              <el-tag :type="getTripStatusTag(trip.status).color">
                {{ trip.statusDesc }}
              </el-tag>
            </div>
            
            <div class="trip-route">
              <div class="route-point">
                <span class="point-icon">🚩</span>
                <span class="point-text">{{ trip.startLocation }}</span>
              </div>
              <div class="route-arrow">→</div>
              <div class="route-point">
                <span class="point-icon">🏁</span>
                <span class="point-text">{{ trip.endLocation }}</span>
              </div>
            </div>
            
            <div class="trip-meta">
              <span v-if="trip.vehicleModel">🚗 {{ trip.vehicleModel }}</span>
              <span v-if="trip.distance">📏 {{ formatDistance(trip.distance) }}</span>
              <span v-if="trip.duration">⏱️ {{ formatDuration(trip.duration) }}</span>
            </div>
          </div>
          
          <div class="trip-actions">
            <el-button
              v-if="trip.status === 0"
              type="success"
              size="small"
              @click="handleStart(trip.id)"
            >
              开始
            </el-button>
            <el-button
              v-if="trip.status === 1"
              type="warning"
              size="small"
              @click="handleEnd(trip.id)"
            >
              结束
            </el-button>
            <el-button
              v-if="trip.status === 0 || trip.status === 1"
              type="danger"
              size="small"
              @click="handleCancel(trip.id)"
            >
              取消
            </el-button>
            <el-button
              v-if="trip.status === 0"
              type="primary"
              link
              size="small"
              @click="handleEdit(trip.id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(trip.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.trip-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .trip-list {
    .trip-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #eee;
      margin-bottom: 12px;
      
      &:hover {
        border-color: #FF6B35;
        background: #FFF8F0;
      }
      
      .trip-content {
        cursor: pointer;
        
        .trip-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          
          .trip-title {
            font-size: 16px;
            font-weight: bold;
          }
        }
        
        .trip-route {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
          
          .route-point {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .point-icon {
              font-size: 18px;
            }
            
            .point-text {
              font-size: 14px;
              color: #666;
            }
          }
          
          .route-arrow {
            color: #FF6B35;
            font-weight: bold;
          }
        }
        
        .trip-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #999;
        }
      }
      
      .trip-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }
  }
}
</style>