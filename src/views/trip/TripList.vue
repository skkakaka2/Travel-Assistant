<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete, VideoPlay, VideoPause, Close } from '@element-plus/icons-vue'
import { tripApi } from '@/api'
import type { TripVO, TripStatus, TripListParams } from '@/types'

const router = useRouter()
const loading = ref(false)
const trips = ref<TripVO[]>([])
const total = ref(0)
const params = ref<TripListParams>({
  page: 1,
  size: 10,
})

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '未开始', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已取消', value: 3 },
]

const getStatusType = (status: TripStatus) => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return types[status] || 'info'
}

const fetchTrips = async () => {
  loading.value = true
  try {
    const res = await tripApi.getList(params.value)
    trips.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  params.value.page = 1
  fetchTrips()
}

const handlePageChange = (page: number) => {
  params.value.page = page
  fetchTrips()
}

const handleCreate = () => {
  router.push('/trips/create')
}

const handleView = (id: number) => {
  router.push(`/trips/${id}`)
}

const handleStart = async (id: number) => {
  await ElMessageBox.confirm('确定要开始这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.start(id)
    ElMessage.success('行程已开始')
    fetchTrips()
  } catch {
    // 错误已处理
  }
}

const handleEnd = async (id: number) => {
  await ElMessageBox.confirm('确定要结束这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.end(id)
    ElMessage.success('行程已结束')
    fetchTrips()
  } catch {
    // 错误已处理
  }
}

const handleCancel = async (id: number) => {
  await ElMessageBox.confirm('确定要取消这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.cancel(id)
    ElMessage.success('行程已取消')
    fetchTrips()
  } catch {
    // 错误已处理
  }
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这个行程吗？', '提示', {
    type: 'warning',
  })
  try {
    await tripApi.delete(id)
    ElMessage.success('删除成功')
    fetchTrips()
  } catch {
    // 错误已处理
  }
}

onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <div class="trip-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>行程列表</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            创建行程
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="状态">
          <el-select
            v-model="params.status"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="trips" stripe>
        <el-table-column prop="title" label="行程标题" min-width="150">
          <template #default="{ row }">
            {{ row.title || '未命名行程' }}
          </template>
        </el-table-column>
        <el-table-column prop="startLocation" label="起点" min-width="120" />
        <el-table-column prop="endLocation" label="终点" min-width="120" />
        <el-table-column prop="distance" label="距离(km)" width="100">
          <template #default="{ row }">
            {{ row.distance ? (row.distance / 1000).toFixed(1) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="100">
          <template #default="{ row }">
            {{ row.duration || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="vehicleModel" label="车辆" width="120">
          <template #default="{ row }">
            {{ row.vehicleModel || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text :icon="View" @click="handleView(row.id)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              text
              :icon="VideoPlay"
              @click="handleStart(row.id)"
            >
              开始
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="warning"
              text
              :icon="VideoPause"
              @click="handleEnd(row.id)"
            >
              结束
            </el-button>
            <el-button
              v-if="row.status === 0 || row.status === 1"
              type="danger"
              text
              :icon="Close"
              @click="handleCancel(row.id)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              text
              :icon="Delete"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        :current-page="params.page"
        :page-size="params.size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.trip-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>