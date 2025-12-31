<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NSpace, useMessage } from 'naive-ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
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
  username: { required: true, message: 'Please enter username', trigger: 'blur' },
  password: { required: true, message: 'Please enter password', trigger: 'blur' },
}

async function handleLogin() {
  if (!formData.value.username || !formData.value.password) {
    message.warning('Please fill in all fields')
    return
  }

  loading.value = true
  try {
    await authStore.login(formData.value)
    message.success('Login successful')
    router.push('/trips')
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <NForm :model="formData" :rules="formRules" @submit.prevent="handleLogin">
      <NFormItem path="username" label="Username">
        <NInput
          v-model:value="formData.username"
          placeholder="Enter your username"
          size="large"
          :input-props="{ autocomplete: 'username' }"
        />
      </NFormItem>

      <NFormItem path="password" label="Password">
        <NInput
          v-model:value="formData.password"
          type="password"
          placeholder="Enter your password"
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
          Sign In
        </NButton>

        <div class="auth-footer">
          Don't have an account?
          <RouterLink to="/register" class="auth-link">Sign up</RouterLink>
        </div>
      </NSpace>
    </NForm>
  </AuthLayout>
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

