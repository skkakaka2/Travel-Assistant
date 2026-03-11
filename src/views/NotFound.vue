<script setup lang="ts">
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/home')">
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
  height: 100vh;
  background-color: #f2f3f5;

  h1 {
    font-size: 120px;
    margin: 0;
    color: #909399;
  }

  p {
    font-size: 24px;
    color: #606266;
    margin: 20px 0;
  }
}
</style>