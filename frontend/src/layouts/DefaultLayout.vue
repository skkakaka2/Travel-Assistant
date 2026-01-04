<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent, NButton, NIcon, NDropdown, NAvatar, NSpace } from "naive-ui";
import { SunnyOutline, MoonOutline, PersonCircleOutline, LogOutOutline, SettingsOutline } from "@vicons/ionicons5";
import { useThemeStore, useAuthStore } from "@/stores";
import { useRouter } from "vue-router";

const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();

const userOptions = [
  {
    label: "Settings",
    key: "settings",
    icon: () => h(NIcon, null, { default: () => h(SettingsOutline) }),
  },
  {
    type: "divider",
    key: "d1",
  },
  {
    label: "Logout",
    key: "logout",
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }),
  },
];

function handleUserAction(key: string) {
  if (key === "settings") {
    router.push("/settings");
  } else if (key === "logout") {
    authStore.logout();
    router.push("/login");
  }
}
</script>

<template>
  <NLayout class="layout">
    <NLayoutHeader class="header glass" bordered>
      <div class="header-content container">
        <RouterLink to="/trips" class="logo">
          <span class="logo-icon">🌍</span>
          <span class="logo-text gradient-text">Travel Assistant</span>
        </RouterLink>

        <NSpace align="center" :size="12">
          <NButton quaternary circle @click="themeStore.toggleTheme">
            <template #icon>
              <NIcon :size="20">
                <MoonOutline v-if="!themeStore.isDark" />
                <SunnyOutline v-else />
              </NIcon>
            </template>
          </NButton>

          <NDropdown :options="userOptions" @select="handleUserAction">
            <NButton quaternary circle>
              <template #icon>
                <NIcon :size="20">
                  <PersonCircleOutline />
                </NIcon>
              </template>
            </NButton>
          </NDropdown>
        </NSpace>
      </div>
    </NLayoutHeader>

    <NLayoutContent class="content">
      <div class="page-container container">
        <router-view />
      </div>
    </NLayoutContent>
  </NLayout>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--bg-color);
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-weight: 700;
}

.content {
  padding-top: var(--spacing-lg);
  /* padding-bottom: var(--spacing-xl); */
  height: calc(100vh - var(--header-height));
}

.page-container {
  animation: slideUp 0.3s ease;
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }
}
</style>
