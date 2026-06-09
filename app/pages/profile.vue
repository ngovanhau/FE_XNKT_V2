<template>
  <div class="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p class="text-sm font-semibold text-blue-700">HỒ SƠ NGƯỜI DÙNG</p>
    <h1 class="mt-2 text-2xl font-bold text-slate-900">Chỉnh sửa thông tin</h1>
    <p class="mt-2 text-slate-600">Tài khoản hiện tại: <span class="font-semibold">{{ username }}</span></p>

    <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">Username</label>
        <input
          v-model="formUsername"
          type="text"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div class="flex items-end">
        <button
          type="button"
          class="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800"
          @click="saveProfile"
        >
          Lưu thông tin
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const username = ref('ADMIN')
const formUsername = ref('ADMIN')

onMounted(() => {
  const currentUsername = localStorage.getItem('Username')?.trim()
  if (currentUsername) {
    username.value = currentUsername
    formUsername.value = currentUsername
  }
})

const saveProfile = () => {
  const newUsername = formUsername.value.trim()
  if (!newUsername) return
  localStorage.setItem('Username', newUsername)
  username.value = newUsername
}
</script>
