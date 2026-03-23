<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Star, StarFilled } from '@element-plus/icons-vue'
import { userApi } from '@/api'
import type { HomeLocationVO, HomeLocationRequest } from '@/types'

const loading = ref(false)
const locations = ref<HomeLocationVO[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加家庭位置')
const formLoading = ref(false)
const editId = ref<number | null>(null)

const defaultForm: HomeLocationRequest = {
  name: '',
  address: '',
  longitude: undefined,
  latitude: undefined,
  isDefault: false,
}

const form = ref<HomeLocationRequest>({ ...defaultForm })

const fetchLocations = async () => {
  loading.value = true
  try {
    const res = await userApi.getHomeLocations()
    locations.value = res || []
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editId.value = null
  dialogTitle.value = '添加家庭位置'
  form.value = { ...defaultForm }
  dialogVisible.value = true
}

const handleEdit = (location: HomeLocationVO) => {
  editId.value = location.id
  dialogTitle.value = '编辑家庭位置'
  form.value = {
    name: location.name,
    address: location.address,
    longitude: location.longitude,
    latitude: location.latitude,
    isDefault: location.isDefault,
  }
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这个家庭位置吗？', '提示', {
    type: 'warning',
  })
  try {
    await userApi.deleteHomeLocation(id)
    ElMessage.success('删除成功')
    fetchLocations()
  } catch {
    // 错误已处理
  }
}

const handleSetDefault = async (id: number) => {
  try {
    await userApi.setDefaultHomeLocation(id)
    ElMessage.success('设置成功')
    fetchLocations()
  } catch {
    // 错误已处理
  }
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    if (editId.value) {
      await userApi.updateHomeLocation(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await userApi.addHomeLocation(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchLocations()
  } catch {
    // 错误已处理
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  fetchLocations()
})
</script>

<template>
  <div class="home-locations-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>家庭位置管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd"> 添加位置 </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="locations" stripe>
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column label="坐标" width="180">
          <template #default="{ row }">
            {{ row.longitude?.toFixed(6) }}, {{ row.latitude?.toFixed(6) }}
          </template>
        </el-table-column>
        <el-table-column label="默认" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="success">默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.isDefault"
              type="primary"
              text
              :icon="Star"
              @click="handleSetDefault(row.id)"
            >
              设为默认
            </el-button>
            <el-button type="primary" text :icon="Edit" @click="handleEdit(row)"> 编辑 </el-button>
            <el-button type="danger" text :icon="Delete" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="如：家、公司" />
        </el-form-item>
        <el-form-item label="地址" required>
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input-number v-model="form.longitude" :precision="6" :min="-180" :max="180" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input-number v-model="form.latitude" :precision="6" :min="-90" :max="90" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click="handleSubmit"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.home-locations-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
