<template>
  <div class="space-y-4 p-2 sm:p-3">
    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-semibold text-blue-700">TEMPLATE CATEGORY LIST</p>
        <div class="flex w-full items-center gap-2 sm:w-auto">
          <input
            v-model="searchKeyword"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 sm:w-64"
            placeholder="Tìm category..."
            @keyup.enter="runSearch"
          />
          <button
            type="button"
            :disabled="isLoading"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click="runSearch"
          >
            <SearchOutlined />
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-3 py-3 text-left text-sm font-semibold text-slate-700">Category Code</th>
              <th class="px-3 py-3 text-left text-sm font-semibold text-slate-700">Category Name</th>
              <th class="px-3 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in categories"
              :key="`${item.CATEGORY_CODE ?? index}`"
              class="border-b border-slate-100 hover:bg-slate-50"
            >
              <td class="px-3 py-3 text-sm font-medium text-slate-900">{{ item.CATEGORY_CODE }}</td>
              <td class="px-3 py-3 text-sm text-slate-700">{{ item.CATEGORY_NAME }}</td>
              <td class="px-3 py-3 text-sm text-slate-700">
                <button
                  type="button"
                  class="flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                  @click="openDesigner(String(item.CATEGORY_CODE || ''))"
                >
                  <FileTextOutlined />
                  <span>Design</span>
                </button>
              </td>
            </tr>
            <tr v-if="!categories.length && !isLoading">
              <td colspan="3" class="px-3 py-6 text-center text-sm text-slate-500">Không có dữ liệu category.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { GetCategories, type CategoryItem } from '~/composables/AuthApi'

definePageMeta({
  layout: 'dashboard'
})

const categories = ref<Array<CategoryItem & { CATEGORY_CODE?: string; CATEGORY_NAME?: string }>>([])
const isLoading = ref(false)
const searchKeyword = ref('')

const loadCategories = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const response = await GetCategories(searchKeyword.value.trim(), 1, 100)
    categories.value = (response.Data?.Data || []) as Array<CategoryItem & { CATEGORY_CODE?: string; CATEGORY_NAME?: string }>
  } finally {
    isLoading.value = false
  }
}

const runSearch = async () => {
  await loadCategories()
}

const openDesigner = async (categoryCode: string) => {
  const normalized = categoryCode.trim()
  if (!normalized) return
  await navigateTo(`/templates/${encodeURIComponent(normalized)}`)
}

onMounted(async () => {
  await loadCategories()
})
</script>
