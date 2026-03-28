<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getExpense, createExpense, updateExpense } from '@/api/expense'
import { getTrips } from '@/api/trip'
import type { FormInstance, FormRules } from 'element-plus'
import type { ExpenseRequest } from '@/types/expense'
import type { Trip } from '@/types/trip'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const expenseId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const loading = ref(false)

const trips = ref<Trip[]>([])
const expenseTypes = [
  { value: 1, label: '油费', icon: '⛽' },
  { value: 2, label: '过路费', icon: '🛣️' },
  { value: 3, label: '停车费', icon: '🅿️' },
  { value: 4, label: '维修费', icon: '🔧' },
  { value: 5, label: '其他', icon: '💰' }
]

const form = reactive<ExpenseRequest>({
  tripId: undefined,
  type: 1,
  amount: 0,
  description: '',
  expenseTime: ''
})

const rules: FormRules = {
  type: [
    { required: true, message: '请选择费用类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ]
}

onMounted(async () => {
  // 获取行程列表
  const tripsRes = await getTrips()
  if (tripsRes.code === 200 && tripsRes.data) {
    trips.value = tripsRes.data.records || []
  }
  
  // 检查是否有tripId参数（从行程详情跳转）
  if (route.query.tripId) {
    form.tripId = Number(route.query.tripId)
  }
  
  // 编辑模式
  if (route.params.id) {
    isEdit.value = true
    expenseId.value = Number(route.params.id)
    const res = await getExpense(expenseId.value)
    if (res.code === 200 && res.data) {
      const expense = res.data
      form.tripId = expense.tripId
      form.type = expense.type
      form.amount = expense.amount
      form.description = expense.description || ''
      form.expenseTime = expense.expenseTime || ''
    }
  }
  
  // 默认时间
  if (!form.expenseTime) {
    form.expenseTime = new Date().toISOString()
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    if (isEdit.value && expenseId.value) {
      await updateExpense(expenseId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createExpense(form)
      ElMessage.success('创建成功')
    }
    router.push('/expenses')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/expenses')
}
</script>

<template>
  <div class="expense-form-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '💰 编辑费用' : '💰 新建费用' }}</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="expense-form"
      >
        <el-form-item label="关联行程">
          <el-select
            v-model="form.tripId"
            placeholder="选择行程（可选）"
            clearable
          >
            <el-option
              v-for="trip in trips"
              :key="trip.id"
              :label="trip.title || `${trip.startLocation} → ${trip.endLocation}`"
              :value="trip.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="费用类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button
              v-for="t in expenseTypes"
              :key="t.value"
              :value="t.value"
            >
              {{ t.icon }} {{ t.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="0.01"
            :precision="2"
            placeholder="输入金额"
          />
          <span class="unit">元</span>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            placeholder="费用描述（可选）"
          />
        </el-form-item>
        
        <el-form-item label="费用时间">
          <el-date-picker
            v-model="form.expenseTime"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
          />
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
.expense-form-page {
  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
  
  .expense-form {
    max-width: 600px;
    
    .unit {
      margin-left: 8px;
      color: #666;
    }
  }
}
</style>