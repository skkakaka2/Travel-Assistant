<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NIcon,
  NSpace,
  NCard,
  NTag,
  NSpin,
  NTimeline,
  NTimelineItem,
  NEmpty,
  NPopconfirm,
  useMessage,
} from 'naive-ui'
import {
  ArrowBackOutline,
  AddOutline,
  CalendarOutline,
  PeopleOutline,
  WalletOutline,
  CreateOutline,
  TrashOutline,
} from '@vicons/ionicons5'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import TripForm from '@/components/trip/TripForm.vue'
import { useTripStore } from '@/stores'
import { tripApi, dayPlanApi } from '@/api'
import type { Trip, DayPlan, CreateDayPlanDto, UpdateTripDto } from '@/types/api'
import { formatDate, getDaysDiff, getDayOfWeek, dayjs } from '@/utils/date'
import { formatCurrency } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const tripStore = useTripStore()

const tripId = computed(() => Number(route.params.id))
const loading = ref(true)
const trip = ref<Trip | null>(null)
const dayPlans = ref<DayPlan[]>([])
const showEditForm = ref(false)

onMounted(() => {
  loadTrip()
})

async function loadTrip() {
  loading.value = true
  try {
    const response = await tripApi.getById(tripId.value)
    trip.value = response.data.data
    dayPlans.value = trip.value.dayPlans || []
  } catch (error) {
    message.error('Failed to load trip')
    router.push('/trips')
  } finally {
    loading.value = false
  }
}

async function handleUpdateTrip(data: UpdateTripDto) {
  try {
    await tripStore.updateTrip(tripId.value, data)
    message.success('Trip updated successfully')
    loadTrip()
  } catch (error) {
    message.error('Failed to update trip')
  }
}

async function handleDeleteTrip() {
  try {
    await tripStore.deleteTrip(tripId.value)
    message.success('Trip deleted successfully')
    router.push('/trips')
  } catch (error) {
    message.error('Failed to delete trip')
  }
}

async function handleAddDayPlan() {
  if (!trip.value) return

  // Find the next available date
  const existingDates = new Set(dayPlans.value.map((dp) => dp.date))
  let nextDate = dayjs(trip.value.startDate)
  const endDate = dayjs(trip.value.endDate)

  while (nextDate.isBefore(endDate) || nextDate.isSame(endDate)) {
    const dateStr = nextDate.format('YYYY-MM-DD')
    if (!existingDates.has(dateStr)) {
      break
    }
    nextDate = nextDate.add(1, 'day')
  }

  if (nextDate.isAfter(endDate)) {
    message.warning('All dates in the trip range already have day plans')
    return
  }

  const newDayPlan: CreateDayPlanDto = {
    tripId: tripId.value,
    date: nextDate.format('YYYY-MM-DD'),
    dayNumber: dayPlans.value.length + 1,
  }

  try {
    await dayPlanApi.create(newDayPlan)
    message.success('Day plan added')
    loadTrip()
  } catch (error) {
    message.error('Failed to add day plan')
  }
}

async function handleDeleteDayPlan(id: number) {
  try {
    await dayPlanApi.delete(id)
    message.success('Day plan deleted')
    loadTrip()
  } catch (error) {
    message.error('Failed to delete day plan')
  }
}

function goToDayPlan(dayPlan: DayPlan) {
  router.push(`/trips/${tripId.value}/day/${dayPlan.id}`)
}

const duration = computed(() => {
  if (!trip.value) return 0
  return getDaysDiff(trip.value.startDate, trip.value.endDate)
})
</script>

<template>
  <DefaultLayout>
    <NSpin :show="loading">
      <div v-if="trip" class="trip-detail">
        <header class="page-header">
          <NButton quaternary @click="router.push('/trips')">
            <template #icon>
              <NIcon><ArrowBackOutline /></NIcon>
            </template>
            Back to Trips
          </NButton>

          <NSpace>
            <NButton @click="showEditForm = true">
              <template #icon>
                <NIcon><CreateOutline /></NIcon>
              </template>
              Edit
            </NButton>
            <NPopconfirm @positive-click="handleDeleteTrip">
              <template #trigger>
                <NButton type="error">
                  <template #icon>
                    <NIcon><TrashOutline /></NIcon>
                  </template>
                  Delete
                </NButton>
              </template>
              Are you sure you want to delete this trip?
            </NPopconfirm>
          </NSpace>
        </header>

        <NCard class="trip-info-card">
          <h1 class="trip-title">{{ trip.name }}</h1>
          <p v-if="trip.description" class="trip-description">
            {{ trip.description }}
          </p>

          <div class="trip-meta">
            <div class="meta-item">
              <NIcon :size="18"><CalendarOutline /></NIcon>
              <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
              <NTag type="primary" size="small">{{ duration }} days</NTag>
            </div>
            <div class="meta-item">
              <NIcon :size="18"><PeopleOutline /></NIcon>
              <span>{{ trip.userCount }} travelers</span>
            </div>
            <div class="meta-item">
              <NIcon :size="18"><WalletOutline /></NIcon>
              <span>{{ formatCurrency(trip.budget) }} budget</span>
            </div>
          </div>
        </NCard>

        <section class="timeline-section">
          <div class="section-header">
            <h2 class="section-title">Itinerary</h2>
            <NButton type="primary" @click="handleAddDayPlan">
              <template #icon>
                <NIcon><AddOutline /></NIcon>
              </template>
              Add Day
            </NButton>
          </div>

          <NTimeline v-if="dayPlans.length > 0" class="day-timeline">
            <NTimelineItem
              v-for="dayPlan in dayPlans"
              :key="dayPlan.id"
              type="success"
            >
              <template #header>
                <div class="timeline-header" @click="goToDayPlan(dayPlan)">
                  <span class="day-number">Day {{ dayPlan.dayNumber }}</span>
                  <span class="day-date">
                    {{ formatDate(dayPlan.date) }} ({{ getDayOfWeek(dayPlan.date) }})
                  </span>
                </div>
              </template>

              <NCard class="day-card" hoverable @click="goToDayPlan(dayPlan)">
                <div class="day-card-content">
                  <div class="day-info">
                    <p v-if="dayPlan.notes" class="day-notes">{{ dayPlan.notes }}</p>
                    <p v-else class="day-notes-empty">No notes for this day</p>
                  </div>
                  <NSpace>
                    <NButton
                      quaternary
                      circle
                      size="small"
                      @click.stop="goToDayPlan(dayPlan)"
                    >
                      <template #icon>
                        <NIcon><CreateOutline /></NIcon>
                      </template>
                    </NButton>
                    <NPopconfirm @positive-click="handleDeleteDayPlan(dayPlan.id)">
                      <template #trigger>
                        <NButton quaternary circle size="small" @click.stop>
                          <template #icon>
                            <NIcon><TrashOutline /></NIcon>
                          </template>
                        </NButton>
                      </template>
                      Delete this day plan?
                    </NPopconfirm>
                  </NSpace>
                </div>
              </NCard>
            </NTimelineItem>
          </NTimeline>

          <NEmpty v-else description="No day plans yet. Add your first day!">
            <template #extra>
              <NButton type="primary" @click="handleAddDayPlan">
                <template #icon>
                  <NIcon><AddOutline /></NIcon>
                </template>
                Add First Day
              </NButton>
            </template>
          </NEmpty>
        </section>

        <TripForm
          v-model:show="showEditForm"
          :trip="trip"
          @submit="handleUpdateTrip"
        />
      </div>
    </NSpin>
  </DefaultLayout>
</template>

<style scoped>
.trip-detail {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.trip-info-card {
  margin-bottom: var(--spacing-xl);
}

.trip-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing);
}

.trip-description {
  color: var(--text-color-secondary);
  margin-bottom: var(--spacing-md);
}

.trip-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color-secondary);
}

.timeline-section {
  margin-top: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.day-timeline {
  padding-left: var(--spacing);
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  cursor: pointer;
}

.day-number {
  font-weight: 600;
  color: var(--primary-color);
}

.day-date {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.day-card {
  cursor: pointer;
  margin-top: var(--spacing-sm);
}

.day-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.day-notes {
  margin: 0;
  color: var(--text-color);
}

.day-notes-empty {
  margin: 0;
  color: var(--text-color-tertiary);
  font-style: italic;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing);
  }

  .trip-meta {
    flex-direction: column;
    gap: var(--spacing);
  }
}
</style>

