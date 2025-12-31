<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5'
import { useThemeStore } from '@/stores'

const themeStore = useThemeStore()
</script>

<template>
  <div class="auth-layout">
    <div class="auth-background">
      <div class="auth-pattern"></div>
    </div>

    <NButton
      class="theme-toggle"
      quaternary
      circle
      @click="themeStore.toggleTheme"
    >
      <template #icon>
        <NIcon :size="20">
          <MoonOutline v-if="!themeStore.isDark" />
          <SunnyOutline v-else />
        </NIcon>
      </template>
    </NButton>

    <div class="auth-container">
      <div class="auth-card glass">
        <div class="auth-header">
          <span class="auth-logo">🌍</span>
          <h1 class="auth-title gradient-text">Travel Assistant</h1>
          <p class="auth-subtitle">Plan your perfect journey</p>
        </div>

        <div class="auth-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  inset: 0;
  background: var(--primary-gradient);
  opacity: 0.1;
}

.auth-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, var(--primary-color) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, var(--secondary-color) 2px, transparent 2px);
  background-size: 60px 60px;
  opacity: 0.3;
}

.theme-toggle {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 10;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.4s ease;
}

.auth-card {
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-xl);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.auth-logo {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--spacing);
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.auth-subtitle {
  color: var(--text-color-secondary);
  font-size: 0.95rem;
}

.auth-content {
  margin-top: var(--spacing-lg);
}

@media (max-width: 480px) {
  .auth-card {
    padding: var(--spacing-lg);
  }
}
</style>

