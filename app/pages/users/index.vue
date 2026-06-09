<template>
  <div class="relative">
    <Teleport to="body">
      <div
        v-if="message"
        class="fixed left-1/2 top-2 z-[120] flex w-[min(980px,calc(100vw-1rem))] -translate-x-1/2 items-center justify-between rounded-xl px-4 py-3 text-sm shadow-lg md:top-4 md:w-[min(980px,calc(100vw-8rem))]"
        :class="messageClass"
      >
        <span>{{ message }}</span>
        <button
          type="button"
          class="ml-4 rounded-xl border border-current px-3 py-1 text-xs font-semibold"
          @click="closeMessage"
        >
          OK
        </button>
      </div>
    </Teleport>

    <div class="space-y-4">
      <section class="flex min-h-[360px] flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:h-[calc(100vh-330px)]">
        <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm font-semibold text-blue-700">USER MANAGEMENT</p>
          <div class="flex w-full items-center gap-2 sm:w-auto">
          <input
            ref="searchInputRef"
            v-model="searchKeyword"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 sm:w-64"
            placeholder="Tìm username..."
            name="user-search-keyword"
            inputmode="search"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            data-lpignore="true"
            data-1p-ignore="true"
            :readonly="isSearchReadonly"
            @mousedown="onSearchMouseDown"
            @focus="isSearchReadonly = false"
            @blur="isSearchReadonly = true"
            @keyup.enter="runSearch"
          />
          <button
            type="button"
            :disabled="isLoading || isSubmitting"
            title="Tìm kiếm"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click="runSearch"
          >
            <SearchOutlined />
          </button>
        </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto pr-1">
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="px-3 py-3 text-left text-sm font-semibold text-slate-700">Username</th>
                  <th class="px-3 py-3 text-left text-sm font-semibold text-slate-700">IsActive</th>
                  <th class="px-3 py-3 text-left text-sm font-semibold text-slate-700">CreatedAt</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.Username"
                  class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                  :class="selectedUsername === user.Username ? 'bg-blue-50' : ''"
                  @click="onSelectUser(user)"
                >
                  <td class="px-3 py-3 text-sm font-medium text-slate-900">{{ user.Username }}</td>
                  <td class="px-3 py-3">
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-semibold"
                      :class="user.IsActive === 'Y' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                    >
                      {{ user.IsActive }}
                    </span>
                  </td>
                  <td class="px-3 py-3 text-sm text-slate-600">{{ formatDate(user.CreatedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm text-slate-600">
            Records: <span class="font-semibold text-slate-800">{{ totalCount }}</span> user
          </p>
          <div class="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              :disabled="isLoading || currentPage <= 1"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              @click="goToPage(currentPage - 1)"
            >
              <LeftOutlined />
            </button>
            <span class="text-sm font-medium text-slate-700">
              Pages {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              type="button"
              :disabled="isLoading || currentPage >= totalPages"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              @click="goToPage(currentPage + 1)"
            >
              <RightOutlined />
            </button>
            <select
              v-model.number="pageSize"
              class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-600"
              @change="onChangePageSize"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-lg sm:p-5">
        <div class="mb-4 flex items-center gap-2">
          <button
            type="button"
            title="Thêm mới"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
            @click="onAddNew"
          >
            <PlusOutlined />
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            title="Lưu"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click="saveRecord"
          >
            <SaveOutlined />
          </button>
          <button
            type="button"
            :disabled="isSubmitting || !selectedUsername"
            title="Xóa"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click="deleteRecord"
          >
            <DeleteOutlined />
          </button>
          <button
            type="button"
            title="Clear"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
            @click="clearForm"
          >
            <UndoOutlined />
          </button>
          <div class="ml-auto flex items-center gap-2">
            <button
              type="button"
              :disabled="isLoading || isSubmitting"
              title="Tải lại"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              @click="loadUsers"
            >
              <ReloadOutlined />
            </button>
            <button
              type="button"
              title="Đóng/Mở chi tiết"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
              @click="isDetailCollapsed = !isDetailCollapsed"
            >
              <DownOutlined v-if="isDetailCollapsed" />
              <UpOutlined v-else />
            </button>
          </div>
        </div>

        <h2 class="text-lg font-semibold text-slate-900">
          {{ formMode === 'create' ? 'Thêm bản ghi user mới' : `Chi tiết user: ${detailForm.Username}` }}
        </h2>

        <div v-if="!isDetailCollapsed" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input
              ref="detailUsernameInputRef"
              v-model="detailForm.Username"
              type="text"
              :disabled="formMode === 'edit'"
              name="create-user-name"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              data-lpignore="true"
              data-1p-ignore="true"
              :readonly="isDetailUsernameReadonly"
              @mousedown="onDetailUsernameMouseDown"
              @focus="isDetailUsernameReadonly = false"
              @blur="isDetailUsernameReadonly = true"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              placeholder="Nhập username"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">
              {{ formMode === 'create' ? 'Password' : 'NewPassword' }}
            </label>
            <input
              ref="detailPasswordInputRef"
              v-model="detailForm.PasswordOrNewPassword"
              type="text"
              name="user-secret-field"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              :readonly="isDetailPasswordReadonly"
              @mousedown="onDetailPasswordMouseDown"
              @focus="isDetailPasswordReadonly = false"
              @blur="isDetailPasswordReadonly = true"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              :placeholder="formMode === 'create' ? 'Nhập password' : 'Để trống nếu không đổi'"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">IsActive</label>
            <select
              v-model="detailForm.IsActive"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>

        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DeleteOutlined,
  DownOutlined,
  LeftOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SaveOutlined,
  SearchOutlined,
  UndoOutlined,
  UpOutlined
} from '@ant-design/icons-vue'
import {
  CreateUser,
  GetAllUsers,
  UpdateUser,
  type AuthUser
} from '~/composables/AuthApi'

definePageMeta({
  layout: 'dashboard'
})

const users = ref<AuthUser[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const message = ref('')
const isSuccess = ref(false)
const selectedUsername = ref('')
const isDetailCollapsed = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const isSearchReadonly = ref(true)
const searchInputRef = ref<HTMLInputElement | null>(null)
const isDetailUsernameReadonly = ref(true)
const isDetailPasswordReadonly = ref(true)
const detailUsernameInputRef = ref<HTMLInputElement | null>(null)
const detailPasswordInputRef = ref<HTMLInputElement | null>(null)

const detailForm = reactive({
  Username: '',
  PasswordOrNewPassword: '',
  IsActive: 'Y',
  CreatedAt: ''
})
let messageTimer: ReturnType<typeof setTimeout> | null = null

const messageClass = computed(() =>
  isSuccess.value
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-red-200 bg-red-50 text-red-700'
)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

const formatDate = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN')
}

const setMessage = (content: string, success: boolean) => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
  message.value = content
  isSuccess.value = success
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = null
  }, 3000)
}

const getApiErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data
  return responseData?.Data?.ErrorMessage || responseData?.ErrorMessage || responseData?.Message || fallback
}

const closeMessage = () => {
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
  message.value = ''
}

const getSelectedUser = () => users.value.find(user => user.Username === selectedUsername.value)

const fillDetailFromUser = (user: AuthUser) => {
  formMode.value = 'edit'
  detailForm.Username = user.Username
  detailForm.PasswordOrNewPassword = ''
  detailForm.IsActive = user.IsActive
  detailForm.CreatedAt = user.CreatedAt
}

const onSelectUser = (user: AuthUser) => {
  selectedUsername.value = user.Username
  fillDetailFromUser(user)
}

const onAddNew = () => {
  formMode.value = 'create'
  selectedUsername.value = ''
  detailForm.Username = ''
  detailForm.PasswordOrNewPassword = ''
  detailForm.IsActive = 'Y'
  detailForm.CreatedAt = ''
  isDetailCollapsed.value = false
}

const resetDetailForm = () => {
  const selectedUser = getSelectedUser()
  if (selectedUser) {
    fillDetailFromUser(selectedUser)
    return
  }
  onAddNew()
}

const loadUsers = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const response = await GetAllUsers(
      searchKeyword.value.trim(),
      currentPage.value,
      pageSize.value
    )
    users.value = response.Data?.Data || []
    totalCount.value = response.Data?.TotalCount || 0

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
      await loadUsers()
      return
    }

    if (!users.value.some(user => user.Username === selectedUsername.value)) {
      selectedUsername.value = ''
    }
    const selectedUser = getSelectedUser()
    if (selectedUser) {
      fillDetailFromUser(selectedUser)
    }
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Không tải được danh sách user.'), false)
  } finally {
    isLoading.value = false
  }
}

const saveRecord = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    const username = detailForm.Username.trim()
    const passwordOrNewPassword = detailForm.PasswordOrNewPassword.trim()

    if (!username) {
      setMessage('Vui lòng nhập Username.', false)
      return
    }

    if (formMode.value === 'create') {
      if (!passwordOrNewPassword) {
        setMessage('Vui lòng nhập Password cho user mới.', false)
        return
      }

      await CreateUser({
        Username: username,
        Password: passwordOrNewPassword,
        IsActive: detailForm.IsActive as "Y" | "N"
      })
      setMessage('Tạo user thành công.', true)
      await loadUsers()
      selectedUsername.value = username
      const createdUser = users.value.find(user => user.Username === username)
      if (createdUser) {
        fillDetailFromUser(createdUser)
      }
      return
    }

    await UpdateUser({
      Username: username,
      IsActive: detailForm.IsActive as "Y" | "N",
      NewPassword: passwordOrNewPassword
    })
    setMessage('Cập nhật user thành công.', true)
    await loadUsers()
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Lưu dữ liệu thất bại.'), false)
  } finally {
    isSubmitting.value = false
  }
}

const deleteRecord = async () => {
  const selectedUser = getSelectedUser()
  if (!selectedUser) {
    setMessage('Vui lòng chọn user trong danh sách.', false)
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await UpdateUser({
      Username: selectedUser.Username,
      IsActive: 'N',
      NewPassword: ''
    })
    setMessage('Đã xóa bản ghi (deactive user).', true)
    await loadUsers()
    onAddNew()
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Không thể xóa bản ghi.'), false)
  } finally {
    isSubmitting.value = false
  }
}

const clearForm = () => {
  formMode.value = 'create'
  selectedUsername.value = ''
  detailForm.Username = ''
  detailForm.PasswordOrNewPassword = ''
  detailForm.IsActive = 'Y'
  detailForm.CreatedAt = ''
  setMessage('Đã clear form.', true)
}

const runSearch = async () => {
  currentPage.value = 1
  await loadUsers()
}

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await loadUsers()
}

const onChangePageSize = async () => {
  currentPage.value = 1
  await loadUsers()
}

const onSearchMouseDown = (event: MouseEvent) => {
  if (!isSearchReadonly.value) return
  event.preventDefault()
  isSearchReadonly.value = false
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const onDetailUsernameMouseDown = (event: MouseEvent) => {
  if (!isDetailUsernameReadonly.value) return
  event.preventDefault()
  isDetailUsernameReadonly.value = false
  nextTick(() => {
    detailUsernameInputRef.value?.focus()
  })
}

const onDetailPasswordMouseDown = (event: MouseEvent) => {
  if (!isDetailPasswordReadonly.value) return
  event.preventDefault()
  isDetailPasswordReadonly.value = false
  nextTick(() => {
    detailPasswordInputRef.value?.focus()
  })
}

const onKeyDown = async (event: KeyboardEvent) => {
  const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'
  if (!isSaveShortcut) return
  event.preventDefault()
  if (isSubmitting.value) return
  await saveRecord()
}

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  onAddNew()
  await loadUsers()
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
  window.removeEventListener('keydown', onKeyDown)
})
</script>
