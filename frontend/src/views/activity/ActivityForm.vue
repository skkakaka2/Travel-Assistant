<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createActivity } from '@/api/activity'
import type { FormInstance, FormRules } from 'element-plus'
import type { ActivityRequest } from '@/types/activity'

const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<ActivityRequest>({
  title: '',
  description: '',
  location: '',
  longitude: undefined,
  latitude: undefined,
  startTime: '',
  endTime: '',
  maxParticipants: undefined
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' }
  ]
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    await createActivity(form)
    ElMessage.success('创建成功')
    router.push('/activities')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/activities')
}
</script>

<template>
  <div class="activity-form-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🎉 创建活动</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="activity-form"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="例如：周末自驾游"
          />
        </el-form-item>
        
        <el-form-item label="活动描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="描述活动详情"
          />
        </el-form-item>
        
        <el-form-item label="活动地点">
          <el-input
            v-model="form.location"
            placeholder="例如：北京怀柔"
          />
        </el-form-item>
        
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="人数上限">
          <el-input-number
            v-model="form.maxParticipants"
            :min="1"
            placeholder="不限请留空"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            创建活动
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.activity-form-page {
  .card-header {
    font-size: 18px;
    font-weight: bold;
  }
  
  .activity-form {
    max-width: 600px;
  }
}
</style>