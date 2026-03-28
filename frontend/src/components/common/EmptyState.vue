<script setup lang="ts">
defineProps<{
  icon?: string
  text?: string
  showButton?: boolean
  buttonText?: string
}>()

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon || '📭' }}</div>
    <div class="empty-text">{{ text || '暂无数据' }}</div>
    <el-button
      v-if="showButton"
      type="primary"
      round
      @click="emit('action')"
    >
      {{ buttonText || '立即添加' }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  .empty-text {
    font-size: 16px;
    color: #999;
    margin-bottom: 20px;
  }
}
</style>