<script setup lang="ts">
import { computed } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  darkTheme,
  type GlobalThemeOverrides,
} from 'naive-ui'
import { useThemeStore } from '@/stores'

const themeStore = useThemeStore()

const theme = computed(() => (themeStore.isDark ? darkTheme : null))

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0ea5e9',
    primaryColorHover: '#0284c7',
    primaryColorPressed: '#0369a1',
    primaryColorSuppl: '#0ea5e9',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusLarge: '10px',
  },
  Card: {
    borderRadius: '12px',
  },
  Input: {
    borderRadius: '8px',
  },
  Tag: {
    borderRadius: '6px',
  },
}
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NLoadingBarProvider>
      <NMessageProvider>
        <NDialogProvider>
          <NNotificationProvider>
            <RouterView />
          </NNotificationProvider>
        </NDialogProvider>
      </NMessageProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<style>
@import '@/assets/styles/global.css';
</style>
