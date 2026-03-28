<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getExpenseStatistics } from '@/api/expense'
import type { ExpenseStatistics } from '@/types/expense'
import { formatMoney } from '@/utils/format'

const statistics = ref<ExpenseStatistics | null>(null)
const loading = ref(false)

onMounted(async () => {
  await fetchStatistics()
})

async function fetchStatistics() {
  loading.value = true
  try {
    const res = await getExpenseStatistics()
    if (res.code === 200 && res.data) {
      statistics.value = res.data
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="expense-stats-page" v-loading="loading">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📊 费用统计</span>
        </div>
      </template>
      
      <div v-if="statistics" class="stats-content">
        <!-- 总金额 -->
        <div class="total-section">
          <div class="total-card">
            <div class="total-icon">💰</div>
            <div class="total-info">
              <div class="total-label">总费用</div>
              <div class="total-amount">{{ formatMoney(statistics.totalAmount) }}</div>
            </div>
          </div>
          <div class="count-card">
            <div class="count-icon">📝</div>
            <div class="count-info">
              <div class="count-label">记录数</div>
              <div class="count-value">{{ statistics.count }} 条</div>
            </div>
          </div>
        </div>
        
        <!-- 分类统计 -->
        <div class="category-section">
          <h4>分类统计</h4>
          <div class="category-list">
            <div class="category-item">
              <div class="category-icon">⛽</div>
              <div class="category-info">
                <div class="category-name">油费</div>
                <div class="category-amount">{{ formatMoney(statistics.fuelAmount) }}</div>
              </div>
              <div class="category-percent">
                {{ statistics.totalAmount > 0 ? Math.round(statistics.fuelAmount / statistics.totalAmount * 100) : 0 }}%
              </div>
            </div>
            
            <div class="category-item">
              <div class="category-icon">🛣️</div>
              <div class="category-info">
                <div class="category-name">过路费</div>
                <div class="category-amount">{{ formatMoney(statistics.tollAmount) }}</div>
              </div>
              <div class="category-percent">
                {{ statistics.totalAmount > 0 ? Math.round(statistics.tollAmount / statistics.totalAmount * 100) : 0 }}%
              </div>
            </div>
            
            <div class="category-item">
              <div class="category-icon">🅿️</div>
              <div class="category-info">
                <div class="category-name">停车费</div>
                <div class="category-amount">{{ formatMoney(statistics.parkingAmount) }}</div>
              </div>
              <div class="category-percent">
                {{ statistics.totalAmount > 0 ? Math.round(statistics.parkingAmount / statistics.totalAmount * 100) : 0 }}%
              </div>
            </div>
            
            <div class="category-item">
              <div class="category-icon">🔧</div>
              <div class="category-info">
                <div class="category-name">维修费</div>
                <div class="category-amount">{{ formatMoney(statistics.maintenanceAmount) }}</div>
              </div>
              <div class="category-percent">
                {{ statistics.totalAmount > 0 ? Math.round(statistics.maintenanceAmount / statistics.totalAmount * 100) : 0 }}%
              </div>
            </div>
            
            <div class="category-item">
              <div class="category-icon">💰</div>
              <div class="category-info">
                <div class="category-name">其他</div>
                <div class="category-amount">{{ formatMoney(statistics.otherAmount) }}</div>
              </div>
              <div class="category-percent">
                {{ statistics.totalAmount > 0 ? Math.round(statistics.otherAmount / statistics.totalAmount * 100) : 0 }}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EmptyState v-else icon="📊" text="暂无统计数据" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.expense-stats-page {
  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
  
  .stats-content {
    .total-section {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      
      .total-card, .count-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        background: linear-gradient(135deg, #FF6B35 0%, #FFD166 100%);
        border-radius: 12px;
        flex: 1;
        
        .total-icon, .count-icon {
          font-size: 48px;
        }
        
        .total-info, .count-info {
          color: white;
          
          .total-label, .count-label {
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .total-amount {
            font-size: 32px;
            font-weight: bold;
          }
          
          .count-value {
            font-size: 24px;
            font-weight: bold;
          }
        }
      }
      
      .count-card {
        background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      }
    }
    
    .category-section {
      h4 {
        font-size: 16px;
        margin-bottom: 16px;
      }
      
      .category-list {
        .category-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #eee;
          margin-bottom: 12px;
          
          .category-icon {
            font-size: 24px;
            margin-right: 16px;
          }
          
          .category-info {
            flex: 1;
            
            .category-name {
              font-size: 14px;
              color: #666;
              margin-bottom: 4px;
            }
            
            .category-amount {
              font-size: 18px;
              font-weight: bold;
              color: #FF6B35;
            }
          }
          
          .category-percent {
            font-size: 14px;
            color: #999;
            background: #FFF8F0;
            padding: 4px 12px;
            border-radius: 4px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .expense-stats-page .stats-content .total-section {
    flex-direction: column;
  }
}
</style>