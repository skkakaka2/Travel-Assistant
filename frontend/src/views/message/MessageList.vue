<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMessages, deleteMessage, markAllMessagesRead } from '@/api/message'
import { useAppStore } from '@/stores/app'
import type { Message } from '@/types/message'
import { formatDate } from '@/utils/format'

const router = useRouter()
const appStore = useAppStore()

const messages = ref<Message[]>([])
const loading = ref(false)
const total = ref(0)

onMounted(async () => {
  await fetchMessages()
})

async function fetchMessages() {
  loading.value = true
  try {
    const res = await getMessages()
    if (res.code === 200 && res.data) {
      messages.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleView(id: number) {
  router.push(`/messages/${id}`)
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await deleteMessage(id)
    ElMessage.success('删除成功')
    await fetchMessages()
    // 更新未读数量
    const unreadRes = await getMessages()
    if (unreadRes.code === 200) {
      const unread = messages.value.filter(m => !m.isRead).length
      appStore.setUnreadCount(unread)
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleMarkAllRead() {
  await ElMessageBox.confirm('确定要将所有消息标记为已读吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
  
  loading.value = true
  try {
    await markAllMessagesRead()
    ElMessage.success('已全部标记为已读')
    await fetchMessages()
    appStore.setUnreadCount(0)
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function getMessageTypeIcon(type: number): string {
  const iconMap = {
    1: '📢',
    2: '🎉',
    3: '🗺️',
    4: '💰'
  }
  return iconMap[type as keyof typeof iconMap] || '📬'
}
</script>

<template>
  <div class="message-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📬 站内信</span>
          <el-button
            v-if="messages.some(m => !m.isRead)"
            type="primary"
            link
            @click="handleMarkAllRead"
          >
            全部标为已读
          </el-button>
        </div>
      </template>
      
      <div v-if="messages.length === 0 && !loading" class="empty-state">
        <EmptyState icon="📬" text="暂无消息" />
      </div>
      
      <div v-else class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', { unread: !message.isRead }]"
          @click="handleView(message.id)"
        >
          <div class="message-icon">
            {{ getMessageTypeIcon(message.type) }}
          </div>
          
          <div class="message-content">
            <div class="message-header">
              <span class="message-title">{{ message.title }}</span>
              <el-tag v-if="!message.isRead" type="warning" size="small">
                未读
              </el-tag>
            </div>
            <div class="message-preview">
              {{ message.content.substring(0, 50) }}{{ message.content.length > 50 ? '...' : '' }}
            </div>
            <div class="message-time">
              {{ formatDate(message.createdAt, 'YYYY-MM-DD HH:mm') }}
            </div>
          </div>
          
          <div class="message-actions">
            <el-button type="danger" link size="small" @click.stop="handleDelete(message.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.message-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
  }
  
  .message-list {
    .message-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #eee;
      margin-bottom: 12px;
      cursor: pointer;
      
      &:hover {
        border-color: #FF6B35;
        background: #FFF8F0;
      }
      
      &.unread {
        border-color: #FFD166;
        background: linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%);
        
        .message-title {
          font-weight: bold;
        }
      }
      
      .message-icon {
        font-size: 32px;
      }
      
      .message-content {
        flex: 1;
        
        .message-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .message-title {
            font-size: 16px;
          }
        }
        
        .message-preview {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .message-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}
</style>