<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMessage, markMessageRead, deleteMessage } from '@/api/message'
import { useAppStore } from '@/stores/app'
import type { Message } from '@/types/message'
import { formatDate } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const message = ref<Message | null>(null)
const loading = ref(false)

const messageId = Number(route.params.id)

onMounted(async () => {
  await fetchMessage()
})

async function fetchMessage() {
  loading.value = true
  try {
    const res = await getMessage(messageId)
    if (res.code === 200 && res.data) {
      message.value = res.data
      // 自动标记已读
      if (!message.value.isRead) {
        await markMessageRead(messageId)
        message.value.isRead = true
        appStore.setUnreadCount(appStore.unreadMessageCount - 1)
      }
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  loading.value = true
  try {
    await deleteMessage(messageId)
    ElMessage.success('删除成功')
    router.push('/messages')
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
  <div class="message-detail-page" v-loading="loading">
    <el-card v-if="message">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="message-icon">{{ getMessageTypeIcon(message.type) }}</span>
            <span class="message-title">{{ message.title }}</span>
          </div>
          <el-button type="danger" link @click="handleDelete">
            删除
          </el-button>
        </div>
      </template>
      
      <div class="message-meta">
        <span class="meta-item">
          <el-tag size="small">{{ message.typeDesc }}</el-tag>
        </span>
        <span class="meta-item">
          📅 {{ formatDate(message.createdAt, 'YYYY-MM-DD HH:mm') }}
        </span>
      </div>
      
      <div class="message-body">
        {{ message.content }}
      </div>
      
      <div class="message-footer">
        <el-button @click="router.push('/messages')">
          返回列表
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.message-detail-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .message-icon {
        font-size: 24px;
      }
      
      .message-title {
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
  
  .message-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
    
    .meta-item {
      font-size: 14px;
      color: #666;
    }
  }
  
  .message-body {
    font-size: 15px;
    line-height: 1.8;
    color: #333;
    padding: 16px;
    background: #FFF8F0;
    border-radius: 8px;
  }
  
  .message-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
}
</style>