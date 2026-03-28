<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVehicles, deleteVehicle } from '@/api/vehicle'
import type { Vehicle } from '@/types/vehicle'

const router = useRouter()

const vehicles = ref<Vehicle[]>([])
const loading = ref(false)
const total = ref(0)

onMounted(async () => {
  await fetchVehicles()
})

async function fetchVehicles() {
  loading.value = true
  try {
    const res = await getVehicles()
    if (res.code === 200 && res.data) {
      vehicles.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push('/vehicles/create')
}

function handleEdit(id: number) {
  router.push(`/vehicles/${id}/edit`)
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除这个车辆吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await deleteVehicle(id)
    ElMessage.success('删除成功')
    await fetchVehicles()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="vehicle-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🚗 车辆管理</span>
          <el-button type="primary" @click="handleCreate">
            新建车辆
          </el-button>
        </div>
      </template>
      
      <div v-if="vehicles.length === 0 && !loading" class="empty-state">
        <EmptyState
          icon="🚙"
          text="暂无车辆"
          show-button
          button-text="新建车辆"
          @action="handleCreate"
        />
      </div>
      
      <el-table v-else :data="vehicles" v-loading="loading" stripe>
        <el-table-column prop="model" label="车型" min-width="200">
          <template #default="{ row }">
            <div class="vehicle-model">
              <span class="vehicle-icon">🚗</span>
              {{ row.model }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="fuelConsumption" label="百公里油耗(L)" width="150">
          <template #default="{ row }">
            {{ row.fuelConsumption || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.createdAt }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row.id)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.vehicle-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
  }
  
  .vehicle-model {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .vehicle-icon {
      font-size: 20px;
    }
  }
}
</style>