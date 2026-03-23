<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Star, Link, Unlink } from '@element-plus/icons-vue'
import { userApi, vehicleApi } from '@/api'
import type { UserVehicleVO, VehicleVO, VehicleRequest } from '@/types'

const loading = ref(false)
const vehicles = ref<UserVehicleVO[]>([])
const allVehicles = ref<VehicleVO[]>([])
const bindDialogVisible = ref(false)
const createDialogVisible = ref(false)
const dialogTitle = ref('添加车辆')
const formLoading = ref(false)
const editId = ref<number | null>(null)

const defaultForm: VehicleRequest = {
  model: '',
  fuelConsumption: undefined,
}

const form = ref<VehicleRequest>({ ...defaultForm })

const fetchVehicles = async () => {
  loading.value = true
  try {
    const res = await userApi.getVehicles()
    vehicles.value = res || []
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const fetchAllVehicles = async () => {
  try {
    const res = await vehicleApi.getList({ size: 100 })
    allVehicles.value = res?.records || []
  } catch {
    // 错误已处理
  }
}

const handleBind = async (vehicleId: number) => {
  try {
    await userApi.bindVehicle(vehicleId)
    ElMessage.success('绑定成功')
    fetchVehicles()
    bindDialogVisible.value = false
  } catch {
    // 错误已处理
  }
}

const handleUnbind = async (vehicleId: number) => {
  await ElMessageBox.confirm('确定要解绑这辆车吗？', '提示', {
    type: 'warning',
  })
  try {
    await userApi.unbindVehicle(vehicleId)
    ElMessage.success('解绑成功')
    fetchVehicles()
  } catch {
    // 错误已处理
  }
}

const handleSetDefault = async (vehicleId: number) => {
  try {
    await userApi.setDefaultVehicle(vehicleId)
    ElMessage.success('设置成功')
    fetchVehicles()
  } catch {
    // 错误已处理
  }
}

const handleCreateVehicle = () => {
  editId.value = null
  dialogTitle.value = '添加车辆'
  form.value = { ...defaultForm }
  createDialogVisible.value = true
}

const handleSubmitVehicle = async () => {
  if (!form.value.model) {
    ElMessage.warning('请输入车辆型号')
    return
  }
  formLoading.value = true
  try {
    if (editId.value) {
      await vehicleApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      const res = await vehicleApi.create(form.value)
      await userApi.bindVehicle(res.id)
      ElMessage.success('添加并绑定成功')
    }
    createDialogVisible.value = false
    fetchVehicles()
  } catch {
    // 错误已处理
  } finally {
    formLoading.value = false
  }
}

const openBindDialog = () => {
  fetchAllVehicles()
  bindDialogVisible.value = true
}

onMounted(() => {
  fetchVehicles()
})
</script>

<template>
  <div class="vehicles-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车辆管理</span>
          <div>
            <el-button type="default" :icon="Link" @click="openBindDialog"> 绑定车辆 </el-button>
            <el-button type="primary" :icon="Plus" @click="handleCreateVehicle">
              添加车辆
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="vehicles" stripe>
        <el-table-column prop="model" label="车辆型号" min-width="150" />
        <el-table-column prop="fuelConsumption" label="油耗(L/100km)" width="130">
          <template #default="{ row }">
            {{ row.fuelConsumption || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="默认" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="success">默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bindTime" label="绑定时间" width="180">
          <template #default="{ row }">
            {{ row.bindTime ? new Date(row.bindTime).toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.isDefault"
              type="primary"
              text
              :icon="Star"
              @click="handleSetDefault(row.vehicleId)"
            >
              设为默认
            </el-button>
            <el-button type="danger" text :icon="Unlink" @click="handleUnbind(row.vehicleId)">
              解绑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 绑定车辆弹窗 -->
    <el-dialog v-model="bindDialogVisible" title="绑定车辆" width="600px">
      <el-table :data="allVehicles" stripe max-height="400">
        <el-table-column prop="model" label="车辆型号" />
        <el-table-column prop="fuelConsumption" label="油耗" width="100">
          <template #default="{ row }"> {{ row.fuelConsumption || '-' }} L/100km </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" text @click="handleBind(row.id)"> 绑定 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加车辆弹窗 -->
    <el-dialog v-model="createDialogVisible" :title="dialogTitle" width="400px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="车辆型号" required>
          <el-input v-model="form.model" placeholder="如：丰田卡罗拉 2023款" />
        </el-form-item>
        <el-form-item label="百公里油耗">
          <el-input-number
            v-model="form.fuelConsumption"
            :min="0"
            :precision="1"
            placeholder="L/100km"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click="handleSubmitVehicle">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.vehicles-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
