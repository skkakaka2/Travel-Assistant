<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { tripApi, userApi, mapApi } from '@/api'
import type { CreateTripRequest, UserVehicleVO, HomeLocationVO } from '@/types'

const router = useRouter()
const loading = ref(false)
const vehicles = ref<UserVehicleVO[]>([])
const homeLocations = ref<HomeLocationVO[]>([])

const form = ref<CreateTripRequest>({
  title: '',
  vehicleId: undefined,
  startLocation: '',
  startLongitude: undefined,
  startLatitude: undefined,
  endLocation: '',
  endLongitude: undefined,
  endLatitude: undefined,
})

const fetchingStartCoords = ref(false)
const fetchingEndCoords = ref(false)

const fetchVehicles = async () => {
  try {
    const res = await userApi.getVehicles()
    vehicles.value = res.data || []
  } catch {
    // 错误已处理
  }
}

const fetchHomeLocations = async () => {
  try {
    const res = await userApi.getHomeLocations()
    homeLocations.value = res.data || []
  } catch {
    // 错误已处理
  }
}

const handleStartLocationChange = async () => {
  if (!form.value.startLocation) return
  fetchingStartCoords.value = true
  try {
    const res = await mapApi.geocode(form.value.startLocation)
    if (res.data) {
      form.value.startLongitude = res.data.longitude
      form.value.startLatitude = res.data.latitude
    }
  } catch {
    // 错误已处理
  } finally {
    fetchingStartCoords.value = false
  }
}

const handleEndLocationChange = async () => {
  if (!form.value.endLocation) return
  fetchingEndCoords.value = true
  try {
    const res = await mapApi.geocode(form.value.endLocation)
    if (res.data) {
      form.value.endLongitude = res.data.longitude
      form.value.endLatitude = res.data.latitude
    }
  } catch {
    // 错误已处理
  } finally {
    fetchingEndCoords.value = false
  }
}

const selectHomeLocation = (location: HomeLocationVO, isStart: boolean) => {
  if (isStart) {
    form.value.startLocation = location.address
    form.value.startLongitude = location.longitude
    form.value.startLatitude = location.latitude
  } else {
    form.value.endLocation = location.address
    form.value.endLongitude = location.longitude
    form.value.endLatitude = location.latitude
  }
}

const handleSubmit = async () => {
  if (!form.value.startLocation || !form.value.endLocation) {
    ElMessage.warning('请输入起点和终点')
    return
  }

  loading.value = true
  try {
    await tripApi.create(form.value)
    ElMessage.success('创建成功')
    router.push('/trips')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVehicles()
  fetchHomeLocations()
})
</script>

<template>
  <div class="trip-create-page">
    <el-card>
      <template #header>
        <span>创建行程</span>
      </template>

      <el-form :model="form" label-width="100px" class="trip-form">
        <el-form-item label="行程标题">
          <el-input v-model="form.title" placeholder="如：周末郊游" />
        </el-form-item>

        <el-form-item label="选择车辆">
          <el-select v-model="form.vehicleId" placeholder="请选择车辆" clearable>
            <el-option
              v-for="v in vehicles"
              :key="v.vehicleId"
              :label="v.model"
              :value="v.vehicleId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="起点" required>
          <div class="location-input">
            <el-input
              v-model="form.startLocation"
              placeholder="请输入起点地址"
              @blur="handleStartLocationChange"
            />
            <el-button
              :loading="fetchingStartCoords"
              @click="handleStartLocationChange"
            >
              获取坐标
            </el-button>
          </div>
          <div v-if="homeLocations.length" class="quick-select">
            <span>快捷选择：</span>
            <el-tag
              v-for="loc in homeLocations"
              :key="loc.id"
              class="location-tag"
              @click="selectHomeLocation(loc, true)"
            >
              {{ loc.name || loc.address }}
            </el-tag>
          </div>
          <div v-if="form.startLongitude" class="coords-info">
            坐标：{{ form.startLongitude?.toFixed(6) }}, {{ form.startLatitude?.toFixed(6) }}
          </div>
        </el-form-item>

        <el-form-item label="终点" required>
          <div class="location-input">
            <el-input
              v-model="form.endLocation"
              placeholder="请输入终点地址"
              @blur="handleEndLocationChange"
            />
            <el-button
              :loading="fetchingEndCoords"
              @click="handleEndLocationChange"
            >
              获取坐标
            </el-button>
          </div>
          <div v-if="homeLocations.length" class="quick-select">
            <span>快捷选择：</span>
            <el-tag
              v-for="loc in homeLocations"
              :key="loc.id"
              class="location-tag"
              @click="selectHomeLocation(loc, false)"
            >
              {{ loc.name || loc.address }}
            </el-tag>
          </div>
          <div v-if="form.endLongitude" class="coords-info">
            坐标：{{ form.endLongitude?.toFixed(6) }}, {{ form.endLatitude?.toFixed(6) }}
          </div>
        </el-form-item>

        <el-form-item>
          <el-button @click="router.back()">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            创建行程
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.trip-create-page {
  .trip-form {
    max-width: 600px;
  }

  .location-input {
    display: flex;
    gap: 12px;

    .el-input {
      flex: 1;
    }
  }

  .quick-select {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    .location-tag {
      margin-left: 8px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .coords-info {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>