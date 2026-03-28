<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  nickname: [
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  
  loading.value = true
  try {
    const res = await authStore.register({
      username: form.username,
      password: form.password,
      nickname: form.nickname,
      phone: form.phone
    })
    
    if (res.code === 200) {
      ElMessage.success('注册成功')
      router.push('/')
    }
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-icon">🧭</div>
        <h1 class="logo-title">注册账号</h1>
        <p class="logo-desc">加入旅行助手，探索精彩旅程</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="register-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名（必填）"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码（必填）"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="昵称（选填）"
            size="large"
            prefix-icon="Avatar"
          />
        </el-form-item>
        
        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="手机号（选填）"
            size="large"
            prefix-icon="Phone"
          />
        </el-form-item>
        
        <el-button
          type="primary"
          size="large"
          round
          class="register-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          注册
        </el-button>
      </el-form>
      
      <div class="register-footer">
        <span>已有账号？</span>
        <el-button type="text" @click="goLogin">立即登录</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%);
}

.register-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
  
  .logo-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .logo-title {
    font-size: 28px;
    color: #FF6B35;
    margin-bottom: 8px;
  }
  
  .logo-desc {
    font-size: 14px;
    color: #999;
  }
}

.register-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .register-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    margin-top: 8px;
  }
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  color: #999;
  
  .el-button--text {
    color: #FF6B35;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .register-card {
    width: 100%;
    max-width: 360px;
    padding: 24px;
  }
}
</style>