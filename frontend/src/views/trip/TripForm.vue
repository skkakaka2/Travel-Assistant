<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTrip, createTrip, updateTrip, getRouteByCoords } from '@/api/trip'
import { getBoundVehicles } from '@/api/user'
import type { FormInstance, FormRules } from 'element-plus'
import type { CreateTripRequest } from '@/types/trip'
import type { UserVehicle } from '@/types/user'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const tripId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const loading = ref(false)
const calculating = ref(false)

const boundVehicles = ref<UserVehicle[]>([])

const form = reactive<CreateTripRequest>({
  title: '',
  vehicleId: undefined,
  startLocation: '',
  startLongitude: undefined,
  startLatitude: undefined,
  endLocation: '',
  endLongitude: undefined,
  endLatitude: undefined
})

const rules: FormRules = {
  startLocation: [
    { required: true, message: '请输入起点', trigger: 'blur' }
  ],
  endLocation: [
    { required: true, message: '请输入终点', trigger: 'blur' }
  ]
}

const routeInfo = ref<{
  distance: number
  duration: number
} | null>(null)

onMounted(async () => {
  // 获取绑定车辆
  const vehiclesRes = await getBoundVehicles()
  if (vehiclesRes.code === 200 && vehiclesRes.data) {
    boundVehicles.value = vehiclesRes.data
    // 设置默认车辆
    const defaultVehicle = boundVehicles.value.find(v => v.isDefault)
    if (defaultVehicle) {
      form.vehicleId = defaultVehicle.vehicleId
    }
  }
  
  // 编辑模式
  if (route.params.id) {
    isEdit.value = true
    tripId.value = Number(route.params.id)
    const res = await getTrip(tripId.value)
    if (res.code === 200 && res.data) {
      const trip = res.data
      form.title = trip.title || ''
      form.vehicleId = trip.vehicleId
      form.startLocation = trip.startLocation
      form.startLongitude = trip.startLongitude
      form.startLatitude = trip.startLatitude
      form.endLocation = trip.endLocation
      form.endLongitude = trip.endLongitude
      form.endLatitude = trip.endLatitude
      
      if (trip.distance && trip.duration) {
        routeInfo.value = {
          distance: trip.distance,
          duration: trip.duration
        }
      }
    }
  }
})

async function calculateRoute() {
  if (!form.startLocation || !form.endLocation) {
    ElMessage.warning('请先输入起点和终点')
    return
  }
  
  calculating.value = true
  try {
    // 如果有坐标，使用坐标计算；否则使用地址
    if (form.startLongitude && form.startLatitude && form.endLongitude && form.endLatitude) {
      const res = await getRouteByCoords(
        form.startLongitude,
        form.startLatitude,
        form.endLongitude,
        form.endLatitude
      )
      if (res.code === 200 && res.data) {
        routeInfo.value = {
          distance: res.data.distance,
          duration: res.data.duration
        }
      }
    } else {
      // 使用地址计算（这里简化处理，实际需要先地理编码）
      ElMessage.info('路线计算需要坐标信息')
    }
  } catch {
    ElMessage.error('路线计算失败')
  } finally {
    calculating.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    if (isEdit.value && tripId.value) {
      await updateTrip(tripId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createTrip(form)
      ElMessage.success('创建成功')
    }
    router.push('/trips')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/trips')
}
</script>

<template>
  <div class="trip-form-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '🗺️ 编辑行程' : '🗺️ 新建行程' }}</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="trip-form"
      >
        <el-form-item label="行程名称">
          <el-input
            v-model="form.title"
            placeholder="例如：北京一日游"
          />
        </el-form-item>
        
        <el-form-item label="车辆">
          <el-select
            v-model="form.vehicleId"
            placeholder="选择车辆"
            clearable
          >
            <el-option
              v-for="vehicle in boundVehicles"
              :key="vehicle.vehicleId"
              :label="vehicle.model"
              :value="vehicle.vehicleId"
            >
              <span>{{ vehicle.model }}</span>
              <el-tag v-if="vehicle.isDefault" type="warning" size="small" style="margin-left: 8px">
                默认
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="起点" prop="startLocation">
          <el-input
            v-model="form.startLocation"
            placeholder="输入起点地址"
          >
            <template #prefix>
              <span>🚩</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="终点" prop="endLocation">
          <el-input
            v-model="form.endLocation"
            placeholder="输入终点地址"
          >
            <template #prefix>
              <span>🏁</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            link
            :loading="calculating"
            @click="calculateRoute"
          >
            📏 计算路线
          </el-button>
          
          <div v-if="routeInfo" class="route-result">
            <span>距离：{{ (routeInfo.distance / 1000).toFixed(1) }} km</span>
            <span>时长：{{ Math.round(routeInfo.duration / 60) }} 分钟</span>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.trip-form-page {
  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
  
  .trip-form {
    max-width: 600px;
    
    .route-result {
      display: flex;
      gap: 24px;
      margin-top: 12px;
      padding: 12px 16px;
      background: #FFF8F0;
      border-radius: 8px;
      font-size: 14px;
      color: #666;
    }
  }
}
</style>