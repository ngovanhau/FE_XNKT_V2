<template>
  <div class="min-h-screen bg-slate-100">
    <div class="flex min-h-screen">
      <div
        class="flex"
        @mouseenter="openSidebarOnHover"
        @mouseleave="closeSidebarOnLeave"
      >
        <aside
          class="border-r border-slate-200 bg-white py-4 transition-all duration-300"
          :class="isSidebarOpen ? 'px-4' : 'px-3'"
          :style="{ width: `${currentSidebarWidth}px` }"
        >
          <div class="mb-4 flex items-center">
            <p v-show="isSidebarOpen" class="text-xs font-semibold tracking-[0.18em] text-slate-400">CMMS XNKT</p>
          </div>

          <nav class="space-y-2">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center rounded-xl px-3 py-2 text-sm font-medium transition"
              :class="[
                isSidebarOpen ? 'gap-2' : 'justify-center',
                route.path === item.to ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              ]"
            >
              <component :is="item.icon" class="text-base" />
              <span v-show="isSidebarOpen">{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </aside>
        <div
          class="group relative w-3 cursor-col-resize bg-transparent"
          @mousedown="startResize"
        >
          <div class="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-transparent transition group-hover:bg-blue-300" />
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col">
        <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div class="flex items-center gap-3">
            <img :src="logoImage" alt="CMMS XNKT" class="h-10 w-auto rounded-md" />
          </div>

          <div class="relative">
            <button
              type="button"
              class="flex h-12 w-48 items-center justify-center gap-3 rounded-xl bg-slate-100 px-4 text-left transition hover:bg-slate-200"
              @click="isUserMenuOpen = !isUserMenuOpen"
            >
              <div class="h-8 w-8 rounded-full bg-blue-700 text-center text-sm font-semibold leading-8 text-white">
                {{ userDisplay.charAt(0).toUpperCase() }}
              </div>
              <div class="flex items-center">
                <p class="mt-4 text-sm font-semibold leading-none text-slate-800">{{ userDisplay }}</p>
              </div>
            </button>

            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 top-14 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                @click="goToProfile"
              >
                Chỉnh sửa thông tin
              </button>
              <button
                type="button"
                class="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                @click="logout"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-auto pt-2 pr-2">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppstoreOutlined, FileTextOutlined, HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons-vue'
import logoImage from '~/assets/image/logo.png'

const route = useRoute()
const userDisplay = ref('ADMIN')
const isUserMenuOpen = ref(false)
const isSidebarOpen = ref(false)
const sidebarWidth = ref(180)
const isResizing = ref(false)

const currentSidebarWidth = computed(() => (isSidebarOpen.value ? sidebarWidth.value : 80))

const menuItems = [
  { label: 'Trang chủ', to: '/home', icon: HomeOutlined },
  { label: 'Category', to: '/categories', icon: AppstoreOutlined },
  { label: 'Dyn Header', to: '/dynamic-form-headers', icon: FileTextOutlined },
  { label: 'Option', to: '/options', icon: TagsOutlined },
  { label: 'User', to: '/users', icon: TeamOutlined }
]

onMounted(() => {
  const username = localStorage.getItem('Username')?.trim()
  if (username) {
    userDisplay.value = username
  }
})

const goToProfile = async () => {
  isUserMenuOpen.value = false
  await navigateTo('/profile')
}

const openSidebarOnHover = () => {
  isSidebarOpen.value = true
}

const closeSidebarOnLeave = () => {
  if (isResizing.value) return
  isSidebarOpen.value = false
}

const startResize = (event: MouseEvent) => {
  if (!isSidebarOpen.value) return
  isResizing.value = true
  event.preventDefault()
}

const onMouseMove = (event: MouseEvent) => {
  if (!isResizing.value || !isSidebarOpen.value) return
  const nextWidth = Math.min(420, Math.max(220, event.clientX))
  sidebarWidth.value = nextWidth
}

const onMouseUp = () => {
  if (!isResizing.value) return
  isResizing.value = false
}

const logout = async () => {
  localStorage.removeItem('loginResponse')
  localStorage.removeItem('HttpStatus')
  localStorage.removeItem('IsSuccess')
  localStorage.removeItem('Data')
  localStorage.removeItem('AccessToken')
  localStorage.removeItem('ExpiresAt')
  localStorage.removeItem('RefreshToken')
  localStorage.removeItem('RefreshTokenExpiresAt')
  localStorage.removeItem('Username')
  isUserMenuOpen.value = false
  await navigateTo('/')
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>
