<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { uploadAvatar } from '@/api/file'
import type { FormInstance, FormRules } from 'element-plus'

const userStore = useUserStore()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const avatarLoading = ref(false)

const form = reactive({
  nickname: '',
  phone: '',
  email: ''
})

const rules: FormRules = {
  nickname: [
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

onMounted(async () => {
  const res = await userStore.getProfile()
  if (res.code === 200 && userStore.profile) {
    form.nickname = userStore.profile.nickname || ''
    form.phone = userStore.profile.phone || ''
    form.email = userStore.profile.email || ''
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    const res = await userStore.updateProfile(form)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      // 同步更新auth store
      if (authStore.user) {
        authStore.user.nickname = form.nickname
      }
    }
  } catch {
    // 错误已处理
  } finally {
    loading.value = false
  }
}

async function handleAvatarChange(file: File) {
  avatarLoading.value = true
  try {
    const res = await uploadAvatar(file)
    if (res.code === 200 && res.data) {
      await userStore.updateAvatar(res.data.url)
      ElMessage.success('头像更新成功')
      // 同步更新auth store
      if (authStore.user) {
        authStore.user.avatar = res.data.url
      }
    }
  } catch {
    ElMessage.error('头像上传失败')
  } finally {
    avatarLoading.value = false
  }
  return false // 阻止自动上传
}
</script>

<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>👤 个人信息</span>
        </div>
      </template>
      
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="handleAvatarChange"
        >
          <el-avatar
            :size="100"
            :src="userStore.profile?.avatar"
            class="user-avatar"
          >
            <el-icon v-if="avatarLoading" class="is-loading"><Loading /></el-icon>
            <el-icon v-else><User /></el-icon>
          </el-avatar>
          <div class="avatar-tip">点击更换头像</div>
        </el-upload>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="profile-form"
      >
        <el-form-item label="用户名">
          <el-input
            :value="userStore.profile?.username"
            disabled
          />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  .profile-card {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .card-header {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
  
  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    
    .avatar-uploader {
      position: relative;
      
      .user-avatar {
        cursor: pointer;
        border: 3px solid #FF6B35;
      }
      
      .avatar-tip {
        text-align: center;
        font-size: 12px;
        color: #999;
        margin-top: 8px;
      }
    }
  }
  
  .profile-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}
</style>