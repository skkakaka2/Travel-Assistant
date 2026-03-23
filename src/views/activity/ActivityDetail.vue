<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, Delete } from '@element-plus/icons-vue'
import { activityApi } from '@/api'
import type { ActivityVO, ActivityStatus } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const activity = ref<ActivityVO | null>(null)

const activityId = Number(route.params.id)

const getStatusType = (status: ActivityStatus) => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return types[status] || 'info'
}

const fetchActivity = async () => {
  loading.value = true
  try {
    const res = await activityApi.get(activityId)
    activity.value = res
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleJoin = async () => {
  try {
    await activityApi.join(activityId)
    ElMessage.success('报名成功')
    fetchActivity()
  } catch {
    // 错误已处理
  }
}

const handleQuit = async () => {
  await ElMessageBox.confirm('确定要退出这个活动吗？', '提示', {
    type: 'warning',
  })
  try {
    await activityApi.quit(activityId)
    ElMessage.success('已退出活动')
    fetchActivity()
  } catch {
    // 错误已处理
  }
}

const handleCancel = async () => {
  await ElMessageBox.confirm('确定要取消这个活动吗？', '提示', {
    type: 'warning',
  })
  try {
    await activityApi.cancel(activityId)
    ElMessage.success('活动已取消')
    fetchActivity()
  } catch {
    // 错误已处理
  }
}

onMounted(() => {
  fetchActivity()
})
</script>

<template>
  <div class="activity-detail-page">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ activity?.title || '活动详情' }}</span>
          <div class="actions">
            <el-button
              v-if="
                activity && !activity.joined && (activity.status === 0 || activity.status === 1)
              "
              type="success"
              @click="handleJoin"
            >
              报名参加
            </el-button>
            <el-button
              v-if="activity?.joined && (activity?.status === 0 || activity?.status === 1)"
              type="warning"
              @click="handleQuit"
            >
              退出活动
            </el-button>
            <el-button
              v-if="activity?.creatorId && activity?.status === 0"
              type="danger"
              :icon="Close"
              @click="handleCancel"
            >
              取消活动
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-if="activity" :column="2" border>
        <el-descriptions-item label="活动标题">
          {{ activity.title }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(activity.status)">
            {{ activity.statusDesc }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发起人">
          {{ activity.creatorNickname }}
        </el-descriptions-item>
        <el-descriptions-item label="参与人数">
          {{ activity.currentParticipants }} / {{ activity.maxParticipants || '不限' }}
        </el-descriptions-item>
        <el-descriptions-item label="活动地点">
          {{ activity.location || '待定' }}
        </el-descriptions-item>
        <el-descriptions-item label="我的状态">
          <el-tag :type="activity.joined ? 'success' : 'info'">
            {{ activity.joined ? '已报名' : '未报名' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ activity.startTime ? dayjs(activity.startTime).format('YYYY-MM-DD HH:mm') : '待定' }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ activity.endTime ? dayjs(activity.endTime).format('YYYY-MM-DD HH:mm') : '待定' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ activity.createdAt ? dayjs(activity.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="活动描述" :span="2">
          {{ activity.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.activity-detail-page {
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
