<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Phone, Message, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
import { userApi, fileApi } from '@/api'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const profileForm = reactive({
  nickname: '',
  phone: '',
  email: '',
})

const rules: FormRules = {
  nickname: [
    { max: 50, message: '昵称最多 50 个字符', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
  ],
}

onMounted(() => {
  if (userStore.user) {
    profileForm.nickname = userStore.user.nickname || ''
    profileForm.phone = userStore.user.phone || ''
    profileForm.email = userStore.user.email || ''
  }
})

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await userApi.updateProfile(profileForm)
    userStore.user = res.data
    ElMessage.success('更新成功')
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

const handleUploadSuccess: UploadProps['onSuccess'] = async (response) => {
  if (response.code === 200) {
    try {
      await userApi.updateAvatar(response.data.url)
      if (userStore.user) {
        userStore.user.avatar = response.data.url
      }
      ElMessage.success('头像更新成功')
    } catch {
      // 错误已处理
    }
  }
}
</script>

<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <el-card class="avatar-card">
          <div class="avatar-wrapper">
            <el-avatar :size="120" :src="userStore.user?.avatar">
              {{ userStore.user?.nickname?.charAt(0) || 'U' }}
            </el-avatar>
            <el-upload
              :action="'/api/files/avatar'"
              :headers="{ Authorization: `Bearer ${userStore.token}` }"
              :show-file-list="false"
              accept="image/*"
              :on-success="handleUploadSuccess"
            >
              <el-button type="primary" text :icon="Upload">
                更换头像
              </el-button>
            </el-upload>
          </div>
          <div class="user-info">
            <h3>{{ userStore.user?.nickname || '用户' }}</h3>
            <p>@{{ userStore.user?.username }}</p>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card class="form-card">
          <template #header>
            <span>基本信息</span>
          </template>

          <el-form
            ref="formRef"
            :model="profileForm"
            :rules="rules"
            label-width="80px"
          >
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="profileForm.nickname"
                placeholder="请输入昵称"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="profileForm.phone"
                placeholder="请输入手机号"
                :prefix-icon="Phone"
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="profileForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSubmit">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  .avatar-card {
    text-align: center;

    .avatar-wrapper {
      padding: 20px 0;
    }

    .user-info {
      h3 {
        margin: 16px 0 8px;
        font-size: 20px;
      }

      p {
        margin: 0;
        color: #909399;
      }
    }
  }

  .form-card {
    @media (max-width: 768px) {
      margin-top: 20px;
    }
  }
}
</style>