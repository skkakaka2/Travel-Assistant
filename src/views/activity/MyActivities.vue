<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Close } from '@element-plus/icons-vue'
import { activityApi } from '@/api'
import type { ActivityVO, ActivityRequest, ActivityStatus } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const joinedActivities = ref<ActivityVO[]>([])
const createdActivities = ref<ActivityVO[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('创建活动')
const formLoading = ref(false)
const editId = ref<number | null>(null)
const activeTab = ref('joined')

const defaultForm: ActivityRequest = {
  title: '',
  description: '',
  location: '',
  longitude: undefined,
  latitude: undefined,
  startTime: '',
  endTime: '',
  maxParticipants: undefined,
}

const form = ref<ActivityRequest>({ ...defaultForm })

const getStatusType = (status: ActivityStatus) => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return types[status] || 'info'
}

const fetchActivities = async () => {
  loading.value = true
  try {
    const [joinedRes, createdRes] = await Promise.all([
      activityApi.getMyJoined(),
      activityApi.getMyCreated(),
    ])
    joinedActivities.value = joinedRes || []
    createdActivities.value = createdRes || []
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  editId.value = null
  dialogTitle.value = '创建活动'
  form.value = { ...defaultForm }
  dialogVisible.value = true
}

const handleEdit = (activity: ActivityVO) => {
  editId.value = activity.id
  dialogTitle.value = '编辑活动'
  form.value = {
    title: activity.title,
    description: activity.description || '',
    location: activity.location || '',
    longitude: activity.longitude,
    latitude: activity.latitude,
    startTime: activity.startTime || '',
    endTime: activity.endTime || '',
    maxParticipants: activity.maxParticipants || undefined,
  }
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这个活动吗？', '提示', {
    type: 'warning',
  })
  try {
    await activityApi.delete(id)
    ElMessage.success('删除成功')
    fetchActivities()
  } catch {
    // 错误已处理
  }
}

const handleCancel = async (id: number) => {
  await ElMessageBox.confirm('确定要取消这个活动吗？', '提示', {
    type: 'warning',
  })
  try {
    await activityApi.cancel(id)
    ElMessage.success('活动已取消')
    fetchActivities()
  } catch {
    // 错误已处理
  }
}

const handleQuit = async (id: number) => {
  try {
    await activityApi.quit(id)
    ElMessage.success('已退出活动')
    fetchActivities()
  } catch {
    // 错误已处理
  }
}

const handleSubmit = async () => {
  if (!form.value.title) {
    ElMessage.warning('请输入活动标题')
    return
  }

  formLoading.value = true
  try {
    if (editId.value) {
      await activityApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await activityApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchActivities()
  } catch {
    // 错误已处理
  } finally {
    formLoading.value = false
  }
}

const viewDetail = (id: number) => {
  router.push(`/activities/${id}`)
}

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="my-activities-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的活动</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate"> 创建活动 </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="我参与的" name="joined">
          <el-table v-loading="loading" :data="joinedActivities" stripe>
            <el-table-column prop="title" label="活动标题" min-width="150" />
            <el-table-column prop="location" label="地点" width="150">
              <template #default="{ row }">
                {{ row.location || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="时间" width="160">
              <template #default="{ row }">
                {{ row.startTime ? dayjs(row.startTime).format('YYYY-MM-DD HH:mm') : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.statusDesc }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" text @click="viewDetail(row.id)"> 详情 </el-button>
                <el-button
                  v-if="row.status === 0 || row.status === 1"
                  type="warning"
                  text
                  @click="handleQuit(row.id)"
                >
                  退出
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我创建的" name="created">
          <el-table v-loading="loading" :data="createdActivities" stripe>
            <el-table-column prop="title" label="活动标题" min-width="150" />
            <el-table-column prop="currentParticipants" label="参与人数" width="100">
              <template #default="{ row }">
                {{ row.currentParticipants }} / {{ row.maxParticipants || '不限' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.statusDesc }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" text @click="viewDetail(row.id)"> 详情 </el-button>
                <el-button
                  v-if="row.status === 0"
                  type="primary"
                  text
                  :icon="Edit"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === 0 || row.status === 1"
                  type="warning"
                  text
                  :icon="Close"
                  @click="handleCancel(row.id)"
                >
                  取消
                </el-button>
                <el-button
                  v-if="row.status === 0"
                  type="danger"
                  text
                  :icon="Delete"
                  @click="handleDelete(row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" rows="3" placeholder="活动描述" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.location" placeholder="活动地点" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="人数上限">
          <el-input-number v-model="form.maxParticipants" :min="1" />
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
.my-activities-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
