<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Check, CheckAll } from '@element-plus/icons-vue'
import { messageApi } from '@/api'
import type { MessageVO, MessageListParams } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const messages = ref<MessageVO[]>([])
const total = ref(0)
const unreadCount = ref(0)
const detailVisible = ref(false)
const currentMessage = ref<MessageVO | null>(null)

const params = ref<MessageListParams>({
  page: 1,
  size: 10,
})

const isReadOptions = [
  { label: '全部', value: undefined },
  { label: '未读', value: 0 },
  { label: '已读', value: 1 },
]

const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await messageApi.getList(params.value)
    messages.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const fetchUnreadCount = async () => {
  try {
    const res = await messageApi.getUnreadCount()
    unreadCount.value = res.data || 0
  } catch {
    // 错误已处理
  }
}

const handleSearch = () => {
  params.value.page = 1
  fetchMessages()
}

const handlePageChange = (page: number) => {
  params.value.page = page
  fetchMessages()
}

const handleView = async (message: MessageVO) => {
  currentMessage.value = message
  detailVisible.value = true

  if (!message.isRead) {
    try {
      await messageApi.markAsRead(message.id)
      message.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {
      // 错误已处理
    }
  }
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
    type: 'warning',
  })
  try {
    await messageApi.delete(id)
    ElMessage.success('删除成功')
    fetchMessages()
    fetchUnreadCount()
  } catch {
    // 错误已处理
  }
}

const handleMarkAsRead = async (id: number) => {
  try {
    await messageApi.markAsRead(id)
    const msg = messages.value.find(m => m.id === id)
    if (msg) msg.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    ElMessage.success('已标记为已读')
  } catch {
    // 错误已处理
  }
}

const handleMarkAllAsRead = async () => {
  try {
    await messageApi.markAllAsRead()
    messages.value.forEach(m => m.isRead = true)
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch {
    // 错误已处理
  }
}

onMounted(() => {
  fetchMessages()
  fetchUnreadCount()
})
</script>

<template>
  <div class="message-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>消息中心</span>
            <el-badge v-if="unreadCount > 0" :value="unreadCount" class="unread-badge" />
          </div>
          <div class="header-right">
            <el-button
              v-if="unreadCount > 0"
              type="primary"
              text
              :icon="CheckAll"
              @click="handleMarkAllAsRead"
            >
              全部已读
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="状态">
          <el-select
            v-model="params.isRead"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="item in isReadOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 消息列表 -->
      <div v-loading="loading" class="message-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message-item', { unread: !msg.isRead }]"
          @click="handleView(msg)"
        >
          <div class="message-content">
            <div class="message-header">
              <span class="message-title">{{ msg.title }}</span>
              <el-tag v-if="!msg.isRead" type="danger" size="small">未读</el-tag>
            </div>
            <div class="message-text">{{ msg.content }}</div>
            <div class="message-time">{{ dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="message-actions" @click.stop>
            <el-button
              v-if="!msg.isRead"
              type="primary"
              text
              :icon="Check"
              @click="handleMarkAsRead(msg.id)"
            >
              标记已读
            </el-button>
            <el-button type="danger" text :icon="Delete" @click="handleDelete(msg.id)">
              删除
            </el-button>
          </div>
        </div>

        <el-empty v-if="!loading && messages.length === 0" description="暂无消息" />
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > params.size"
        class="pagination"
        :current-page="params.page"
        :page-size="params.size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 消息详情弹窗 -->
    <el-dialog v-model="detailVisible" title="消息详情" width="500px">
      <div v-if="currentMessage" class="message-detail">
        <h3>{{ currentMessage.title }}</h3>
        <div class="detail-meta">
          <span>{{ currentMessage.typeDesc }}</span>
          <span>{{ dayjs(currentMessage.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="detail-content">{{ currentMessage.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.message-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .unread-badge {
      :deep(.el-badge__content) {
        transform: translateY(-2px);
      }
    }
  }

  .search-form {
    margin-bottom: 16px;
  }

  .message-list {
    min-height: 300px;
  }

  .message-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    &.unread {
      background-color: #ecf5ff;

      .message-title {
        font-weight: bold;
      }
    }

    .message-content {
      flex: 1;
      min-width: 0;

      .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .message-title {
        font-size: 16px;
        color: #303133;
      }

      .message-text {
        font-size: 14px;
        color: #606266;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 8px;
      }

      .message-time {
        font-size: 12px;
        color: #909399;
      }
    }

    .message-actions {
      display: flex;
      gap: 8px;
    }
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .message-detail {
    h3 {
      margin: 0 0 16px;
      font-size: 18px;
    }

    .detail-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #909399;
    }

    .detail-content {
      font-size: 14px;
      line-height: 1.8;
      color: #606266;
    }
  }
}
</style>