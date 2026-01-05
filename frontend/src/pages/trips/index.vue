<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { NButton, NIcon, NSpace, NPagination, NSpin, useMessage } from "naive-ui";
import { AddOutline } from "@vicons/ionicons5";
import TripCard from "@/components/trip/TripCard.vue";
import TripForm from "@/components/trip/TripForm.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import { useTripStore } from "@/stores";
import type { Trip, CreateTripDto, UpdateTripDto } from "@/types/api";
import { userApi } from "@/api";

const router = useRouter();
const message = useMessage();
const tripStore = useTripStore();

const showForm = ref(false);
const editingTrip = ref<Trip | null>(null);
const page = ref(1);
const pageSize = ref(9);

onMounted(() => {
  loadTrips();
});

async function loadTrips() {
  try {
    await tripStore.fetchTrips({ page: page.value, pageSize: pageSize.value });
  } catch (error) {
    message.error("加载行程失败");
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage;
  loadTrips();
}

async function handleCreate() {
  const response = await userApi.hasHome();
  if (!response.data.data) {
    message.error("请先设置家的位置，再创建行程，即将跳转至设置页面");
    setTimeout(() => {
      router.push("/settings");
    }, 3000);
    return;
  }
  editingTrip.value = null;
  showForm.value = true;
}

function handleEdit(trip: Trip) {
  editingTrip.value = trip;
  showForm.value = true;
}

async function handleFormSubmit(data: CreateTripDto | UpdateTripDto) {
  try {
    if (editingTrip.value) {
      await tripStore.updateTrip(editingTrip.value.id, data);
      message.success("行程更新成功");
    } else {
      await tripStore.createTrip(data as CreateTripDto);
      message.success("行程创建成功");
    }
    loadTrips();
  } catch (error) {
    message.error("操作失败");
  }
}

async function handleDelete(id: number) {
  try {
    await tripStore.deleteTrip(id);
    message.success("行程删除成功");
    loadTrips();
  } catch (error) {
    message.error("删除行程失败");
  }
}

function handleTripClick(trip: Trip) {
  router.push(`/trips/${trip.id}`);
}
</script>

<template>
  <div class="trips-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">我的行程</h1>
        <p class="page-subtitle">规划和管理您的旅行冒险</p>
      </div>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon><AddOutline /></NIcon>
        </template>
        新建行程
      </NButton>
    </header>

    <NSpin :show="tripStore.loading">
      <div v-if="tripStore.trips.length > 0" class="trips-grid">
        <TripCard
          v-for="trip in tripStore.trips"
          :key="trip.id"
          :trip="trip"
          @click="handleTripClick"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <EmptyState
        v-else-if="!tripStore.loading"
        icon="🌍"
        title="还没有行程"
        description="通过创建新行程开始规划您的下一次冒险"
      >
        <template #action>
          <NButton type="primary" @click="handleCreate">
            <template #icon>
              <NIcon><AddOutline /></NIcon>
            </template>
            创建您的第一个行程
          </NButton>
        </template>
      </EmptyState>
    </NSpin>

    <div v-if="tripStore.total > pageSize" class="pagination">
      <NPagination
        v-model:page="page"
        :page-count="Math.ceil(tripStore.total / pageSize)"
        :page-size="pageSize"
        @update:page="handlePageChange"
      />
    </div>

    <TripForm v-model:show="showForm" :trip="editingTrip" @submit="handleFormSubmit" />
  </div>
</template>

<style scoped>
.trips-page {
  min-height: calc(100vh - var(--header-height) - var(--spacing-2xl));
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 var(--spacing-xs);
}

.page-subtitle {
  color: var(--text-color-secondary);
  margin: 0;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .trips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
