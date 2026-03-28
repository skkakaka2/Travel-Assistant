<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, deleteActivity, joinActivity, quitActivity, cancelActivity } from '@/api/activity'
import type { Activity } from '@/types/activity'
import { formatDate, getActivityStatusTag } from '@/utils/format'

const router = useRouter()

const activities = ref<Activity[]>([])
const loading = ref(false)
const total = ref(0)

const filterType = ref<'all' | 'joined' | 'created'>('all')

onMounted(async () => {
  await fetchActivities()
})

async function fetchActivities() {
  loading.value = true
  try {
    let res
    if (filterType.value === 'joined') {
      res = await getActivities()
    } else if (filterType.value === 'created') {
      res = await getActivities()
    } else {
      res = await getActivities()
    }
    if (res.code === 200 && res.data) {
      activities.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push('/activities/create')
}

function handleView(id: number) {
  router.push(`/activities/${id}`)
}

async function handleJoin(id: number) {
  loading.value = true
  try {
    await joinActivity(id)
    ElMessage.success('已参加活动')
    await fetchActivities()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleQuit(id: number) {
  await ElMessageBox.confirm('确定要退出这个活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await quitActivity(id)
    ElMessage.success('已退出活动')
    await fetchActivities()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleCancel(id: number) {
  await ElMessageBox.confirm('确定要取消这个活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await cancelActivity(id)
    ElMessage.success('活动已取消')
    await fetchActivities()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除这个活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await deleteActivity(id)
    ElMessage.success('删除成功')
    await fetchActivities()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  fetchActivities()
}
</script>

<template>
  <div class="activity-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🎉 活动管理</span>
          <div class="header-actions">
            <el-select
              v-model="filterType"
              placeholder="筛选"
              style="width: 120px"
              @change="handleFilterChange"
            >
              <el-option label="全部活动" value="all" />
              <el-option label="我参与的" value="joined" />
              <el-option label="我创建的" value="created" />
            </el-select>
            <el-button type="primary" @click="handleCreate">
              创建活动
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="activities.length === 0 && !loading" class="empty-state">
        <EmptyState
          icon="🎉"
          text="暂无活动"
          show-button
          button-text="创建活动"
          @action="handleCreate"
        />
      </div>
      
      <div v-else class="activity-list">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-content" @click="handleView(activity.id)">
            <div class="activity-header">
              <span class="activity-title">{{ activity.title }}</span>
              <el-tag :type="getActivityStatusTag(activity.status).color">
                {{ activity.statusDesc }}
              </el-tag>
            </div>
            
            <div class="activity-info">
              <div class="info-row">
                <span>📍 {{ activity.location || '未设置地点' }}</span>
                <span>👤 {{ activity.creatorNickname }}</span>
              </div>
              <div class="info-row">
                <span v-if="activity.startTime">
                  📅 {{ formatDate(activity.startTime, 'YYYY-MM-DD HH:mm') }}
                </span>
                <span>👥 {{ activity.currentParticipants }}/{{ activity.maxParticipants || '不限' }}人</span>
              </div>
            </div>
          </div>
          
          <div class="activity-actions">
            <el-button
              v-if="!activity.joined && activity.status === 0"
              type="success"
              size="small"
              @click="handleJoin(activity.id)"
            >
              参加
            </el-button>
            <el-button
              v-if="activity.joined && activity.status === 0"
              type="warning"
              size="small"
              @click="handleQuit(activity.id)"
            >
              退出
            </el-button>
            <el-button
              v-if="activity.status === 0"
              type="danger"
              link
              size="small"
              @click="handleCancel(activity.id)"
            >
              取消
            </el-button>
            <el-button
              v-if="activity.status === 1"
              type="danger"
              link
              size="small"
              @click="handleDelete(activity.id)"
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
.activity-list-page {
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
  
  .activity-list {
    .activity-item {
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
      
      .activity-content {
        cursor: pointer;
        
        .activity-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          
          .activity-title {
            font-size: 16px;
            font-weight: bold;
          }
        }
        
        .activity-info {
          .info-row {
            display: flex;
            gap: 16px;
            margin-bottom: 4px;
            font-size: 13px;
            color: #666;
          }
        }
      }
      
      .activity-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }
  }
}
</style>