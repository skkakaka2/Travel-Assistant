<script setup lang="ts">
import { ref, computed } from "vue";
import {
  NCard,
  NIcon,
  NTag,
  NButton,
  NSpace,
  NPopconfirm,
  NUpload,
  NImage,
  NImageGroup,
  useMessage,
  type UploadFileInfo,
} from "naive-ui";
import {
  CreateOutline,
  TrashOutline,
  TimeOutline,
  LocationOutline,
  CashOutline,
  NavigateOutline,
  HourglassOutline,
  ImagesOutline,
  AddOutline,
} from "@vicons/ionicons5";
import type { DayPlanItem } from "@/types/api";
import {
  getItemTypeIcon,
  getItemTypeLabel,
  getItemTypeColor,
  formatCurrency,
  formatDistance,
  formatDuration,
} from "@/utils/format";
import { uploadApi } from "@/api";

const props = defineProps<{
  item: DayPlanItem;
}>();

const emit = defineEmits<{
  (e: "edit", item: DayPlanItem): void;
  (e: "delete", id: number): void;
  (e: "refresh"): void;
}>();

const message = useMessage();
const uploading = ref(false);

// 图片列表
const imageList = computed(() => props.item.imgList || []);

// 获取图片完整 URL（静态文件服务）
function getImageUrl(filename: string): string {
  // 后端静态文件服务地址
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/uploads/${filename}`;
}

// 自定义上传处理
async function handleUpload({ file }: { file: UploadFileInfo }) {
  if (!file.file) return;

  uploading.value = true;
  try {
    const result = await uploadApi.uploadImage(props.item.id, file.file);
    if (result.data.code === 200) {
      message.success("图片上传成功");
      emit("refresh");
    } else {
      message.error(result.data.message || "上传失败");
    }
  } catch (error: any) {
    message.error(error.message || "上传失败");
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <NCard class="item-card" size="small">
    <div class="item-content">
      <div
        class="item-icon"
        :style="{ backgroundColor: getItemTypeColor(item.type) + '20', color: getItemTypeColor(item.type) }"
      >
        {{ getItemTypeIcon(item.type) }}
      </div>

      <div class="item-info">
        <div class="item-header">
          <h4 class="item-name">{{ item.name }}</h4>
          <NTag
            :color="{ color: getItemTypeColor(item.type) + '20', textColor: getItemTypeColor(item.type) }"
            size="small"
          >
            {{ getItemTypeLabel(item.type) }}
          </NTag>
        </div>

        <div class="item-meta">
          <span v-if="item.startTime || item.endTime" class="meta-item">
            <NIcon :size="14"><TimeOutline /></NIcon>
            {{ item.startTime || "--:--" }} - {{ item.endTime || "--:--" }}
          </span>
          <span v-if="item.address" class="meta-item">
            <NIcon :size="14"><LocationOutline /></NIcon>
            {{ item.address }}
          </span>
          <span v-if="item.distance && item.distance > 0" class="meta-item">
            <NIcon :size="14"><NavigateOutline /></NIcon>
            {{ formatDistance(item.distance) }}
          </span>
          <span v-if="item.duration && item.duration > 0" class="meta-item">
            <NIcon :size="14"><HourglassOutline /></NIcon>
            {{ formatDuration(item.duration) }}
          </span>
          <span v-if="item.cost" class="meta-item">
            <NIcon :size="14"><CashOutline /></NIcon>
            {{ formatCurrency(item.cost) }}
          </span>
        </div>

        <p v-if="item.notes" class="item-notes">{{ item.notes }}</p>

        <!-- 照片墙区域 -->
        <div class="photo-wall">
          <!-- 已上传的图片展示 -->
          <NImageGroup v-if="imageList.length > 0">
            <div class="photo-grid">
              <div v-for="(img, index) in imageList" :key="index" class="photo-item">
                <NImage
                  :src="getImageUrl(img)"
                  :alt="`Photo ${index + 1}`"
                  object-fit="cover"
                  width="80"
                  height="80"
                  lazy
                />
              </div>
            </div>
          </NImageGroup>

          <!-- 上传按钮 -->
          <NUpload
            :custom-request="handleUpload"
            accept="image/*"
            :show-file-list="false"
            :disabled="uploading"
            multiple
          >
            <div class="upload-trigger">
              <NIcon :size="20" v-if="!uploading"><AddOutline /></NIcon>
              <span v-if="uploading">上传中...</span>
              <span v-else-if="imageList.length === 0">添加照片</span>
              <span v-else>+</span>
            </div>
          </NUpload>
        </div>
      </div>

      <NSpace class="item-actions" :size="4">
        <NButton quaternary circle size="small" @click="emit('edit', item)">
          <template #icon>
            <NIcon :size="16"><CreateOutline /></NIcon>
          </template>
        </NButton>
        <NPopconfirm @positive-click="emit('delete', item.id)">
          <template #trigger>
            <NButton quaternary circle size="small">
              <template #icon>
                <NIcon :size="16"><TrashOutline /></NIcon>
              </template>
            </NButton>
          </template>
          删除此项目？
        </NPopconfirm>
      </NSpace>
    </div>
  </NCard>
</template>

<style scoped>
.item-card {
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.item-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.item-content {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

.item-notes {
  margin: var(--spacing-xs) 0 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.item-actions {
  flex-shrink: 0;
}

/* 照片墙样式 */
.photo-wall {
  margin-top: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
  align-items: flex-start;
}

.photo-grid {
  display: flex;
  gap: var(--spacing-xs);
}

.photo-item {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm, 6px);
  overflow: hidden;
  border: 1px solid var(--border-color, #e0e0e0);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.photo-item:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

.photo-item :deep(.n-image) {
  width: 100%;
  height: 100%;
}

.photo-item :deep(.n-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-trigger {
  width: 80px;
  height: 80px;
  border: 2px dashed var(--border-color, #d9d9d9);
  border-radius: var(--radius-sm, 6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: var(--text-color-secondary);
  font-size: 0.75rem;
  transition:
    border-color 0.2s,
    color 0.2s,
    background-color 0.2s;
  background-color: var(--bg-color-light, #fafafa);
}

.upload-trigger:hover {
  border-color: var(--primary-color, #18a058);
  color: var(--primary-color, #18a058);
  background-color: var(--primary-color-hover-bg, #f0fdf4);
}

@media (max-width: 480px) {
  .item-content {
    flex-wrap: wrap;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .photo-item,
  .upload-trigger {
    width: 60px;
    height: 60px;
  }
}
</style>
