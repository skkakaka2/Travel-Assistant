<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NSpace, useMessage } from 'naive-ui'
import type { FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores'
import type { RegisterDto } from '@/types/api'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const loading = ref(false)
const formData = ref<RegisterDto>({
  username: '',
  email: '',
  password: '',
  name: '',
})

const formRules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email' as const, message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少需要6个字符', trigger: 'blur' },
  ],
  name: { required: true, message: '请输入您的姓名', trigger: 'blur' },
}

async function handleRegister() {
  if (!formData.value.username || !formData.value.email || !formData.value.password || !formData.value.name) {
    message.warning('请填写所有字段')
    return
  }

  loading.value = true
  try {
    await authStore.register(formData.value)
    message.success('注册成功！请登录。')
    router.push('/login')
  } catch (error: any) {
    message.error(error?.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NForm :model="formData" :rules="formRules" @submit.prevent="handleRegister">
      <NFormItem path="name" label="全名">
        <NInput
          v-model:value="formData.name"
          placeholder="请输入您的全名"
          size="large"
          :input-props="{ autocomplete: 'name' }"
        />
      </NFormItem>

      <NFormItem path="username" label="用户名">
        <NInput
          v-model:value="formData.username"
          placeholder="选择一个用户名"
          size="large"
          :input-props="{ autocomplete: 'username' }"
        />
      </NFormItem>

      <NFormItem path="email" label="邮箱">
        <NInput
          v-model:value="formData.email"
          placeholder="请输入您的邮箱"
          size="large"
          :input-props="{ autocomplete: 'email' }"
        />
      </NFormItem>

      <NFormItem path="password" label="密码">
        <NInput
          v-model:value="formData.password"
          type="password"
          placeholder="创建密码"
          size="large"
          show-password-on="click"
          :input-props="{ autocomplete: 'new-password' }"
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
          创建账号
        </NButton>

        <div class="auth-footer">
          已有账号？
          <RouterLink to="/login" class="auth-link">登录</RouterLink>
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

