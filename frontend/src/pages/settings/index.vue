<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
  NSpin,
  NIcon,
  NAvatar,
  NDivider,
  useMessage,
  FormInst,
} from "naive-ui";
import { ArrowBackOutline, HomeOutline, PersonOutline, LocationOutline } from "@vicons/ionicons5";
import BaiduMapPicker from "@/components/map/BaiduMapPicker.vue";
import { userApi } from "@/api";
import type { User, SetHomeDto } from "@/types/api";

const router = useRouter();
const message = useMessage();

const loading = ref(true);
const saving = ref(false);
const user = ref<User | null>(null);
const formRef = ref<FormInst | null>(null);

// 表单数据
const formData = ref({
  name: "",
  homeAddress: "",
  homeLatitude: undefined as string | undefined,
  homeLongitude: undefined as string | undefined,
});

// 加载用户信息
async function loadUser() {
  loading.value = true;
  try {
    const response = await userApi.getCurrentUser();
    user.value = response.data.data;

    // 填充表单
    formData.value = {
      name: user.value.name || "",
      homeAddress: user.value.homeAddress || "",
      homeLatitude: user.value.homeLatitude ? user.value.homeLatitude.toString() : undefined,
      homeLongitude: user.value.homeLongitude ? user.value.homeLongitude.toString() : undefined,
    };
  } catch (error) {
    message.error("加载用户信息失败");
  } finally {
    loading.value = false;
  }
}

// 保存设置
async function handleSave() {
  if (!user.value) return;

  saving.value = true;
  try {
    const homeData: SetHomeDto = {
      homeAddress: formData.value.homeAddress || undefined,
      homeLatitude: formData.value.homeLatitude ? formData.value.homeLatitude.toString() : undefined,
      homeLongitude: formData.value.homeLongitude ? formData.value.homeLongitude.toString() : undefined,
    };

    await userApi.setHome(homeData);
    message.success("设置保存成功");

    // 重新加载用户信息
    await loadUser();
  } catch (error) {
    message.error("保存设置失败");
  } finally {
    saving.value = false;
  }
}

// 处理地图选点
function handleLocationSelected(data: { latitude: number; longitude: number; address: string }) {
  formData.value.homeLatitude = data.latitude.toString();
  formData.value.homeLongitude = data.longitude.toString();
  if (!formData.value.homeAddress) {
    formData.value.homeAddress = data.address;
  }
}

// 清除家地址
function clearHomeLocation() {
  formData.value.homeAddress = "";
  formData.value.homeLatitude = undefined;
  formData.value.homeLongitude = undefined;
}

// 用户头像显示
const avatarText = computed(() => {
  if (user.value?.name) {
    return user.value.name.charAt(0).toUpperCase();
  }
  if (user.value?.username) {
    return user.value.username.charAt(0).toUpperCase();
  }
  return "U";
});

onMounted(() => {
  loadUser();
});
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <NButton quaternary @click="router.push('/trips')">
        <template #icon>
          <NIcon><ArrowBackOutline /></NIcon>
        </template>
        返回
      </NButton>
      <h1 class="page-title">设置</h1>
    </header>

    <NSpin :show="loading">
      <div v-if="user" class="settings-content">
        <!-- 用户信息卡片 -->
        <NCard class="user-info-card">
          <div class="user-profile">
            <NAvatar :size="80" round :style="{ backgroundColor: 'var(--primary-color)' }">
              {{ avatarText }}
            </NAvatar>
            <div class="user-details">
              <h2 class="user-name">{{ user.name || user.username }}</h2>
              <p class="user-email">{{ user.email }}</p>
              <p class="user-username">@{{ user.username }}</p>
            </div>
          </div>
        </NCard>

        <!-- 家地址设置 -->
        <NCard class="home-settings-card">
          <template #header>
            <div class="card-header">
              <NIcon :size="20"><HomeOutline /></NIcon>
              <span>家庭位置</span>
            </div>
          </template>

          <div class="home-form-container">
            <!-- 左侧表单 -->
            <div class="form-section">
              <NForm ref="formRef" :model="formData" label-placement="top">
                <NFormItem label="家庭地址">
                  <NInput
                    v-model:value="formData.homeAddress"
                    placeholder="请输入您的家庭地址"
                    type="textarea"
                    :rows="2"
                  />
                </NFormItem>

                <NSpace vertical :size="8">
                  <div class="coordinates-display">
                    <NIcon :size="16"><LocationOutline /></NIcon>
                    <span v-if="formData.homeLatitude && formData.homeLongitude">
                      {{ formData.homeLatitude }}, {{ formData.homeLongitude }}
                    </span>
                    <span v-else class="no-location">未选择位置</span>
                  </div>
                </NSpace>

                <NDivider />

                <NSpace>
                  <NButton type="primary" :loading="saving" @click="handleSave"> 保存设置 </NButton>
                  <NButton @click="clearHomeLocation"> 清除位置 </NButton>
                </NSpace>
              </NForm>

              <div class="tip-text">
                <p>💡 设置您的家庭位置有助于计算旅行距离并更高效地规划路线。</p>
              </div>
            </div>

            <!-- 右侧地图 -->
            <div class="map-section">
              <BaiduMapPicker
                v-model:latitude="formData.homeLatitude"
                v-model:longitude="formData.homeLongitude"
                :address="formData.homeAddress"
                @location-selected="handleLocationSelected"
              />
            </div>
          </div>
        </NCard>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* 用户信息卡片 */
.user-info-card {
  margin-bottom: var(--spacing-xs);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.user-email {
  color: var(--text-color-secondary);
  margin: 0 0 2px 0;
}

.user-username {
  color: var(--text-color-tertiary);
  font-size: 0.875rem;
  margin: 0;
}

/* 家地址设置卡片 */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
}

.home-form-container {
  display: flex;
  gap: var(--spacing-xl);
  min-height: 400px;
}

.form-section {
  flex: 1;
  min-width: 280px;
  max-width: 350px;
}

.map-section {
  flex: 2;
  min-width: 400px;
  min-height: 400px;
}

.coordinates-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing);
  background: var(--card-color, #f5f5f5);
  border-radius: 6px;
  font-size: 0.875rem;
}

.no-location {
  color: var(--text-color-tertiary);
  font-style: italic;
}

.tip-text {
  margin-top: var(--spacing-lg);
  padding: var(--spacing);
  background: var(--info-color-suppl, #e8f4fd);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.tip-text p {
  margin: 0;
}

/* 响应式布局 */
@media (max-width: 900px) {
  .home-form-container {
    flex-direction: column;
  }

  .form-section {
    max-width: 100%;
  }

  .map-section {
    min-width: 100%;
    min-height: 350px;
  }
}

@media (max-width: 600px) {
  .user-profile {
    flex-direction: column;
    text-align: center;
  }
}
</style>
