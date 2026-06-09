<template>
  <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
    <div class="mb-8">
      <img :src="logoImage" alt="CMMS XNKT" class="mb-4 h-14 w-auto rounded-md" />
      <p class="text-sm font-semibold text-blue-700">ĐĂNG NHẬP HỆ THỐNG</p>
      <h2 class="mt-2 text-3xl font-bold text-slate-900">Xin chào</h2>
      <p class="mt-2 text-sm text-slate-500">Vui lòng nhập thông tin tài khoản để tiếp tục.</p>
    </div>

    <form class="space-y-5" @submit.prevent="onLogin">
      <div>
        <label for="username" class="mb-2 block text-sm font-medium text-slate-700">Username</label>
        <input
          id="username"
          v-model="form.Username"
          type="text"
          autocomplete="username"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          placeholder="Nhập username"
          required
        />
      </div>

      <div>
        <label for="password" class="mb-2 block text-sm font-medium text-slate-700">Password</label>
        <div class="relative">
          <input
            id="password"
            v-model="form.Password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            placeholder="Nhập mật khẩu"
            required
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Ẩn' : 'Hiện' }}
          </button>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>
    </form>

    <div v-if="message" class="mt-5 rounded-xl px-4 py-3 text-sm" :class="messageClass">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Login, type LoginPayload } from '~/composables/AuthApi'
import logoImage from '~/assets/image/logo.png'

definePageMeta({
  layout: 'auth'
})

const form = reactive<LoginPayload>({
  Username: 'ADMIN',
  Password: 'Ingr.123'
})

const isLoading = ref(false) 
const showPassword = ref(false)
const message = ref('')
const isSuccess = ref(false)

const messageClass = computed(() =>
  isSuccess.value
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-red-200 bg-red-50 text-red-700'
)

const onLogin = async () => {
  if (isLoading.value) return
  isLoading.value = true
  message.value = ''
  isSuccess.value = false

  try {
    const username = form.Username.trim()
    const response = await Login({
      Username: username,
      Password: form.Password
    })

    if (response?.IsSuccess) {
      localStorage.setItem('loginResponse', JSON.stringify(response))
      localStorage.setItem('HttpStatus', String(response.HttpStatus))
      localStorage.setItem('IsSuccess', String(response.IsSuccess))
      localStorage.setItem('Data', JSON.stringify(response.Data))
      localStorage.setItem('AccessToken', response.Data.AccessToken)
      localStorage.setItem('ExpiresAt', response.Data.ExpiresAt)
      localStorage.setItem('RefreshToken', response.Data.RefreshToken)
      localStorage.setItem('RefreshTokenExpiresAt', response.Data.RefreshTokenExpiresAt)
      localStorage.setItem('Username', username)
      isSuccess.value = true
      await navigateTo('/home')
      return
    }

    message.value = 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.'
  } catch {
    message.value = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.'
  } finally {
    isLoading.value = false
  }
}
</script>
