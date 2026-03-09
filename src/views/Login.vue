<template>
  <div class="login-page">
    <div class="login-card">
      <img :src="logo" alt="Zen Admin" class="logo" />
      <h1>Zen Admin</h1>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="username">Username</label>
          <InputText id="username" v-model="username" :disabled="loading" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <Password id="password" v-model="password" :feedback="false" :disabled="loading" toggleMask />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <Button type="submit" label="Log in" :loading="loading" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { AuthService } from '@/api'
import logo from '@/assets/images/zenlogo_nobackground_resized_md.png'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const response = await AuthService.login({
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('token', response.token)
    router.push('/todos')
  } catch {
    error.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--p-surface-50);
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 380px;
}

.logo {
  display: block;
  margin: 0 auto 1rem;
  max-width: 160px;
}

.login-card h1 {
  margin: 0 0 1.5rem;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
}

.field :deep(input),
.field :deep(.p-password) {
  width: 100%;
}

.error {
  color: var(--p-red-500, #ef4444);
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
}

form :deep(.p-button) {
  width: 100%;
}
</style>
