<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExpenses, deleteExpense } from '@/api/expense'
import type { Expense } from '@/types/expense'
import { formatMoney, getExpenseTypeTag } from '@/utils/format'

const router = useRouter()

const expenses = ref<Expense[]>([])
const loading = ref(false)
const total = ref(0)

onMounted(async () => {
  await fetchExpenses()
})

async function fetchExpenses() {
  loading.value = true
  try {
    const res = await getExpenses()
    if (res.code === 200 && res.data) {
      expenses.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push('/expenses/create')
}

function handleStats() {
  router.push('/expenses/statistics')
}

function handleEdit(id: number) {
  router.push(`/expenses/${id}/edit`)
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除这条费用记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  loading.value = true
  try {
    await deleteExpense(id)
    ElMessage.success('删除成功')
    await fetchExpenses()
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="expense-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>💰 费用管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleStats">
              📊 统计
            </el-button>
            <el-button type="primary" @click="handleCreate">
              新建费用
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="expenses.length === 0 && !loading" class="empty-state">
        <EmptyState
          icon="💰"
          text="暂无费用记录"
          show-button
          button-text="新建费用"
          @action="handleCreate"
        />
      </div>
      
      <el-table v-else :data="expenses" v-loading="loading" stripe>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <span class="expense-type">
              {{ getExpenseTypeTag(row.type).icon }}
              {{ getExpenseTypeTag(row.type).text }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="expense-amount">{{ formatMoney(row.amount) }}</span>
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
            {{ row.expenseTime }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
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
.expense-list-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .expense-type {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .expense-amount {
    font-weight: bold;
    color: #FF6B35;
  }
}
</style>