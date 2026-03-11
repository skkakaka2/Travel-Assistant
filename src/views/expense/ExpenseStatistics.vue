<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { expenseApi } from '@/api'
import type { ExpenseStatisticsVO } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const statistics = ref<ExpenseStatisticsVO | null>(null)

const dateRange = ref<[string, string]>([
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD'),
])

const fetchStatistics = async () => {
  loading.value = true
  try {
    const res = await expenseApi.getStatistics()
    statistics.value = res.data
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const fetchPeriodStatistics = async () => {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) return

  loading.value = true
  try {
    const res = await expenseApi.getStatisticsByPeriod(
      dayjs(dateRange.value[0]).startOf('day').toISOString(),
      dayjs(dateRange.value[1]).endOf('day').toISOString()
    )
    statistics.value = res.data
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleDateChange = () => {
  fetchPeriodStatistics()
}

onMounted(() => {
  fetchStatistics()
})
</script>

<template>
  <div class="expense-statistics-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用统计</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </div>
      </template>

      <div v-loading="loading" class="statistics-content">
        <!-- 总览 -->
        <el-row :gutter="20" class="overview">
          <el-col :xs="12" :sm="8" :md="4">
            <div class="stat-card total">
              <div class="stat-value">¥{{ statistics?.totalAmount?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">总费用</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="stat-card">
              <div class="stat-value">{{ statistics?.count || 0 }}</div>
              <div class="stat-label">记录笔数</div>
            </div>
          </el-col>
        </el-row>

        <!-- 分类统计 -->
        <el-row :gutter="20" class="category-stats">
          <el-col :xs="12" :sm="8" :md="4">
            <div class="stat-card fuel">
              <div class="stat-value">¥{{ statistics?.fuelAmount?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">油费</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="stat-card toll">
              <div class="stat-value">¥{{ statistics?.tollAmount?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">过路费</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="stat-card parking">
              <div class="stat-value">¥{{ statistics?.parkingAmount?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">停车费</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="stat-card maintenance">
              <div class="stat-value">¥{{ statistics?.maintenanceAmount?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">维修费</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="4">
            <div class="stat-card other">
              <div class="stat-value">¥{{ statistics?.otherAmount?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">其他</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.expense-statistics-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .statistics-content {
    .overview {
      margin-bottom: 30px;
    }

    .stat-card {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-bottom: 16px;

      &.total {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        color: #fff;

        .stat-label {
          color: rgba(255, 255, 255, 0.9);
        }
      }

      &.fuel {
        border-left: 4px solid #67c23a;
      }

      &.toll {
        border-left: 4px solid #e6a23c;
      }

      &.parking {
        border-left: 4px solid #409eff;
      }

      &.maintenance {
        border-left: 4px solid #f56c6c;
      }

      &.other {
        border-left: 4px solid #909399;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}
</style>