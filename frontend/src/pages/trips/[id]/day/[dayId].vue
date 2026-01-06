<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NButton, NIcon, NSpace, NCard, NSpin, NInput, NEmpty, useMessage } from "naive-ui";
import { ArrowBackOutline, AddOutline, SaveOutline, HomeOutline, RefreshOutline } from "@vicons/ionicons5";
import DayPlanItemCard from "@/components/dayPlanItem/DayPlanItemCard.vue";
import DayPlanItemForm from "@/components/dayPlanItem/DayPlanItemForm.vue";
import { dayPlanApi, dayPlanItemApi, userApi } from "@/api";
import type { DayPlan, DayPlanItem, CreateDayPlanItemDto, UpdateDayPlanItemDto } from "@/types/api";
import { PlanItemType } from "@/types/api";
import { formatDate, getDayOfWeek } from "@/utils/date";

const route = useRoute();
const router = useRouter();
const message = useMessage();

const tripId = computed(() => Number(route.params.id));
const dayPlanId = computed(() => Number(route.params.dayId));

const loading = ref(true);
const saving = ref(false);
const goingHome = ref(false);
const refreshingDistance = ref(false);
const dayPlan = ref<DayPlan | null>(null);
const items = ref<DayPlanItem[]>([]);
const notes = ref("");
const showItemForm = ref(false);
const editingItem = ref<DayPlanItem | null>(null);

onMounted(() => {
  loadDayPlan();
});

async function loadDayPlan() {
  loading.value = true;
  try {
    const [planResponse, itemsResponse] = await Promise.all([
      dayPlanApi.getById(dayPlanId.value),
      dayPlanApi.getItems(dayPlanId.value),
    ]);
    dayPlan.value = planResponse.data.data;
    notes.value = dayPlan.value.notes || "";
    items.value = itemsResponse.data.data || [];
  } catch (error) {
    message.error("加载日期计划失败");
    router.push(`/trips/${tripId.value}`);
  } finally {
    loading.value = false;
  }
}

async function handleSaveNotes() {
  if (!dayPlan.value) return;

  saving.value = true;
  try {
    await dayPlanApi.update(dayPlanId.value, { notes: notes.value });
    message.success("备注已保存");
  } catch (error) {
    message.error("保存备注失败");
  } finally {
    saving.value = false;
  }
}

function handleAddItem() {
  editingItem.value = null;
  showItemForm.value = true;
}

function handleEditItem(item: DayPlanItem) {
  editingItem.value = item;
  showItemForm.value = true;
}

async function handleItemFormSubmit(data: CreateDayPlanItemDto | UpdateDayPlanItemDto) {
  if (!data.latitude || !data.longitude || !data.address) {
    message.error("请选择地图上的位置");
    return;
  }

  try {
    if (editingItem.value) {
      const result = await dayPlanItemApi.update(editingItem.value.id, data as UpdateDayPlanItemDto);
      if (result.data.code === 200) {
        message.success("项目已更新");
        loadDayPlan();
        showItemForm.value = false;
      } else {
        message.error(result.data.message);
      }
    } else {
      const result = await dayPlanItemApi.create(data as CreateDayPlanItemDto);
      if (result.data.code === 200) {
        message.success("项目已添加");
        loadDayPlan();
        showItemForm.value = false;
      } else {
        message.error(result.data.message);
      }
    }
  } catch (error: any) {
    message.error(String(error.message));
  }
}

async function handleDeleteItem(id: number) {
  try {
    const result = await dayPlanItemApi.delete(id);
    if (result.data.code === 200) {
      message.success("项目已删除");
      loadDayPlan();
    } else {
      message.error(result.data.message);
    }
  } catch (error) {
    message.error("删除项目失败");
  }
}

async function handleRefreshDistance() {
  if (!dayPlan.value) return;
  loading.value = true;
  try {
    await loadDayPlan();
  } catch (error) {
    message.error("刷新失败");
  } finally {
    loading.value = false;
  }
}

async function handleGoHome() {
  if (!dayPlan.value) return;

  goingHome.value = true;
  try {
    // 获取用户信息
    const userResponse = await userApi.getCurrentUser();
    const user = userResponse.data.data;

    if (!user.homeAddress || !user.homeLatitude || !user.homeLongitude) {
      message.error("请先在设置中设置家的位置");
      goingHome.value = false;
      return;
    }

    // 创建"回家"的 item
    const homeItem: CreateDayPlanItemDto = {
      dayPlanId: dayPlanId.value,
      tripId: tripId.value,
      type: PlanItemType.TRANSPORT,
      name: "回家",
      address: user.homeAddress,
      latitude: user.homeLatitude,
      longitude: user.homeLongitude,
      startTime: "22",
      endTime: "23",
      cost: 0,
      notes: "返回家中",
    };

    const result = await dayPlanItemApi.create(homeItem);
    if (result.data.code === 200) {
      message.success("已添加回家项目");
      loadDayPlan();
    } else {
      message.error(result.data.message);
    }
  } catch (error: any) {
    message.error(error.message || "添加回家项目失败");
  } finally {
    goingHome.value = false;
  }
}

const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    // Sort by start time, then by order
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return a.order - b.order;
  });
});
</script>

<template>
  <NSpin :show="loading">
    <div v-if="dayPlan" class="day-plan-detail">
      <header class="page-header">
        <NButton quaternary @click="router.push(`/trips/${tripId}`)">
          <template #icon>
            <NIcon><ArrowBackOutline /></NIcon>
          </template>
          返回行程
        </NButton>
      </header>

      <div class="day-header">
        <div class="day-title-section">
          <h1 class="day-title">第 {{ dayPlan.dayNumber }} 天</h1>
          <p class="day-date">{{ formatDate(dayPlan.date) }} ({{ getDayOfWeek(dayPlan.date) }})</p>
        </div>
      </div>

      <NCard class="notes-card">
        <h3 class="section-title">备注</h3>
        <NSpace vertical :size="12">
          <NInput v-model:value="notes" type="textarea" placeholder="为此日期添加备注..." :rows="3" />
          <NButton type="primary" :loading="saving" @click="handleSaveNotes">
            <template #icon>
              <NIcon><SaveOutline /></NIcon>
            </template>
            保存备注
          </NButton>
        </NSpace>
      </NCard>

      <section class="items-section">
        <div class="section-header">
          <h2 class="section-title">日程安排</h2>
          <NSpace>
            <NButton @click="handleGoHome" :loading="goingHome">
              <template #icon>
                <NIcon><HomeOutline /></NIcon>
              </template>
              一键回家
            </NButton>
            <NButton @click="handleRefreshDistance" :loading="refreshingDistance">
              <template #icon>
                <NIcon><RefreshOutline /></NIcon>
              </template>
              刷新里程
            </NButton>
            <NButton type="primary" @click="handleAddItem">
              <template #icon>
                <NIcon><AddOutline /></NIcon>
              </template>
              添加项目
            </NButton>
          </NSpace>
        </div>

        <div v-if="sortedItems.length > 0" class="items-list">
          <DayPlanItemCard
            v-for="item in sortedItems"
            :key="item.id"
            :item="item"
            @edit="handleEditItem"
            @delete="handleDeleteItem"
          />
        </div>

        <NEmpty v-else description="还没有项目。添加您的第一个活动！">
          <template #extra>
            <NButton type="primary" @click="handleAddItem">
              <template #icon>
                <NIcon><AddOutline /></NIcon>
              </template>
              添加第一个项目
            </NButton>
          </template>
        </NEmpty>
      </section>

      <DayPlanItemForm
        v-model:show="showItemForm"
        :item="editingItem"
        :day-plan-id="dayPlanId"
        :trip-id="tripId"
        @submit="handleItemFormSubmit"
      />
    </div>
  </NSpin>
</template>

<style scoped>
.day-plan-detail {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.day-header {
  margin-bottom: var(--spacing-lg);
}

.day-title-section {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.day-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.day-date {
  color: var(--text-color-secondary);
  margin: 0;
}

.notes-card {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing);
}

.items-section {
  margin-top: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.section-header .section-title {
  font-size: 1.25rem;
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

@media (max-width: 768px) {
  .day-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style>
