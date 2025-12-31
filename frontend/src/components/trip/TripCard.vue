<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NSpace, NTag, NIcon, NButton, NPopconfirm } from 'naive-ui'
import { CalendarOutline, PeopleOutline, WalletOutline, TrashOutline, CreateOutline } from '@vicons/ionicons5'
import type { Trip } from '@/types/api'
import { formatDate, getDaysDiff, isFuture, isPast } from '@/utils/date'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  (e: 'edit', trip: Trip): void
  (e: 'delete', id: number): void
  (e: 'click', trip: Trip): void
}>()

const duration = computed(() => getDaysDiff(props.trip.startDate, props.trip.endDate))

const status = computed(() => {
  if (isFuture(props.trip.startDate)) return { label: 'Upcoming', type: 'info' as const }
  if (isPast(props.trip.endDate)) return { label: 'Completed', type: 'success' as const }
  return { label: 'In Progress', type: 'warning' as const }
})
</script>

<template>
  <NCard
    class="trip-card"
    hoverable
    @click="emit('click', trip)"
  >
    <div class="trip-header">
      <h3 class="trip-name">{{ trip.name }}</h3>
      <NTag :type="status.type" size="small" round>
        {{ status.label }}
      </NTag>
    </div>

    <p v-if="trip.description" class="trip-description">
      {{ trip.description }}
    </p>

    <div class="trip-meta">
      <div class="meta-item">
        <NIcon :size="16"><CalendarOutline /></NIcon>
        <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
      </div>
      <div class="meta-item">
        <NIcon :size="16"><PeopleOutline /></NIcon>
        <span>{{ trip.userCount }} travelers</span>
      </div>
      <div class="meta-item">
        <NIcon :size="16"><WalletOutline /></NIcon>
        <span>{{ formatCurrency(trip.budget) }}</span>
      </div>
    </div>

    <div class="trip-footer">
      <NTag type="primary" size="small">
        {{ duration }} days
      </NTag>

      <NSpace :size="4">
        <NButton
          quaternary
          circle
          size="small"
          @click.stop="emit('edit', trip)"
        >
          <template #icon>
            <NIcon><CreateOutline /></NIcon>
          </template>
        </NButton>
        <NPopconfirm
          @positive-click="emit('delete', trip.id)"
        >
          <template #trigger>
            <NButton
              quaternary
              circle
              size="small"
              @click.stop
            >
              <template #icon>
                <NIcon><TrashOutline /></NIcon>
              </template>
            </NButton>
          </template>
          Are you sure you want to delete this trip?
        </NPopconfirm>
      </NSpace>
    </div>
  </NCard>
</template>

<style scoped>
.trip-card {
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}

.trip-card:hover {
  transform: translateY(-4px);
}

.trip-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing);
  margin-bottom: var(--spacing);
}

.trip-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
}

.trip-description {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.trip-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.trip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing);
  border-top: 1px solid var(--border-color);
}
</style>

