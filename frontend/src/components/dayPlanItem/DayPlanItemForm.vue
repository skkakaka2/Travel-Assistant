<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NTimePicker,
  NButton,
  NSpace,
  useMessage,
  FormInst,
} from "naive-ui";
import type { DayPlanItem, CreateDayPlanItemDto, UpdateDayPlanItemDto } from "@/types/api";
import { PlanItemType } from "@/types/api";
import { getItemTypeIcon, getItemTypeLabel } from "@/utils/format";
import BaiduMapPicker from "@/components/map/BaiduMapPicker.vue";

const props = defineProps<{
  show: boolean;
  item?: DayPlanItem | null;
  dayPlanId: number;
  tripId: number;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "submit", data: CreateDayPlanItemDto | UpdateDayPlanItemDto): void;
}>();

const message = useMessage();
const loading = ref(false);
const formRef = ref<FormInst | null>(null);
const isEdit = computed(() => !!props.item);
const title = computed(() => (isEdit.value ? "编辑项目" : "添加项目"));

const typeOptions = Object.values(PlanItemType).map((type) => ({
  label: `${getItemTypeIcon(type)} ${getItemTypeLabel(type)}`,
  value: type,
}));

const formData = ref<CreateDayPlanItemDto>({
  dayPlanId: props.dayPlanId,
  tripId: props.tripId,
  type: PlanItemType.ATTRACTION,
  name: "",
  address: "",
  startTime: "00",
  endTime: "00",
  duration: undefined,
  cost: undefined,
  notes: "",
  latitude: "",
  longitude: "",
});

const startTimeValue = ref<string | null>();
const endTimeValue = ref<string | null>();

watch(
  () => props.show,
  (show) => {
    if (show && props.item) {
      formData.value = {
        dayPlanId: props.dayPlanId,
        tripId: props.tripId,
        type: props.item.type,
        name: props.item.name,
        address: props.item.address || "",
        startTime: props.item.startTime || "00",
        endTime: props.item.endTime || "00",
        duration: props.item.duration || undefined,
        cost: props.item.cost || undefined,
        notes: props.item.notes || "",
        latitude: props.item.latitude || undefined,
        longitude: props.item.longitude || undefined,
      };
    } else if (show) {
      formData.value = {
        dayPlanId: props.dayPlanId,
        tripId: props.tripId,
        type: PlanItemType.ATTRACTION,
        name: "",
        address: "",
        startTime: "00",
        endTime: "00",
        duration: undefined,
        cost: undefined,
        notes: "",
        latitude: undefined,
        longitude: undefined,
      };
      startTimeValue.value = null;
      endTimeValue.value = null;
    }
  }
);

const formRules = {
  name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  address: [{ required: true, message: "请输入项目地址", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "blur" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "blur" }],
  // cost: [{ required: true, type: "number" as const, message: "请输入费用", trigger: "blur" }],
};

function handleClose() {
  emit("update:show", false);
}

async function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true;
      try {
        emit("submit", { ...formData.value });
      } finally {
        loading.value = false;
      }
    }
  });
}

// 处理地图选点回调
function handleLocationSelected(data: { latitude: number; longitude: number; address: string }) {
  formData.value.latitude = data.latitude.toString();
  formData.value.longitude = data.longitude.toString();
  formData.value.address = data.address;
}
</script>

<template>
  <NModal
    :show="show"
    :title="title"
    preset="card"
    style="min-width: 1200px; max-width: 90vw; height: 90%"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
  >
    <div class="form-with-map">
      <!-- 左侧表单 -->
      <div class="form-section">
        <NForm ref="formRef" :model="formData" label-placement="top" :rules="formRules">
          <NFormItem path="type" label="类型">
            <NSelect v-model:value="formData.type" :options="typeOptions" />
          </NFormItem>

          <NFormItem path="name" label="名称">
            <NInput v-model:value="formData.name" placeholder="例如：参观长城" />
          </NFormItem>

          <NFormItem path="address" label="地址">
            <NInput v-model:value="formData.address" placeholder="例如：北京八达岭" />
          </NFormItem>

          <NSpace :size="16">
            <NFormItem path="startTime" label="开始时间">
              <NTimePicker
                v-model:formatted-value="formData.startTime"
                format="HH"
                value-format="HH"
                clearable
                style="width: 100px"
              />
            </NFormItem>

            <NFormItem path="endTime" label="结束时间">
              <NTimePicker
                v-model:formatted-value="formData.endTime"
                format="HH"
                value-format="HH"
                clearable
                style="width: 100px"
              />
            </NFormItem>
          </NSpace>
          <NFormItem path="cost" label="费用">
            <NInputNumber v-model:value="formData.cost" placeholder="请输入费用" :min="0" style="width: 200px">
              <template #prefix>¥</template>
            </NInputNumber>
          </NFormItem>

          <NFormItem path="notes" label="备注">
            <NInput v-model:value="formData.notes" type="textarea" placeholder="添加任何备注..." :rows="8" />
          </NFormItem>
        </NForm>
      </div>

      <!-- 右侧地图 -->
      <div class="map-section">
        <div class="map-title">选择位置</div>
        <BaiduMapPicker
          v-model:latitude="formData.latitude"
          v-model:longitude="formData.longitude"
          :address="formData.address"
          @location-selected="handleLocationSelected"
        />
      </div>
    </div>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? "保存更改" : "添加项目" }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.form-with-map {
  display: flex;
  gap: 24px;
  height: 100%;
  min-height: 450px;
}

.form-section {
  flex: 1;
  min-width: 300px;
}

.map-section {
  flex: 1;
  min-width: 350px;
  display: flex;
  flex-direction: column;
}

.map-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-color);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .form-with-map {
    flex-direction: column;
  }

  .form-section,
  .map-section {
    min-width: 100%;
  }

  .map-section {
    min-height: 350px;
  }
}
</style>
