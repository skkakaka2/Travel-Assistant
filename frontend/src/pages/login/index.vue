<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NSpace, useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores'
import type { LoginDto } from '@/types/api'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const loading = ref(false)
const formData = ref<LoginDto>({
  username: '',
  password: '',
})

const formRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

async function handleLogin() {
  if (!formData.value.username || !formData.value.password) {
    message.warning('请填写所有字段')
    return
  }

  loading.value = true
  try {
    await authStore.login(formData.value)
    message.success('登录成功')
    router.push('/trips')
  } catch (error: any) {
    message.error(error?.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NForm :model="formData" :rules="formRules" @submit.prevent="handleLogin">
      <NFormItem path="username" label="用户名">
        <NInput
          v-model:value="formData.username"
          placeholder="请输入用户名"
          size="large"
          :input-props="{ autocomplete: 'username' }"
        />
      </NFormItem>

      <NFormItem path="password" label="密码">
        <NInput
          v-model:value="formData.password"
          type="password"
          placeholder="请输入密码"
          size="large"
          show-password-on="click"
          :input-props="{ autocomplete: 'current-password' }"
        />
      </NFormItem>

      <NSpace vertical :size="16" style="margin-top: 24px">
        <NButton
          type="primary"
          block
          size="large"
          :loading="loading"
          attr-type="submit"
        >
          登录
        </NButton>

        <div class="auth-footer">
          还没有账号？
          <RouterLink to="/register" class="auth-link">注册</RouterLink>
        </div>
      </NSpace>
  </NForm>
</template>

<style scoped>
.auth-footer {
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.auth-link {
  color: var(--primary-color);
  font-weight: 500;
  margin-left: 4px;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>

