<script setup lang="ts">
import { NCard, NIcon, NTag, NButton, NSpace, NPopconfirm } from 'naive-ui'
import { CreateOutline, TrashOutline, TimeOutline, LocationOutline, CashOutline, NavigateOutline, HourglassOutline } from '@vicons/ionicons5'
import type { DayPlanItem } from '@/types/api'
import { getItemTypeIcon, getItemTypeLabel, getItemTypeColor, formatCurrency, formatDistance, formatDuration } from '@/utils/format'

const props = defineProps<{
  item: DayPlanItem
}>()

const emit = defineEmits<{
  (e: 'edit', item: DayPlanItem): void
  (e: 'delete', id: number): void
}>()
</script>

<template>
  <NCard class="item-card" size="small">
    <div class="item-content">
      <div class="item-icon" :style="{ backgroundColor: getItemTypeColor(item.type) + '20', color: getItemTypeColor(item.type) }">
        {{ getItemTypeIcon(item.type) }}
      </div>

      <div class="item-info">
        <div class="item-header">
          <h4 class="item-name">{{ item.name }}</h4>
          <NTag :color="{ color: getItemTypeColor(item.type) + '20', textColor: getItemTypeColor(item.type) }" size="small">
            {{ getItemTypeLabel(item.type) }}
          </NTag>
        </div>

        <div class="item-meta">
          <span v-if="item.startTime || item.endTime" class="meta-item">
            <NIcon :size="14"><TimeOutline /></NIcon>
            {{ item.startTime || '--:--' }} - {{ item.endTime || '--:--' }}
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
          Delete this item?
        </NPopconfirm>
      </NSpace>
    </div>
  </NCard>
</template>

<style scoped>
.item-card {
  transition: transform var(--transition), box-shadow var(--transition);
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

@media (max-width: 480px) {
  .item-content {
    flex-wrap: wrap;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

