<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'
import type { HomeLocationRequest } from '@/types/user'

const userStore = useUserStore()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)
const loading = ref(false)

const form = reactive<HomeLocationRequest>({
  name: '',
  address: '',
  longitude: 0,
  latitude: 0,
  isDefault: false
})

const rules: FormRules = {
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
}

onMounted(async () => {
  await userStore.getHomeLocations()
})

function openDialog(location?: { id: number; name: string; address: string; longitude: number; latitude: number; isDefault: boolean }) {
  if (location) {
    editingId.value = location.id
    form.name = location.name || ''
    form.address = location.address
    form.longitude = location.longitude || 0
    form.latitude = location.latitude || 0
    form.isDefault = location.isDefault
  } else {
    editingId.value = null
    form.name = ''
    form.address = ''
    form.longitude = 0
    form.latitude = 0
    form.isDefault = false
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    if (editingId.value) {
      await userStore.updateHomeLocation(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await userStore.addHomeLocation(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除这个家庭位置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  await userStore.deleteHomeLocation(id)
  ElMessage.success('删除成功')
}

async function handleSetDefault(id: number) {
  await userStore.setDefaultHomeLocation(id)
  ElMessage.success('已设置为默认')
}
</script>

<template>
  <div class="home-locations-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🏠 家庭位置管理</span>
          <el-button type="primary" @click="openDialog()">
            添加位置
          </el-button>
        </div>
      </template>
      
      <div v-if="userStore.homeLocations.length === 0" class="empty-state">
        <EmptyState
          icon="📍"
          text="暂无家庭位置"
          show-button
          button-text="添加位置"
          @action="openDialog()"
        />
      </div>
      
      <div v-else class="location-list">
        <div
          v-for="location in userStore.homeLocations"
          :key="location.id"
          class="location-item"
        >
          <div class="location-content">
            <div class="location-icon">📍</div>
            <div class="location-info">
              <div class="location-name">
                {{ location.name || '未命名' }}
                <el-tag v-if="location.isDefault" type="warning" size="small">
                  默认
                </el-tag>
              </div>
              <div class="location-address">{{ location.address }}</div>
            </div>
          </div>
          <div class="location-actions">
            <el-button
              v-if="!location.isDefault"
              type="primary"
              link
              @click="handleSetDefault(location.id)"
            >
              设为默认
            </el-button>
            <el-button type="primary" link @click="openDialog(location)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(location.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑家庭位置' : '添加家庭位置'"
      width="400px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：家、公司" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
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
    font-size: 18px;
    font-weight: bold;
  }
  
  .location-list {
    .location-item {
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
      
      .location-content {
        display: flex;
        align-items: center;
        
        .location-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .location-info {
          .location-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .location-address {
            font-size: 14px;
            color: #666;
          }
        }
      }
      
      .location-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>