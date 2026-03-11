<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const quickActions = [
  { title: '创建行程', desc: '规划您的下一次出行', path: '/trips/create', color: '#409eff' },
  { title: '费用记录', desc: '记录出行费用', path: '/expenses', color: '#67c23a' },
  { title: '活动中心', desc: '发现精彩活动', path: '/activities', color: '#e6a23c' },
  { title: '消息中心', desc: '查看最新消息', path: '/messages', color: '#f56c6c' },
]
</script>

<template>
  <div class="home-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <h1>欢迎回来，{{ userStore.user?.nickname || '旅行者' }}</h1>
              <p>今天想去哪里旅行？</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="quick-actions">
      <el-col
        v-for="action in quickActions"
        :key="action.path"
        :xs="12"
        :sm="12"
        :md="6"
      >
        <el-card
          class="action-card"
          :style="{ '--action-color': action.color }"
          @click="router.push(action.path)"
        >
          <div class="action-content">
            <h3>{{ action.title }}</h3>
            <p>{{ action.desc }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  .welcome-card {
    margin-bottom: 20px;
  }

  .welcome-content {
    padding: 20px;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-radius: 8px;
    color: #fff;
  }

  .welcome-text {
    h1 {
      margin: 0 0 8px;
      font-size: 24px;
    }

    p {
      margin: 0;
      opacity: 0.9;
    }
  }

  .quick-actions {
    margin-top: 20px;
  }

  .action-card {
    cursor: pointer;
    transition: all 0.3s;
    border-left: 4px solid var(--action-color);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .action-content {
      h3 {
        margin: 0 0 8px;
        font-size: 16px;
        color: var(--action-color);
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    .welcome-text h1 {
      font-size: 20px;
    }
  }
}
</style>