<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-icon">🚧</div>
    <h1 class="not-found-title">页面不存在</h1>
    <p class="not-found-text">您访问的页面可能已被删除或不存在</p>
    <el-button type="primary" round @click="goHome">
      返回首页
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  .not-found-icon {
    font-size: 80px;
    margin-bottom: 24px;
  }
  
  .not-found-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 12px;
  }
  
  .not-found-text {
    font-size: 14px;
    color: #999;
    margin-bottom: 24px;
  }
}
</style>