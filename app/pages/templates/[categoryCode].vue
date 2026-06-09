<template>
  <div class="relative space-y-4 p-2 sm:p-3">
    <Teleport to="body">
      <div
        v-if="message"
        class="fixed left-1/2 top-2 z-[120] flex w-[min(1000px,calc(100vw-1rem))] -translate-x-1/2 items-center justify-between rounded-xl px-4 py-3 text-sm shadow-lg md:top-4 md:w-[min(1000px,calc(100vw-8rem))]"
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
    <Teleport to="body">
      <div
        v-if="deleteConfirmNodeId"
        class="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/35 p-4"
      >
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <p class="text-sm font-semibold text-slate-900">Xác nhận xóa</p>
          <p class="mt-2 text-sm text-slate-600">
            Bạn có chắc muốn xóa "{{ deleteConfirmNodeName || 'New Column' }}" và toàn bộ node con?
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              @click="cancelDeleteConfirm"
            >
              Hủy
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
              @click="confirmDeleteNode"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <section class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
          title="Back"
          @click="goBack"
        >
          <ArrowLeftOutlined />
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          title="Add Root"
          @click="addRootNode"
        >
          <PlusOutlined />
          <span>Root</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          :disabled="!selectedNode"
          title="Add Child"
          @click="addChildFromSelection"
        >
          <PlusOutlined />
          <span>Child</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          :disabled="!selectedNode"
          title="Add Sibling"
          @click="addSiblingFromSelection"
        >
          <PlusOutlined />
          <span>Sibling</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-red-300 px-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed"
          :disabled="!selectedNode"
          title="Delete"
          @click="deleteFromSelection"
        >
          <DeleteOutlined />
          <span>Delete</span>
        </button>
        <button
          type="button"
          class="ml-auto flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          :disabled="isLoading || isSaving"
          title="Reload"
          @click="loadTemplate"
        >
          <ReloadOutlined />
          <span>Reload</span>
        </button>
        <button
          type="button"
          :disabled="isLoading || isSaving"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          title="Save"
          @click="saveTemplate"
        >
          <SaveOutlined />
          <span>Save</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          title="Toggle Properties"
          @click="isPropertiesVisible = !isPropertiesVisible"
        >
          <EyeInvisibleOutlined v-if="isPropertiesVisible" />
          <EyeOutlined v-else />
          <span>{{ isPropertiesVisible ? 'Hide Properties' : 'Show Properties' }}</span>
        </button>
      </div>
      <h1 class="text-sm font-semibold text-slate-900">Template Designer - {{ categoryCode }}</h1>
    </section>

    <section class="grid grid-cols-1 gap-4" :class="isPropertiesVisible ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : ''">
      <div class="space-y-3">
        <section class="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <p class="mb-2 text-xs font-semibold text-blue-700">HEADER PARENT</p>
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-700">Template Name</label>
              <input
                v-model="templateName"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                placeholder="Nhập template name"
              />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-700">Table Title</label>
              <input
                v-model="headerParentText"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                placeholder="Nhập table title"
              />
            </div>
          </div>
        </section>

        <section class="grid h-[calc(100vh-330px)] min-h-[480px] grid-cols-1 gap-4 2xl:grid-cols-2">
          <div class="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="mb-3 text-sm font-semibold text-blue-700">DESIGN CANVAS</p>
            <div class="min-h-0 flex-1 overflow-y-auto pr-1">
              <div v-if="headerChildren.length" class="space-y-3">
                <TreeNodeEditor
                  v-for="node in sortedHeaderChildren"
                  :key="node._id"
                  :node="node"
                  :level="0"
                  :used-source-field-counts="usedSourceFieldCounts"
                  :duplicate-source-fields="duplicateSourceFields"
                  :source-options="sourceFieldOptions"
                  :selected-node-id="selectedNodeId"
                  @add-child="addChildNode"
                  @add-sibling="addSiblingNode"
                  @delete-node="deleteNode"
                  @changed="handleNodeChanged"
                  @select="onSelectNode"
                  @drag-start="onDragStartNode"
                  @drop-on="onDropOnNode"
                />
              </div>
              <div v-else class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Chưa có cột nào. Nhấn Root để bắt đầu.
              </div>
            </div>
          </div>

          <div class="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="mb-3 text-sm font-semibold text-blue-700">PREVIEW TABLE</p>
            <div class="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200">
              <table class="min-w-full border-collapse table-fixed">
                <colgroup v-if="leafColumns.length">
                  <col
                    v-for="leaf in leafColumns"
                    :key="`col-${leaf._id}`"
                    :style="getLeafWidthStyle(leaf)"
                  />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      class="border border-slate-300 bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-900"
                      :colspan="Math.max(leafColumns.length, 1)"
                    >
                      {{ headerParentText || 'TABLE TITLE' }}
                    </th>
                  </tr>
                  <tr v-for="(row, rowIndex) in previewRows" :key="`header-row-${rowIndex}`">
                    <th
                      v-for="cell in row"
                      :key="cell.node._id"
                      class="border border-slate-300 bg-white px-2 py-2 text-center text-sm font-medium text-slate-800"
                      :colspan="cell.colspan"
                      :rowspan="cell.rowspan"
                      :style="getHeaderCellStyle(cell.node)"
                    >
                      {{ cell.node.text || 'New Column' }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!leafColumns.length">
                    <td class="border border-slate-300 px-3 py-3 text-center text-sm text-slate-500">
                      Chưa có cột để preview.
                    </td>
                  </tr>
                  <tr v-for="emptyRow in 5" :key="`empty-row-${emptyRow}`" v-else>
                    <td
                      v-for="leaf in leafColumns"
                      :key="`${leaf._id}-${emptyRow}`"
                      class="h-8 border border-slate-300 bg-white"
                      :style="getBodyCellStyle(leaf)"
                    />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <aside v-if="isPropertiesVisible" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="mb-3 text-sm font-semibold text-blue-700">PROPERTIES</p>
        <div v-if="selectedNode" class="space-y-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">Header Text</label>
            <input
              v-model="selectedNode.text"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
              @input="handleNodeChanged"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">Source Field</label>
            <select
              v-model="selectedNode.sourceField"
              :disabled="selectedNode.children.length > 0"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-blue-600"
              @change="handleNodeChanged"
            >
              <option :value="null">-- Select --</option>
              <option
                v-for="option in sourceFieldOptions"
                :key="option.value"
                :value="option.value"
                :disabled="isSourceOptionDisabled(option.value, selectedNode)"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600">Width</label>
              <input
                v-model.number="selectedNode.width"
                type="number"
                min="1"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                @input="handleNodeChanged"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600">Align</label>
              <select
                v-model="selectedNode.align"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                @change="handleNodeChanged"
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600">Display Order</label>
              <input
                v-model.number="selectedNode.displayOrder"
                type="number"
                min="1"
                disabled
                class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div v-if="selectedNode.sourceField && selectedNode.sourceField.startsWith('UDF')" class="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
            <label class="mb-2 block text-xs font-semibold text-blue-800">UDF Data Type</label>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input type="radio" v-model="selectedNode.dataType" value="text" class="accent-blue-600" @change="handleNodeChanged" /> Text
              </label>
              <label class="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input type="radio" v-model="selectedNode.dataType" value="number" class="accent-blue-600" @change="handleNodeChanged" /> Number
              </label>
              <label class="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input type="radio" v-model="selectedNode.dataType" value="option" class="accent-blue-600" @change="handleNodeChanged" /> Option
              </label>
            </div>
            
            <div v-if="selectedNode.dataType === 'option'" class="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Option Type Code</label>
                <select
                  v-model="selectedNode.optionalType"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  @change="handleNodeChanged"
                >
                  <option :value="null">-- Select Option Type --</option>
                  <option v-for="opt in formattedTypeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Selection Mode</label>
                <select
                  v-model="selectedNode.optionSelectionMode"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  @change="handleNodeChanged"
                >
                  <option value="single">single (chon 1)</option>
                  <option value="multiple">multiple (chon nhieu)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
          Chọn một node bên trái để chỉnh thuộc tính.
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons-vue'
import TreeNodeEditor from '~/components/template-designer/TreeNodeEditor.vue'
import {
  GetTemplateByCategory,
  SaveTemplate,
  GetTypeOptionsPaged,
  type TemplateHeaderNode
} from '~/composables/AuthApi'

definePageMeta({
  layout: 'dashboard'
})

interface DesignerNode {
  _id: string
  headerId: number | null
  text: string
  sourceField: string | null
  width: number | null
  align: 'left' | 'center' | 'right' | null
  displayOrder: number
  dataType?: 'text' | 'number' | 'option' | string | null
  optionalType?: string | null
  optionSelectionMode?: 'single' | 'multiple' | string | null
  children: DesignerNode[]
}

const route = useRoute()
const categoryCode = computed(() => String(route.params.categoryCode ?? '').trim().toUpperCase())

const templateId = ref(0)
const templateName = ref('')
const headerParentText = ref('')
const headerChildren = ref<DesignerNode[]>([])
const selectedNodeId = ref('')
const isPropertiesVisible = ref(false)
const draggedNodeId = ref('')
const deleteConfirmNodeId = ref('')
const deleteConfirmNodeName = ref('')

const isLoading = ref(false)
const isSaving = ref(false)
const message = ref('')
const isSuccess = ref(false)
let messageTimer: ReturnType<typeof setTimeout> | null = null

const typeOptionsData = ref<any[]>([])

const formattedTypeOptions = computed(() => {
  return typeOptionsData.value.map(opt => {
    if (typeof opt === 'string') return { value: opt, label: opt }
    const val = opt?.optional_TYPE || opt?.optionalType || opt?.typeCode || opt?.TYPE_CODE || opt?.id || opt?.ID || opt?.value || ''
    const lbl = opt?.description || opt?.DESCRIPTION || opt?.typeName || opt?.TYPE_NAME || opt?.name || opt?.NAME || opt?.label || val
    return { value: val, label: lbl }
  }).filter(o => o.value)
})

const loadTypeOptions = async () => {
  try {
    const response = await GetTypeOptionsPaged(1, 200, '')
    const payload = response?.data || {}
    typeOptionsData.value = Array.isArray(payload?.data) ? payload.data : []
  } catch (error) {
    console.error('Failed to load type options', error)
  }
}

const sourceFieldOptions = [
  { value: 'NO', label: 'NO - Row Number' },
  { value: 'TAGNAME', label: 'TAGNAME - Equipment Tag' },
  { value: 'DESCRIPTION', label: 'DESCRIPTION - Description' },
  { value: 'LOCATION', label: 'LOCATION - Location' },
  { value: 'UDF1', label: 'UDF1' },
  { value: 'UDF2', label: 'UDF2' },
  { value: 'UDF3', label: 'UDF3' },
  { value: 'UDF4', label: 'UDF4' },
  { value: 'UDF5', label: 'UDF5' },
  { value: 'UDF6', label: 'UDF6' },
  { value: 'UDF7', label: 'UDF7' },
  { value: 'UDF8', label: 'UDF8' },
  { value: 'UDF9', label: 'UDF9' },
  { value: 'UDF10', label: 'UDF10' },
  { value: 'UDF11', label: 'UDF11' },
  { value: 'UDF12', label: 'UDF12' },
  { value: 'UDF13', label: 'UDF13' },
  { value: 'UDF14', label: 'UDF14' },
  { value: 'UDF15', label: 'UDF15' }
]

const ALLOWED_SOURCE_FIELDS = new Set(sourceFieldOptions.map(option => option.value))

const messageClass = computed(() =>
  isSuccess.value
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-red-200 bg-red-50 text-red-700'
)

const sortedHeaderChildren = computed(() =>
  [...headerChildren.value].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
)
const selectedNode = computed(() => findNodeById(headerChildren.value, selectedNodeId.value))

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

const closeMessage = () => {
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
  message.value = ''
}

const getApiErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data
  return responseData?.Data?.ErrorMessage || responseData?.message || responseData?.Message || fallback
}

const extractTemplateData = (response: any) => {
  return response?.data || response?.Data || response || null
}

const createNode = (displayOrder: number): DesignerNode => ({
  _id: crypto.randomUUID(),
  headerId: null,
  text: 'New Column',
  sourceField: null,
  width: 100,
  align: 'center',
  displayOrder,
  dataType: 'text',
  optionalType: null,
  optionSelectionMode: 'single',
  children: []
})

const normalizeOptionSelectionMode = (node: any): 'single' | 'multiple' => {
  const rawMode = node?.optionSelectionMode
    ?? node?.OptionSelectionMode
    ?? node?.option_selection_mode
    ?? node?.OPTION_SELECTION_MODE
    ?? node?.Option_Selection_Mode
    ?? ''
  return String(rawMode).trim().toLowerCase() === 'multiple' ? 'multiple' : 'single'
}

const toDesignerNode = (node: TemplateHeaderNode): DesignerNode => ({
  _id: crypto.randomUUID(),
  headerId: node.headerId ?? null,
  text: String(node.text ?? ''),
  sourceField: node.sourceField ? String(node.sourceField).toUpperCase() : null,
  width: typeof node.width === 'number' ? node.width : null,
  align: node.align ?? null,
  displayOrder: Number(node.displayOrder ?? 1),
  dataType: node.dataType || 'text',
  optionalType: node.optionalType || null,
  optionSelectionMode: normalizeOptionSelectionMode(node),
  children: [...(node.children || [])]
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map(toDesignerNode)
})

const normalizeTree = (nodes: DesignerNode[]) => {
  nodes.forEach((node, index) => {
    node.displayOrder = index + 1
    if (node.children.length > 0) {
      node.sourceField = null
    } else if (node.sourceField) {
      node.sourceField = node.sourceField.trim().toUpperCase()
    }
    if (node.width !== null) {
      const nextWidth = Number(node.width)
      node.width = Number.isFinite(nextWidth) && nextWidth > 0 ? nextWidth : null
    }
    if (!['left', 'center', 'right'].includes(String(node.align))) {
      node.align = 'center'
    }
    const dataType = String(node.dataType || 'text').toLowerCase()
    node.dataType = dataType === 'number' || dataType === 'option' ? dataType : 'text'
    if (node.dataType === 'option') {
      node.optionalType = node.optionalType ? String(node.optionalType).trim().toUpperCase() : null
      node.optionSelectionMode = node.optionSelectionMode === 'multiple' ? 'multiple' : 'single'
    } else {
      node.optionalType = null
      node.optionSelectionMode = 'single'
    }
    normalizeTree(node.children)
  })
}

const findNodeContainer = (
  nodes: DesignerNode[],
  targetId: string
): { container: DesignerNode[]; index: number; parent: DesignerNode | null } | null => {
  for (const [index, node] of nodes.entries()) {
    if (!node) continue
    if (node._id === targetId) {
      return { container: nodes, index, parent: null }
    }
    const childResult = findNodeInChildren(node, targetId)
    if (childResult) {
      return childResult
    }
  }
  return null
}

const findNodeInChildren = (
  parent: DesignerNode,
  targetId: string
): { container: DesignerNode[]; index: number; parent: DesignerNode | null } | null => {
  for (const [index, child] of parent.children.entries()) {
    if (!child) continue
    if (child._id === targetId) {
      return { container: parent.children, index, parent }
    }
    const nestedResult = findNodeInChildren(child, targetId)
    if (nestedResult) {
      return nestedResult
    }
  }
  return null
}

const addRootNode = () => {
  const newNode = createNode(headerChildren.value.length + 1)
  headerChildren.value.push(newNode)
  normalizeTree(headerChildren.value)
  selectedNodeId.value = newNode._id
}

const addChildNode = (targetNode: DesignerNode) => {
  if (targetNode.children.length === 0 && targetNode.sourceField) {
    targetNode.sourceField = null
    setMessage('Source field cleared because this node now has children', false)
  }
  const newNode = createNode(targetNode.children.length + 1)
  targetNode.children.push(newNode)
  normalizeTree(headerChildren.value)
  selectedNodeId.value = newNode._id
}

const addSiblingNode = (targetNode: DesignerNode) => {
  const found = findNodeContainer(headerChildren.value, targetNode._id)
  if (!found) return
  const newNode = createNode(found.container.length + 1)
  found.container.splice(found.index + 1, 0, newNode)
  normalizeTree(headerChildren.value)
  selectedNodeId.value = newNode._id
}

const performDeleteNode = (targetNode: DesignerNode) => {
  const found = findNodeContainer(headerChildren.value, targetNode._id)
  if (!found) return
  found.container.splice(found.index, 1)
  normalizeTree(headerChildren.value)
  if (selectedNodeId.value === targetNode._id) {
    selectedNodeId.value = found.parent?._id || ''
  }
  if (found.parent && found.parent.children.length === 0) {
    setMessage('Please assign a Source Field to this leaf node', false)
  }
}

const deleteNode = (targetNode: DesignerNode) => {
  deleteConfirmNodeId.value = targetNode._id
  deleteConfirmNodeName.value = targetNode.text || 'New Column'
}

const cancelDeleteConfirm = () => {
  deleteConfirmNodeId.value = ''
  deleteConfirmNodeName.value = ''
}

const confirmDeleteNode = () => {
  if (!deleteConfirmNodeId.value) return
  const targetNode = findNodeById(headerChildren.value, deleteConfirmNodeId.value)
  cancelDeleteConfirm()
  if (!targetNode) return
  performDeleteNode(targetNode)
}

const handleNodeChanged = () => {
  normalizeTree(headerChildren.value)
}

const onSelectNode = (targetNode: DesignerNode) => {
  selectedNodeId.value = targetNode._id
}

const onDragStartNode = (targetNode: DesignerNode) => {
  draggedNodeId.value = targetNode._id
}

const onDropOnNode = (targetNode: DesignerNode) => {
  if (!draggedNodeId.value || draggedNodeId.value === targetNode._id) return

  const source = findNodeContainer(headerChildren.value, draggedNodeId.value)
  const target = findNodeContainer(headerChildren.value, targetNode._id)
  if (!source || !target) {
    draggedNodeId.value = ''
    return
  }

  const movingNode = source.container[source.index]
  if (!movingNode) {
    draggedNodeId.value = ''
    return
  }

  const isTargetInsideMovingNode = findNodeById(movingNode.children, targetNode._id) !== null
  if (isTargetInsideMovingNode) {
    setMessage('Không thể kéo node cha vào bên trong node con của chính nó.', false)
    draggedNodeId.value = ''
    return
  }

  source.container.splice(source.index, 1)
  const targetContainer = source.container === target.container ? source.container : target.container
  const targetIndex = targetContainer.findIndex(node => node._id === targetNode._id)
  if (targetIndex < 0) {
    targetContainer.push(movingNode)
  } else {
    targetContainer.splice(targetIndex, 0, movingNode)
  }

  normalizeTree(headerChildren.value)
  selectedNodeId.value = movingNode._id
  draggedNodeId.value = ''
}

const findNodeById = (nodes: DesignerNode[], targetId: string): DesignerNode | null => {
  if (!targetId) return null
  for (const node of nodes) {
    if (node._id === targetId) {
      return node
    }
    const nested = findNodeById(node.children, targetId)
    if (nested) {
      return nested
    }
  }
  return null
}

const addChildFromSelection = () => {
  if (!selectedNode.value) return
  addChildNode(selectedNode.value)
}

const addSiblingFromSelection = () => {
  if (!selectedNode.value) return
  addSiblingNode(selectedNode.value)
}

const deleteFromSelection = () => {
  if (!selectedNode.value) return
  deleteNode(selectedNode.value)
}

const collectLeafNodes = (nodes: DesignerNode[]): DesignerNode[] => {
  const leaves: DesignerNode[] = []
  const traverse = (node: DesignerNode) => {
    if (node.children.length === 0) {
      leaves.push(node)
      return
    }
    node.children.forEach(traverse)
  }
  nodes.forEach(traverse)
  return leaves
}

const leafColumns = computed(() => collectLeafNodes(sortedHeaderChildren.value))

const usedSourceFieldCounts = computed(() => {
  const counts: Record<string, number> = {}
  leafColumns.value.forEach((leaf) => {
    const key = leaf.sourceField?.trim().toUpperCase()
    if (!key) return
    counts[key] = (counts[key] || 0) + 1
  })
  return counts
})

const duplicateSourceFields = computed(() =>
  Object.entries(usedSourceFieldCounts.value)
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
)

const totalLeafWidth = computed(() =>
  leafColumns.value.reduce((total, leaf) => total + Math.max(1, Number(leaf.width) || 0), 0)
)

const getLeafWidthStyle = (leaf: DesignerNode) => {
  if (!leafColumns.value.length || !totalLeafWidth.value) return {}
  const normalizedWidth = Math.max(1, Number(leaf.width) || 1)
  return {
    width: `${(normalizedWidth / totalLeafWidth.value) * 100}%`
  }
}

const getHeaderCellStyle = (node: DesignerNode) => {
  if (node.children.length > 0) {
    return { textAlign: node.align || 'center' }
  }
  return {
    ...getLeafWidthStyle(node),
    textAlign: node.align || 'center'
  }
}

const getBodyCellStyle = (leaf: DesignerNode) => ({
  ...getLeafWidthStyle(leaf),
  textAlign: leaf.align || 'center'
})

const isSourceOptionDisabled = (optionValue: string, currentNode: DesignerNode) => {
  if (currentNode.children.length > 0) return true
  const normalized = optionValue.toUpperCase()
  const current = currentNode.sourceField?.trim().toUpperCase() || ''
  const count = usedSourceFieldCounts.value[normalized] || 0
  return normalized !== current && count > 0
}

const getDepth = (node: DesignerNode): number => {
  if (!node.children.length) return 1
  return 1 + Math.max(...node.children.map(getDepth))
}

const countLeaves = (node: DesignerNode): number => {
  if (!node.children.length) return 1
  return node.children.reduce((total, child) => total + countLeaves(child), 0)
}

const buildHeaderRows = (nodes: DesignerNode[]) => {
  const maxDepth = nodes.length ? Math.max(...nodes.map(getDepth)) : 0
  const rows: Array<Array<{ node: DesignerNode; colspan: number; rowspan: number }>> = Array.from(
    { length: maxDepth },
    () => []
  )

  const visit = (node: DesignerNode, currentDepth: number) => {
    const colspan = countLeaves(node)
    const rowspan = node.children.length === 0 ? maxDepth - currentDepth + 1 : 1
    const targetRow = rows[currentDepth - 1]
    if (!targetRow) return
    targetRow.push({ node, colspan, rowspan })
    node.children
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .forEach(child => visit(child, currentDepth + 1))
  }

  nodes
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .forEach(node => visit(node, 1))

  return rows
}

const previewRows = computed(() => buildHeaderRows(sortedHeaderChildren.value))

const validateTemplate = () => {
  const errors: string[] = []
  if (!templateName.value.trim()) {
    errors.push('Template Name is required')
  }
  if (!headerParentText.value.trim()) {
    errors.push('Table Title is required')
  }
  if (!headerChildren.value.length) {
    errors.push('At least one header column is required')
  }

  const used = new Set<string>()
  const validateNode = (node: DesignerNode, path: string) => {
    if (!node.text.trim()) {
      errors.push(`[${path}] Header text is required`)
    }
    const isLeaf = node.children.length === 0
    const sourceField = node.sourceField?.trim().toUpperCase() || null
    if (!isLeaf && sourceField !== null) {
      errors.push(`[${path}] Parent node "${node.text}" must NOT have a source field`)
    }
    if (isLeaf && !sourceField) {
      errors.push(`[${path}] Leaf node "${node.text}" requires a source field`)
    }
    if (isLeaf && sourceField) {
      if (!ALLOWED_SOURCE_FIELDS.has(sourceField)) {
        errors.push(`[${path}] Invalid source field "${sourceField}"`)
      }
      if (used.has(sourceField)) {
        errors.push(`[${path}] Duplicate source field "${sourceField}"`)
      } else {
        used.add(sourceField)
      }
      if (sourceField.startsWith('UDF') && node.dataType === 'option' && !node.optionalType) {
        errors.push(`[${path}] Leaf node "${node.text}" requires an Option Type Code when using Option Data Type`)
      }
      if (sourceField.startsWith('UDF') && node.dataType === 'option' && !['single', 'multiple'].includes(String(node.optionSelectionMode))) {
        errors.push(`[${path}] Leaf node "${node.text}" requires valid Selection Mode when using Option Data Type`)
      }
    }
    if (node.width !== null && (!Number.isFinite(Number(node.width)) || Number(node.width) <= 0)) {
      errors.push(`[${path}] Width must be a positive number`)
    }
    node.children.forEach((child, index) => validateNode(child, `${path}/${index + 1}`))
  }

  sortedHeaderChildren.value.forEach((node, index) => validateNode(node, `${index + 1}`))
  return errors
}

const toApiNode = (node: DesignerNode): TemplateHeaderNode => ({
  headerId: node.headerId,
  text: node.text.trim(),
  sourceField: node.children.length ? null : node.sourceField?.trim().toUpperCase() || null,
  width: node.width ? Number(node.width) : null,
  align: node.align ?? null,
  displayOrder: node.displayOrder,
  dataType: node.dataType || null,
  optionalType: node.dataType === 'option' ? (node.optionalType || null) : null,
  optionSelectionMode: node.dataType === 'option'
    ? (node.optionSelectionMode === 'multiple' ? 'multiple' : 'single')
    : null,
  children: [...node.children]
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map(toApiNode)
})

const loadTemplate = async () => {
  if (isLoading.value || !categoryCode.value) return
  isLoading.value = true
  try {
    const response = await GetTemplateByCategory(categoryCode.value)
    const templateData = extractTemplateData(response)
    templateId.value = Number(templateData?.templateId || templateData?.TEMPLATE_ID || 0)
    templateName.value = String(templateData?.templateName || templateData?.TEMPLATE_NAME || '')
    headerParentText.value = String(templateData?.headerParent?.text || templateData?.HEADER_PARENT_TEXT || '')
    headerChildren.value = [...(templateData?.headerChildren || [])].map(toDesignerNode)
    normalizeTree(headerChildren.value)
    selectedNodeId.value = ''
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Không tải được template.'), false)
  } finally {
    isLoading.value = false
  }
}

const saveTemplate = async () => {
  if (isSaving.value) return
  if (!templateId.value) {
    await loadTemplate()
    if (!templateId.value) {
      setMessage('Không xác định được templateId để lưu template.', false)
      return
    }
  }
  normalizeTree(headerChildren.value)
  const errors = validateTemplate()
  if (errors.length > 0) {
    const firstError = errors[0]
    if (firstError) {
      setMessage(firstError, false)
    }
    return
  }

  isSaving.value = true
  try {
    await SaveTemplate(templateId.value, {
      templateName: templateName.value.trim(),
      headerParents: [{
        text: headerParentText.value.trim()
      }],
      headerChildren: sortedHeaderChildren.value.map(toApiNode)
    })
    setMessage('Template saved successfully', true)
    await loadTemplate()
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Lưu template thất bại.'), false)
  } finally {
    isSaving.value = false
  }
}

const goBack = async () => {
  await navigateTo('/categories')
}

onMounted(async () => {
  await Promise.all([
    loadTypeOptions(),
    loadTemplate()
  ])
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
  draggedNodeId.value = ''
})
</script>
