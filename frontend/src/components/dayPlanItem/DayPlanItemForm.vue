<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
} from 'naive-ui'
import type { DayPlanItem, CreateDayPlanItemDto, UpdateDayPlanItemDto } from '@/types/api'
import { PlanItemType } from '@/types/api'
import { getItemTypeIcon, getItemTypeLabel } from '@/utils/format'

const props = defineProps<{
  show: boolean
  item?: DayPlanItem | null
  dayPlanId: number
  tripId: number
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'submit', data: CreateDayPlanItemDto | UpdateDayPlanItemDto): void
}>()

const message = useMessage()
const loading = ref(false)

const isEdit = computed(() => !!props.item)
const title = computed(() => (isEdit.value ? 'Edit Item' : 'Add Item'))

const typeOptions = Object.values(PlanItemType).map((type) => ({
  label: `${getItemTypeIcon(type)} ${getItemTypeLabel(type)}`,
  value: type,
}))

const formData = ref<CreateDayPlanItemDto>({
  dayPlanId: props.dayPlanId,
  tripId: props.tripId,
  type: PlanItemType.ATTRACTION,
  name: '',
  address: '',
  startTime: '',
  endTime: '',
  duration: undefined,
  cost: undefined,
  notes: '',
})

const startTimeValue = ref<number | null>(null)
const endTimeValue = ref<number | null>(null)

watch(
  () => props.show,
  (show) => {
    if (show && props.item) {
      formData.value = {
        dayPlanId: props.dayPlanId,
        tripId: props.tripId,
        type: props.item.type,
        name: props.item.name,
        address: props.item.address || '',
        startTime: props.item.startTime || '',
        endTime: props.item.endTime || '',
        duration: props.item.duration || undefined,
        cost: props.item.cost || undefined,
        notes: props.item.notes || '',
      }
      // Parse time strings to timestamps for time picker
      if (props.item.startTime) {
        const [h, m] = props.item.startTime.split(':').map(Number)
        startTimeValue.value = (h * 60 + m) * 60 * 1000
      }
      if (props.item.endTime) {
        const [h, m] = props.item.endTime.split(':').map(Number)
        endTimeValue.value = (h * 60 + m) * 60 * 1000
      }
    } else if (show) {
      formData.value = {
        dayPlanId: props.dayPlanId,
        tripId: props.tripId,
        type: PlanItemType.ATTRACTION,
        name: '',
        address: '',
        startTime: '',
        endTime: '',
        duration: undefined,
        cost: undefined,
        notes: '',
      }
      startTimeValue.value = null
      endTimeValue.value = null
    }
  }
)

watch(startTimeValue, (val) => {
  if (val !== null) {
    const totalMinutes = Math.floor(val / 1000 / 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    formData.value.startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  } else {
    formData.value.startTime = ''
  }
})

watch(endTimeValue, (val) => {
  if (val !== null) {
    const totalMinutes = Math.floor(val / 1000 / 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    formData.value.endTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  } else {
    formData.value.endTime = ''
  }
})

function handleClose() {
  emit('update:show', false)
}

async function handleSubmit() {
  if (!formData.value.name) {
    message.warning('Please enter item name')
    return
  }

  loading.value = true
  try {
    emit('submit', { ...formData.value })
    handleClose()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NModal
    :show="show"
    :title="title"
    preset="card"
    style="width: 500px; max-width: 95vw"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
  >
    <NForm :model="formData" label-placement="top">
      <NFormItem label="Type" required>
        <NSelect
          v-model:value="formData.type"
          :options="typeOptions"
        />
      </NFormItem>

      <NFormItem label="Name" required>
        <NInput
          v-model:value="formData.name"
          placeholder="e.g., Visit the Great Wall"
        />
      </NFormItem>

      <NFormItem label="Address">
        <NInput
          v-model:value="formData.address"
          placeholder="e.g., Badaling, Beijing"
        />
      </NFormItem>

      <NSpace :size="16">
        <NFormItem label="Start Time">
          <NTimePicker
            v-model:value="startTimeValue"
            format="HH:mm"
            clearable
            style="width: 120px"
          />
        </NFormItem>

        <NFormItem label="End Time">
          <NTimePicker
            v-model:value="endTimeValue"
            format="HH:mm"
            clearable
            style="width: 120px"
          />
        </NFormItem>
      </NSpace>

      <NSpace :size="16">
        <NFormItem label="Duration (min)">
          <NInputNumber
            v-model:value="formData.duration"
            :min="0"
            style="width: 120px"
          />
        </NFormItem>

        <NFormItem label="Cost">
          <NInputNumber
            v-model:value="formData.cost"
            :min="0"
            style="width: 120px"
          >
            <template #prefix>¥</template>
          </NInputNumber>
        </NFormItem>
      </NSpace>

      <NFormItem label="Notes">
        <NInput
          v-model:value="formData.notes"
          type="textarea"
          placeholder="Add any notes..."
          :rows="2"
        />
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">Cancel</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? 'Save Changes' : 'Add Item' }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

