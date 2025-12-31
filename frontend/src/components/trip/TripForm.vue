<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NDatePicker,
  NButton,
  NSpace,
  useMessage,
} from 'naive-ui'
import type { Trip, CreateTripDto, UpdateTripDto } from '@/types/api'
import { dayjs } from '@/utils/date'

const props = defineProps<{
  show: boolean
  trip?: Trip | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'submit', data: CreateTripDto | UpdateTripDto): void
}>()

const message = useMessage()
const loading = ref(false)

const isEdit = computed(() => !!props.trip)
const title = computed(() => (isEdit.value ? 'Edit Trip' : 'Create Trip'))

const formData = ref<CreateTripDto>({
  name: '',
  userCount: 1,
  budget: 0,
  startDate: '',
  endDate: '',
  description: '',
})

const dateRange = ref<[number, number] | null>(null)

watch(
  () => props.show,
  (show) => {
    if (show && props.trip) {
      formData.value = {
        name: props.trip.name,
        userCount: props.trip.userCount,
        budget: props.trip.budget,
        startDate: props.trip.startDate,
        endDate: props.trip.endDate,
        description: props.trip.description || '',
      }
      dateRange.value = [
        dayjs(props.trip.startDate).valueOf(),
        dayjs(props.trip.endDate).valueOf(),
      ]
    } else if (show) {
      formData.value = {
        name: '',
        userCount: 1,
        budget: 0,
        startDate: '',
        endDate: '',
        description: '',
      }
      dateRange.value = null
    }
  }
)

watch(dateRange, (range) => {
  if (range) {
    formData.value.startDate = dayjs(range[0]).format('YYYY-MM-DD')
    formData.value.endDate = dayjs(range[1]).format('YYYY-MM-DD')
  } else {
    formData.value.startDate = ''
    formData.value.endDate = ''
  }
})

function handleClose() {
  emit('update:show', false)
}

async function handleSubmit() {
  if (!formData.value.name) {
    message.warning('Please enter trip name')
    return
  }
  if (!formData.value.startDate || !formData.value.endDate) {
    message.warning('Please select date range')
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
      <NFormItem label="Trip Name" required>
        <NInput
          v-model:value="formData.name"
          placeholder="e.g., Japan Adventure 2024"
        />
      </NFormItem>

      <NFormItem label="Date Range" required>
        <NDatePicker
          v-model:value="dateRange"
          type="daterange"
          clearable
          style="width: 100%"
          :default-time="['00:00:00', '23:59:59']"
        />
      </NFormItem>

      <NSpace :size="16">
        <NFormItem label="Travelers">
          <NInputNumber
            v-model:value="formData.userCount"
            :min="1"
            :max="100"
            style="width: 120px"
          />
        </NFormItem>

        <NFormItem label="Budget">
          <NInputNumber
            v-model:value="formData.budget"
            :min="0"
            :step="100"
            style="width: 150px"
          >
            <template #prefix>¥</template>
          </NInputNumber>
        </NFormItem>
      </NSpace>

      <NFormItem label="Description">
        <NInput
          v-model:value="formData.description"
          type="textarea"
          placeholder="Describe your trip..."
          :rows="3"
        />
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">Cancel</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? 'Save Changes' : 'Create Trip' }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

