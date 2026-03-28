<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getVehicles } from '@/api/vehicle'

const userStore = useUserStore()

const allVehicles = ref<any[]>([])
const loading = ref(false)

onMounted(async () => {
  await userStore.getBoundVehicles()
  const res = await getVehicles()
  if (res.code === 200 && res.data) {
    allVehicles.value = res.data.records || []
  }
})

async function handleBind(vehicleId: number) {
  loading.value = true
  try {
    await userStore.bindVehicle(vehicleId)
    ElMessage.success('绑定成功')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleUnbind(vehicleId: number) {
  await ElMessageBox.confirm('确定要解绑这个车辆吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await userStore.unbindVehicle(vehicleId)
    ElMessage.success('解绑成功')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleSetDefault(vehicleId: number) {
  loading.value = true
  try {
    await userStore.setDefaultVehicle(vehicleId)
    ElMessage.success('已设置为默认')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function isVehicleBound(vehicleId: number) {
  return userStore.boundVehicles.some(v => v.vehicleId === vehicleId)
}
</script>

<template>
  <div class="my-vehicles-page">
    <!-- 已绑定车辆 -->
    <el-card class="bound-card">
      <template #header>
        <div class="card-header">
          <span>🚗 已绑定车辆</span>
        </div>
      </template>
      
      <div v-if="userStore.boundVehicles.length === 0" class="empty-state">
        <EmptyState
          icon="🚙"
          text="暂未绑定车辆"
        />
      </div>
      
      <div v-else class="vehicle-list">
        <div
          v-for="vehicle in userStore.boundVehicles"
          :key="vehicle.bindId"
          class="vehicle-item"
        >
          <div class="vehicle-content">
            <div class="vehicle-icon">🚗</div>
            <div class="vehicle-info">
              <div class="vehicle-model">
                {{ vehicle.model }}
                <el-tag v-if="vehicle.isDefault" type="warning" size="small">
                  默认
                </el-tag>
              </div>
              <div class="vehicle-meta">
                百公里油耗：{{ vehicle.fuelConsumption || '-' }} L
              </div>
            </div>
          </div>
          <div class="vehicle-actions">
            <el-button
              v-if="!vehicle.isDefault"
              type="primary"
              link
              @click="handleSetDefault(vehicle.vehicleId)"
            >
              设为默认
            </el-button>
            <el-button type="danger" link @click="handleUnbind(vehicle.vehicleId)">
              解绑
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 可绑定车辆 -->
    <el-card class="available-card">
      <template #header>
        <div class="card-header">
          <span>📋 可绑定车辆</span>
          <el-button type="primary" @click="$router.push('/vehicles/create')">
            新建车辆
          </el-button>
        </div>
      </template>
      
      <div v-if="allVehicles.length === 0" class="empty-state">
        <EmptyState
          icon="📝"
          text="暂无可绑定车辆"
          show-button
          button-text="新建车辆"
          @action="$router.push('/vehicles/create')"
        />
      </div>
      
      <div v-else class="vehicle-list">
        <div
          v-for="vehicle in allVehicles"
          :key="vehicle.id"
          class="vehicle-item"
        >
          <div class="vehicle-content">
            <div class="vehicle-icon">🚙</div>
            <div class="vehicle-info">
              <div class="vehicle-model">{{ vehicle.model }}</div>
              <div class="vehicle-meta">
                百公里油耗：{{ vehicle.fuelConsumption || '-' }} L
              </div>
            </div>
          </div>
          <div class="vehicle-actions">
            <el-button
              v-if="isVehicleBound(vehicle.id)"
              type="info"
              disabled
            >
              已绑定
            </el-button>
            <el-button
              v-else
              type="primary"
              :loading="loading"
              @click="handleBind(vehicle.id)"
            >
              绑定
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.my-vehicles-page {
  .bound-card, .available-card {
    margin-bottom: 24px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
  }
  
  .vehicle-list {
    .vehicle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #eee;
      margin-bottom: 12px;
      
      &:hover {
        border-color: #FF6B35;
        background: #FFF8F0;
      }
      
      .vehicle-content {
        display: flex;
        align-items: center;
        
        .vehicle-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .vehicle-info {
          .vehicle-model {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .vehicle-meta {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }
}
</style>