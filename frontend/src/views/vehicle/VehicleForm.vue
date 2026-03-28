<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVehicle, createVehicle, updateVehicle } from '@/api/vehicle'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const vehicleId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  model: '',
  fuelConsumption: 0
})

const rules: FormRules = {
  model: [
    { required: true, message: '请输入车型', trigger: 'blur' }
  ],
  fuelConsumption: [
    { type: 'number', min: 0, message: '油耗必须大于0', trigger: 'blur' }
  ]
}

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    vehicleId.value = Number(route.params.id)
    const res = await getVehicle(vehicleId.value)
    if (res.code === 200 && res.data) {
      form.model = res.data.model
      form.fuelConsumption = res.data.fuelConsumption || 0
    }
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    if (isEdit.value && vehicleId.value) {
      await updateVehicle(vehicleId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createVehicle(form)
      ElMessage.success('创建成功')
    }
    router.push('/vehicles')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/vehicles')
}
</script>

<template>
  <div class="vehicle-form-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '🚗 编辑车辆' : '🚗 新建车辆' }}</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="vehicle-form"
      >
        <el-form-item label="车型" prop="model">
          <el-input
            v-model="form.model"
            placeholder="例如：比亚迪秦PLUS DM-i"
          />
        </el-form-item>
        
        <el-form-item label="百公里油耗" prop="fuelConsumption">
          <el-input-number
            v-model="form.fuelConsumption"
            :min="0"
            :precision="1"
            placeholder="例如：7.5"
          />
          <span class="unit">L</span>
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
.vehicle-form-page {
  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
  
  .vehicle-form {
    max-width: 500px;
    
    .unit {
      margin-left: 8px;
      color: #666;
    }
  }
}
</style>