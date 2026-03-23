<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, VideoPause, Close, Delete } from '@element-plus/icons-vue'
import { tripApi } from '@/api'
import type { TripVO, TripStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const trip = ref<TripVO | null>(null)

const tripId = Number(route.params.id)

const getStatusType = (status: TripStatus) => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return types[status] || 'info'
}

const fetchTrip = async () => {
  loading.value = true
  try {
    const res = await tripApi.get(tripId)
    trip.value = res
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleStart = async () => {
  await ElMessageBox.confirm('确定要开始这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.start(tripId)
    ElMessage.success('行程已开始')
    fetchTrip()
  } catch {
    // 错误已处理
  }
}

const handleEnd = async () => {
  await ElMessageBox.confirm('确定要结束这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.end(tripId)
    ElMessage.success('行程已结束')
    fetchTrip()
  } catch {
    // 错误已处理
  }
}

const handleCancel = async () => {
  await ElMessageBox.confirm('确定要取消这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.cancel(tripId)
    ElMessage.success('行程已取消')
    fetchTrip()
  } catch {
    // 错误已处理
  }
}

const handleDelete = async () => {
  await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.delete(tripId)
    ElMessage.success('删除成功')
    router.push('/trips')
  } catch {
    // 错误已处理
  }
}

onMounted(() => {
  fetchTrip()
})
</script>

<template>
  <div class="trip-detail-page">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ trip?.title || '行程详情' }}</span>
          <div class="actions">
            <el-button
              v-if="trip?.status === 0"
              type="success"
              :icon="VideoPlay"
              @click="handleStart"
            >
              开始行程
            </el-button>
            <el-button
              v-if="trip?.status === 1"
              type="warning"
              :icon="VideoPause"
              @click="handleEnd"
            >
              结束行程
            </el-button>
            <el-button
              v-if="trip?.status === 0 || trip?.status === 1"
              type="danger"
              :icon="Close"
              @click="handleCancel"
            >
              取消行程
            </el-button>
            <el-button
              v-if="trip?.status === 0"
              type="danger"
              text
              :icon="Delete"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-if="trip" :column="2" border>
        <el-descriptions-item label="行程标题">
          {{ trip.title || '未命名' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(trip.status)">
            {{ trip.statusDesc }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="起点">
          {{ trip.startLocation }}
        </el-descriptions-item>
        <el-descriptions-item label="终点">
          {{ trip.endLocation }}
        </el-descriptions-item>
        <el-descriptions-item label="起点坐标">
          {{ trip.startLongitude?.toFixed(6) }}, {{ trip.startLatitude?.toFixed(6) }}
        </el-descriptions-item>
        <el-descriptions-item label="终点坐标">
          {{ trip.endLongitude?.toFixed(6) }}, {{ trip.endLatitude?.toFixed(6) }}
        </el-descriptions-item>
        <el-descriptions-item label="距离">
          {{ trip.distance ? (trip.distance / 1000).toFixed(1) + ' km' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="预计时长">
          {{ trip.duration ? trip.duration + ' 分钟' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="车辆">
          {{ trip.vehicleModel || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ trip.createdAt ? new Date(trip.createdAt).toLocaleString() : '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="trip.startTime" label="开始时间">
          {{ new Date(trip.startTime).toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item v-if="trip.endTime" label="结束时间">
          {{ new Date(trip.endTime).toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.trip-detail-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}
</style>
