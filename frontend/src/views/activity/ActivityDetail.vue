<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivity, joinActivity, quitActivity, cancelActivity, deleteActivity } from '@/api/activity'
import type { Activity } from '@/types/activity'
import { formatDate, getActivityStatusTag } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const activity = ref<Activity | null>(null)
const loading = ref(false)

const activityId = Number(route.params.id)

onMounted(async () => {
  await fetchActivity()
})

async function fetchActivity() {
  loading.value = true
  try {
    const res = await getActivity(activityId)
    if (res.code === 200 && res.data) {
      activity.value = res.data
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleJoin() {
  loading.value = true
  try {
    await joinActivity(activityId)
    ElMessage.success('已参加活动')
    await fetchActivity()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleQuit() {
  await ElMessageBox.confirm('确定要退出这个活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await quitActivity(activityId)
    ElMessage.success('已退出活动')
    await fetchActivity()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  await ElMessageBox.confirm('确定要取消这个活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await cancelActivity(activityId)
    ElMessage.success('活动已取消')
    await fetchActivity()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  await ElMessageBox.confirm('确定要删除这个活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await deleteActivity(activityId)
    ElMessage.success('删除成功')
    router.push('/activities')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="activity-detail-page" v-loading="loading">
    <el-card v-if="activity">
      <template #header>
        <div class="card-header">
          <span>🎉 {{ activity.title }}</span>
          <el-tag :type="getActivityStatusTag(activity.status).color">
            {{ activity.statusDesc }}
          </el-tag>
        </div>
      </template>
      
      <div class="activity-info">
        <!-- 描述 -->
        <div class="description-section" v-if="activity.description">
          <h4>📝 活动描述</h4>
          <p>{{ activity.description }}</p>
        </div>
        
        <!-- 详细信息 -->
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">📍</div>
            <div class="info-content">
              <div class="info-label">地点</div>
              <div class="info-value">{{ activity.location || '未设置' }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">👤</div>
            <div class="info-content">
              <div class="info-label">发起人</div>
              <div class="info-value">{{ activity.creatorNickname }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">👥</div>
            <div class="info-content">
              <div class="info-label">参与人数</div>
              <div class="info-value">
                {{ activity.currentParticipants }} / {{ activity.maxParticipants || '不限' }}人
              </div>
            </div>
          </div>
          
          <div class="info-item" v-if="activity.startTime">
            <div class="info-icon">📅</div>
            <div class="info-content">
              <div class="info-label">开始时间</div>
              <div class="info-value">{{ formatDate(activity.startTime, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
          </div>
          
          <div class="info-item" v-if="activity.endTime">
            <div class="info-icon">📅</div>
            <div class="info-content">
              <div class="info-label">结束时间</div>
              <div class="info-value">{{ formatDate(activity.endTime, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">📅</div>
            <div class="info-content">
              <div class="info-label">创建时间</div>
              <div class="info-value">{{ formatDate(activity.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="!activity.joined && activity.status === 0"
          type="success"
          @click="handleJoin"
        >
          🙋 参加活动
        </el-button>
        <el-button
          v-if="activity.joined && activity.status === 0"
          type="warning"
          @click="handleQuit"
        >
          🚪 退出活动
        </el-button>
        <el-button
          v-if="activity.status === 0"
          type="danger"
          @click="handleCancel"
        >
          ❌ 取消活动
        </el-button>
        <el-button
          v-if="activity.status === 1"
          type="danger"
          link
          @click="handleDelete"
        >
          删除
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.activity-detail-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
  }
  
  .activity-info {
    .description-section {
      margin-bottom: 24px;
      padding: 16px;
      background: #FFF8F0;
      border-radius: 8px;
      
      h4 {
        font-size: 16px;
        margin-bottom: 12px;
      }
      
      p {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
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
  .activity-detail-page .activity-info .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>