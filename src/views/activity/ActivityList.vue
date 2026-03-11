<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, View, User } from '@element-plus/icons-vue'
import { activityApi } from '@/api'
import type { ActivityVO, ActivityStatus, ActivityListParams } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const activities = ref<ActivityVO[]>([])
const total = ref(0)
const params = ref<ActivityListParams>({
  page: 1,
  size: 12,
})

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '待开始', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已结束', value: 2 },
  { label: '已取消', value: 3 },
]

const getStatusType = (status: ActivityStatus) => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return types[status] || 'info'
}

const fetchActivities = async () => {
  loading.value = true
  try {
    const res = await activityApi.getList(params.value)
    activities.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  params.value.page = 1
  fetchActivities()
}

const handlePageChange = (page: number) => {
  params.value.page = page
  fetchActivities()
}

const handleView = (id: number) => {
  router.push(`/activities/${id}`)
}

const handleJoin = async (id: number) => {
  try {
    await activityApi.join(id)
    ElMessage.success('报名成功')
    fetchActivities()
  } catch {
    // 错误已处理
  }
}

const handleQuit = async (id: number) => {
  try {
    await activityApi.quit(id)
    ElMessage.success('已退出活动')
    fetchActivities()
  } catch {
    // 错误已处理
  }
}

const goToMyActivities = () => {
  router.push('/activities/my')
}

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="activity-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动列表</span>
          <div>
            <el-button type="default" :icon="User" @click="goToMyActivities">
              我的活动
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="params.keyword"
            placeholder="搜索活动"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 活动卡片 -->
      <div v-loading="loading" class="activity-grid">
        <el-card
          v-for="activity in activities"
          :key="activity.id"
          class="activity-card"
          shadow="hover"
        >
          <div class="activity-header">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <el-tag :type="getStatusType(activity.status)" size="small">
              {{ activity.statusDesc }}
            </el-tag>
          </div>

          <p class="activity-desc">{{ activity.description || '暂无描述' }}</p>

          <div class="activity-info">
            <div class="info-item">
              <span class="label">地点：</span>
              <span>{{ activity.location || '待定' }}</span>
            </div>
            <div class="info-item">
              <span class="label">时间：</span>
              <span>
                {{ activity.startTime ? dayjs(activity.startTime).format('MM-DD HH:mm') : '待定' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">人数：</span>
              <span>
                {{ activity.currentParticipants }} / {{ activity.maxParticipants || '不限' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">发起人：</span>
              <span>{{ activity.creatorNickname }}</span>
            </div>
          </div>

          <div class="activity-actions">
            <el-button type="primary" text :icon="View" @click="handleView(activity.id)">
              详情
            </el-button>
            <el-button
              v-if="!activity.joined"
              type="success"
              text
              @click="handleJoin(activity.id)"
            >
              报名参加
            </el-button>
            <el-button
              v-else
              type="warning"
              text
              @click="handleQuit(activity.id)"
            >
              退出活动
            </el-button>
          </div>
        </el-card>
      </div>

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
.activity-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 16px;
  }

  .activity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    min-height: 200px;
  }

  .activity-card {
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .activity-title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      flex: 1;
      margin-right: 8px;
    }

    .activity-desc {
      color: #606266;
      font-size: 14px;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .activity-info {
      .info-item {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;

        .label {
          color: #606266;
        }
      }
    }

    .activity-actions {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;
    }
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>