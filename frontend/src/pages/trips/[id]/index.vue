<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
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
} from "naive-ui";
import {
  ArrowBackOutline,
  AddOutline,
  CalendarOutline,
  PeopleOutline,
  WalletOutline,
  CreateOutline,
  TrashOutline,
  BedOutline,
  LocationOutline,
  RestaurantOutline,
  CarOutline,
  GameControllerOutline,
  EllipsisHorizontalOutline,
  TimeOutline,
  NavigateOutline,
  HourglassOutline,
} from "@vicons/ionicons5";
import TripForm from "@/components/trip/TripForm.vue";
import { useTripStore } from "@/stores";
import { tripApi, dayPlanApi } from "@/api";
import type { Trip, DayPlan, CreateDayPlanDto, UpdateTripDto, DayPlanItem } from "@/types/api";
import { PlanItemType } from "@/types/api";
import { formatDate, getDaysDiff, getDayOfWeek, dayjs } from "@/utils/date";
import { formatCurrency, formatDistance, formatDuration } from "@/utils/format";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const tripStore = useTripStore();

const tripId = computed(() => Number(route.params.id));
const loading = ref(true);
const trip = ref<Trip | null>(null);
const dayPlans = ref<DayPlan[]>([]);
const showEditForm = ref(false);

onMounted(() => {
  loadTrip();
});

async function loadTrip() {
  loading.value = true;
  try {
    const response = await tripApi.getById(tripId.value);
    trip.value = response.data.data;
    dayPlans.value = trip.value.dayPlans || [];
  } catch (error) {
    message.error("加载行程失败");
    router.push("/trips");
  } finally {
    loading.value = false;
  }
}

async function handleUpdateTrip(data: UpdateTripDto) {
  try {
    await tripStore.updateTrip(tripId.value, data);
    message.success("行程更新成功");
    loadTrip();
  } catch (error) {
    message.error("更新行程失败");
  }
}

async function handleDeleteTrip() {
  try {
    await tripStore.deleteTrip(tripId.value);
    message.success("行程删除成功");
    router.push("/trips");
  } catch (error) {
    message.error("删除行程失败");
  }
}

async function handleAddDayPlan() {
  if (!trip.value) return;

  const existingDates = new Set(dayPlans.value.map((dp) => dp.date));
  let nextDate = dayjs(trip.value.startDate);
  const endDate = dayjs(trip.value.endDate);

  while (nextDate.isBefore(endDate) || nextDate.isSame(endDate)) {
    const dateStr = nextDate.format("YYYY-MM-DD");
    if (!existingDates.has(dateStr)) {
      break;
    }
    nextDate = nextDate.add(1, "day");
  }

  if (nextDate.isAfter(endDate)) {
    message.warning("行程范围内的所有日期都已创建日期计划");
    return;
  }

  const newDayPlan: CreateDayPlanDto = {
    tripId: tripId.value,
    date: nextDate.format("YYYY-MM-DD"),
    dayNumber: dayPlans.value.length + 1,
  };

  try {
    const result = await dayPlanApi.create(newDayPlan);
    if (result.data.code === 200) {
      message.success("日期计划已添加");
      loadTrip();
    } else {
      message.error(result.data.message);
    }
  } catch (error: any) {
    message.error(error.message);
  }
}

async function handleDeleteDayPlan(id: number) {
  try {
    await dayPlanApi.delete(id);
    message.success("日期计划已删除");
    loadTrip();
  } catch (error) {
    message.error("删除日期计划失败");
  }
}

function goToDayPlan(dayPlan: DayPlan) {
  router.push(`/trips/${tripId.value}/day/${dayPlan.id}`);
}

const duration = computed(() => {
  if (!trip.value) return 0;
  return getDaysDiff(trip.value.startDate, trip.value.endDate);
});

// 获取类型对应的图标组件
const typeIconMap = {
  [PlanItemType.HOTEL]: BedOutline,
  [PlanItemType.ATTRACTION]: LocationOutline,
  [PlanItemType.RESTAURANT]: RestaurantOutline,
  [PlanItemType.TRANSPORT]: CarOutline,
  [PlanItemType.ACTIVITY]: GameControllerOutline,
  [PlanItemType.OTHER]: EllipsisHorizontalOutline,
};

// 获取类型对应的中文名称
const typeNameMap = {
  [PlanItemType.HOTEL]: "住宿",
  [PlanItemType.ATTRACTION]: "景点",
  [PlanItemType.RESTAURANT]: "餐饮",
  [PlanItemType.TRANSPORT]: "交通",
  [PlanItemType.ACTIVITY]: "活动",
  [PlanItemType.OTHER]: "其他",
};

// 获取类型对应的标签类型
const typeTagMap: Record<PlanItemType, "default" | "success" | "warning" | "error" | "info"> = {
  [PlanItemType.HOTEL]: "info",
  [PlanItemType.ATTRACTION]: "success",
  [PlanItemType.RESTAURANT]: "warning",
  [PlanItemType.TRANSPORT]: "default",
  [PlanItemType.ACTIVITY]: "error",
  [PlanItemType.OTHER]: "default",
};

function getTypeIcon(type: PlanItemType) {
  return typeIconMap[type] || EllipsisHorizontalOutline;
}

function getTypeName(type: PlanItemType) {
  return typeNameMap[type] || "其他";
}

function getTypeTagType(type: PlanItemType) {
  return typeTagMap[type] || "default";
}
</script>

<template>
  <NSpin :show="loading">
    <div v-if="trip" class="trip-detail">
      <header class="page-header">
        <NButton quaternary @click="router.push('/trips')">
          <template #icon>
            <NIcon><ArrowBackOutline /></NIcon>
          </template>
          返回行程列表
        </NButton>

        <NSpace>
          <NButton @click="showEditForm = true">
            <template #icon>
              <NIcon><CreateOutline /></NIcon>
            </template>
            编辑
          </NButton>
          <NPopconfirm @positive-click="handleDeleteTrip">
            <template #trigger>
              <NButton type="error">
                <template #icon>
                  <NIcon><TrashOutline /></NIcon>
                </template>
                删除
              </NButton>
            </template>
            您确定要删除此行程吗？
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
            <NTag type="primary" size="small">{{ duration }} 天</NTag>
          </div>
          <div class="meta-item">
            <NIcon :size="18"><PeopleOutline /></NIcon>
            <span>{{ trip.userCount }} 人</span>
          </div>
          <div class="meta-item">
            <NIcon :size="18"><WalletOutline /></NIcon>
            <span>{{ formatCurrency(trip.budget) }} 预算</span>
          </div>
        </div>
      </NCard>

      <section class="timeline-section">
        <div class="section-header">
          <h2 class="section-title">行程安排</h2>
          <NButton type="primary" @click="handleAddDayPlan">
            <template #icon>
              <NIcon><AddOutline /></NIcon>
            </template>
            添加日期
          </NButton>
        </div>

        <NTimeline v-if="dayPlans.length > 0" class="day-timeline">
          <NTimelineItem v-for="(dayPlan, dayPlanIndex) in dayPlans" :key="dayPlan.id" type="success">
            <template #header>
              <div class="timeline-header" @click="goToDayPlan(dayPlan)">
                <span class="day-number">第 {{ dayPlan.dayNumber }} 天</span>
                <span class="day-date"> {{ formatDate(dayPlan.date) }} ({{ getDayOfWeek(dayPlan.date) }}) </span>
              </div>
            </template>

            <NCard class="day-card" hoverable @click="goToDayPlan(dayPlan)">
              <div class="day-card-content">
                <div class="day-info">
                  <!-- 备注信息 -->
                  <!-- <p v-if="dayPlan.notes" class="day-notes">{{ dayPlan.notes }}</p> -->

                  <!-- 行程项目列表 -->
                  <div v-if="dayPlan.dayPlanItems && dayPlan.dayPlanItems.length > 0" class="day-items">
                    <div v-for="item in dayPlan.dayPlanItems" :key="item.id" class="day-item">
                      <NTag :type="getTypeTagType(item.type)" size="small" round>
                        <template #icon>
                          <NIcon :component="getTypeIcon(item.type)" />
                        </template>
                        {{ getTypeName(item.type) }}
                      </NTag>
                      <span class="item-name">{{ item.name }}</span>
                      <span v-if="item.startTime" class="item-time">
                        <NIcon :size="12"><TimeOutline /></NIcon>
                        {{ item.startTime }}
                        <template v-if="item.endTime">- {{ item.endTime }}</template>
                      </span>
                    </div>
                  </div>

                  <!-- 没有行程项目时的提示 -->
                  <p v-else class="day-notes-empty">尚未计划活动</p>

                  <!-- 汇总信息：里程和时间 -->
                  <div v-if="dayPlan.distance || dayPlan.duration" class="day-summary">
                    <span v-if="dayPlan.distance && dayPlan.distance > 0" class="summary-item">
                      <NIcon :size="14"><NavigateOutline /></NIcon>
                      <span>{{ formatDistance(dayPlan.distance) }}</span>
                    </span>
                    <span v-if="dayPlan.duration && dayPlan.duration > 0" class="summary-item">
                      <NIcon :size="14"><HourglassOutline /></NIcon>
                      <span>{{ formatDuration(dayPlan.duration) }}</span>
                    </span>
                  </div>
                </div>
                <NSpace class="day-actions">
                  <NButton quaternary circle size="small" @click.stop="goToDayPlan(dayPlan)">
                    <template #icon>
                      <NIcon><CreateOutline /></NIcon>
                    </template>
                  </NButton>
                  <NPopconfirm
                    v-if="dayPlanIndex === dayPlans.length - 1"
                    @positive-click="handleDeleteDayPlan(dayPlan.id)"
                  >
                    <template #trigger>
                      <NButton quaternary circle size="small" @click.stop>
                        <template #icon>
                          <NIcon><TrashOutline /></NIcon>
                        </template>
                      </NButton>
                    </template>
                    删除此日期计划？
                  </NPopconfirm>
                </NSpace>
              </div>
            </NCard>
          </NTimelineItem>
        </NTimeline>

        <NEmpty v-else description="还没有日期计划。添加您的第一天！">
          <template #extra>
            <NButton type="primary" @click="handleAddDayPlan">
              <template #icon>
                <NIcon><AddOutline /></NIcon>
              </template>
              添加第一天
            </NButton>
          </template>
        </NEmpty>
      </section>

      <TripForm v-model:show="showEditForm" :trip="trip" @submit="handleUpdateTrip" />
    </div>
  </NSpin>
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

.day-notes {
  margin: 0;
  color: var(--text-color);
}

.day-notes-empty {
  margin: 0;
  color: var(--text-color-tertiary);
  font-style: italic;
}

.day-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.day-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
}

.item-name {
  color: var(--text-color);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--text-color-tertiary);
  font-size: 0.75rem;
  white-space: nowrap;
}

.day-items-more {
  color: var(--text-color-tertiary);
  font-size: 0.8rem;
  font-style: italic;
  padding-left: var(--spacing-sm);
}

.day-actions {
  flex-shrink: 0;
  align-self: flex-start;
}

.day-card-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing);
}

.day-info {
  flex: 1;
  min-width: 0;
}

.day-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-color-secondary);
  font-size: 0.85rem;
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
