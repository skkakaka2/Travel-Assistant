<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NSpace, useMessage } from 'naive-ui'
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

const formRules = {
  username: { required: true, message: 'Please enter username', trigger: 'blur' },
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
  ],
  name: { required: true, message: 'Please enter your name', trigger: 'blur' },
}

async function handleRegister() {
  if (!formData.value.username || !formData.value.email || !formData.value.password || !formData.value.name) {
    message.warning('Please fill in all fields')
    return
  }

  loading.value = true
  try {
    await authStore.register(formData.value)
    message.success('Registration successful! Please login.')
    router.push('/login')
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NForm :model="formData" :rules="formRules" @submit.prevent="handleRegister">
      <NFormItem path="name" label="Full Name">
        <NInput
          v-model:value="formData.name"
          placeholder="Enter your full name"
          size="large"
          :input-props="{ autocomplete: 'name' }"
        />
      </NFormItem>

      <NFormItem path="username" label="Username">
        <NInput
          v-model:value="formData.username"
          placeholder="Choose a username"
          size="large"
          :input-props="{ autocomplete: 'username' }"
        />
      </NFormItem>

      <NFormItem path="email" label="Email">
        <NInput
          v-model:value="formData.email"
          placeholder="Enter your email"
          size="large"
          :input-props="{ autocomplete: 'email' }"
        />
      </NFormItem>

      <NFormItem path="password" label="Password">
        <NInput
          v-model:value="formData.password"
          type="password"
          placeholder="Create a password"
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
          Create Account
        </NButton>

        <div class="auth-footer">
          Already have an account?
          <RouterLink to="/login" class="auth-link">Sign in</RouterLink>
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

