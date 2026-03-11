<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, DataAnalysis } from '@element-plus/icons-vue'
import { expenseApi, tripApi } from '@/api'
import type { ExpenseVO, ExpenseRequest, ExpenseType, ExpenseListParams, TripVO } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const expenses = ref<ExpenseVO[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('添加费用')
const formLoading = ref(false)
const editId = ref<number | null>(null)
const trips = ref<TripVO[]>([])

const params = ref<ExpenseListParams>({
  page: 1,
  size: 10,
})

const typeOptions = [
  { label: '全部', value: undefined },
  { label: '油费', value: 1 },
  { label: '过路费', value: 2 },
  { label: '停车费', value: 3 },
  { label: '维修费', value: 4 },
  { label: '其他', value: 5 },
]

const defaultForm: ExpenseRequest = {
  tripId: undefined,
  type: 1,
  amount: 0,
  description: '',
  expenseTime: new Date().toISOString(),
}

const form = ref<ExpenseRequest>({ ...defaultForm })

const fetchExpenses = async () => {
  loading.value = true
  try {
    const res = await expenseApi.getList(params.value)
    expenses.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const fetchTrips = async () => {
  try {
    const res = await tripApi.getList({ size: 100 })
    trips.value = res.data?.records || []
  } catch {
    // 错误已处理
  }
}

const handleSearch = () => {
  params.value.page = 1
  fetchExpenses()
}

const handlePageChange = (page: number) => {
  params.value.page = page
  fetchExpenses()
}

const handleAdd = () => {
  editId.value = null
  dialogTitle.value = '添加费用'
  form.value = { ...defaultForm, expenseTime: new Date().toISOString() }
  dialogVisible.value = true
}

const handleEdit = (expense: ExpenseVO) => {
  editId.value = expense.id
  dialogTitle.value = '编辑费用'
  form.value = {
    tripId: expense.tripId,
    type: expense.type,
    amount: expense.amount,
    description: expense.description || '',
    expenseTime: expense.expenseTime,
  }
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这条费用记录吗？', '提示', {
    type: 'warning',
  })
  try {
    await expenseApi.delete(id)
    ElMessage.success('删除成功')
    fetchExpenses()
  } catch {
    // 错误已处理
  }
}

const handleSubmit = async () => {
  if (!form.value.amount || form.value.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }

  formLoading.value = true
  try {
    if (editId.value) {
      await expenseApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await expenseApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchExpenses()
  } catch {
    // 错误已处理
  } finally {
    formLoading.value = false
  }
}

const goToStatistics = () => {
  router.push('/expenses/statistics')
}

onMounted(() => {
  fetchExpenses()
  fetchTrips()
})
</script>

<template>
  <div class="expense-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用列表</span>
          <div>
            <el-button type="default" :icon="DataAnalysis" @click="goToStatistics">
              费用统计
            </el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">
              添加费用
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="类型">
          <el-select
            v-model="params.type"
            placeholder="请选择类型"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="expenses" stripe>
        <el-table-column prop="typeDesc" label="类型" width="100" />
        <el-table-column prop="amount" label="金额(元)" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tripTitle" label="关联行程" min-width="150">
          <template #default="{ row }">
            {{ row.tripTitle || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="expenseTime" label="费用时间" width="180">
          <template #default="{ row }">
            {{ row.expenseTime ? dayjs(row.expenseTime).format('YYYY-MM-DD HH:mm') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" text :icon="Delete" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        :current-page="params.page"
        :page-size="params.size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="关联行程">
          <el-select v-model="form.tripId" placeholder="请选择行程" clearable>
            <el-option
              v-for="t in trips"
              :key="t.id"
              :label="t.title || `行程 #${t.id}`"
              :value="t.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option
              v-for="item in typeOptions.filter(i => i.value)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input-number v-model="form.amount" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" rows="2" placeholder="备注信息" />
        </el-form-item>
        <el-form-item label="费用时间">
          <el-date-picker
            v-model="form.expenseTime"
            type="datetime"
            placeholder="选择时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.expense-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .amount {
    color: #f56c6c;
    font-weight: bold;
  }
}
</style>