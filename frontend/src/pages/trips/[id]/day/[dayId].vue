<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NButton, NIcon, NSpace, NCard, NSpin, NInput, NEmpty, useMessage } from "naive-ui";
import { ArrowBackOutline, AddOutline, SaveOutline } from "@vicons/ionicons5";
import DayPlanItemCard from "@/components/dayPlanItem/DayPlanItemCard.vue";
import DayPlanItemForm from "@/components/dayPlanItem/DayPlanItemForm.vue";
import { dayPlanApi, dayPlanItemApi } from "@/api";
import type { DayPlan, DayPlanItem, CreateDayPlanItemDto, UpdateDayPlanItemDto } from "@/types/api";
import { formatDate, getDayOfWeek } from "@/utils/date";

const route = useRoute();
const router = useRouter();
const message = useMessage();

const tripId = computed(() => Number(route.params.id));
const dayPlanId = computed(() => Number(route.params.dayId));

const loading = ref(true);
const saving = ref(false);
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
    message.error("Failed to load day plan");
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
    message.success("Notes saved");
  } catch (error) {
    message.error("Failed to save notes");
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
  try {
    if (editingItem.value) {
      const result = await dayPlanItemApi.update(editingItem.value.id, data as UpdateDayPlanItemDto);
      if (result.data.code === 200) {
        message.success("Item updated");
        loadDayPlan();
        showItemForm.value = false;
      } else {
        message.error(result.data.message);
      }
    } else {
      const result = await dayPlanItemApi.create(data as CreateDayPlanItemDto);
      if (result.data.code === 200) {
        message.success("Item added");
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
      message.success("Item deleted");
      loadDayPlan();
    } else {
      message.error(result.data.message);
    }
  } catch (error) {
    message.error("Failed to delete item");
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
            Back to Trip
          </NButton>
        </header>

        <div class="day-header">
          <div class="day-title-section">
            <h1 class="day-title">Day {{ dayPlan.dayNumber }}</h1>
            <p class="day-date">{{ formatDate(dayPlan.date) }} ({{ getDayOfWeek(dayPlan.date) }})</p>
          </div>
        </div>

        <NCard class="notes-card">
          <h3 class="section-title">Notes</h3>
          <NSpace vertical :size="12">
            <NInput v-model:value="notes" type="textarea" placeholder="Add notes for this day..." :rows="3" />
            <NButton type="primary" :loading="saving" @click="handleSaveNotes">
              <template #icon>
                <NIcon><SaveOutline /></NIcon>
              </template>
              Save Notes
            </NButton>
          </NSpace>
        </NCard>

        <section class="items-section">
          <div class="section-header">
            <h2 class="section-title">Schedule</h2>
            <NButton type="primary" @click="handleAddItem">
              <template #icon>
                <NIcon><AddOutline /></NIcon>
              </template>
              Add Item
            </NButton>
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

          <NEmpty v-else description="No items yet. Add your first activity!">
            <template #extra>
              <NButton type="primary" @click="handleAddItem">
                <template #icon>
                  <NIcon><AddOutline /></NIcon>
                </template>
                Add First Item
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
