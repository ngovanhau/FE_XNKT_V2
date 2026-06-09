<template>
  <div
    class="cursor-grab rounded-lg border bg-white p-2 shadow-sm active:cursor-grabbing"
    :class="isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'"
    :style="{ marginLeft: `${level * 14}px` }"
    draggable="true"
    @click.stop="emit('select', node)"
    @dragstart="onDragStart"
    @dragover.prevent
    @drop.stop="emit('drop-on', node)"
  >
    <div class="grid grid-cols-1 gap-1.5 lg:grid-cols-12">
      <div class="lg:col-span-3">
        <label class="mb-0.5 block text-[11px] font-medium text-slate-600">Header Text</label>
        <input
          v-model="node.text"
          type="text"
          class="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-blue-600"
          @input="emitChanged"
        />
      </div>
      <div class="lg:col-span-3">
        <label class="mb-0.5 block text-[11px] font-medium text-slate-600">Source Field</label>
        <select
          v-model="node.sourceField"
          :disabled="hasChildren"
          class="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-blue-600"
          @change="emitChanged"
        >
          <option :value="null">-- Select --</option>
          <option
            v-for="option in sourceOptions"
            :key="option.value"
            :value="option.value"
            :disabled="isOptionDisabled(option.value)"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="lg:col-span-2">
        <label class="mb-0.5 block text-[11px] font-medium text-slate-600">Width</label>
        <input
          v-model.number="node.width"
          type="number"
          min="1"
          class="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-blue-600"
          @input="emitChanged"
        />
      </div>
      <div class="lg:col-span-2">
        <label class="mb-0.5 block text-[11px] font-medium text-slate-600">Align</label>
        <select
          v-model="node.align"
          class="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-blue-600"
          @change="emitChanged"
        >
          <option value="left">left</option>
          <option value="center">center</option>
          <option value="right">right</option>
        </select>
      </div>
      <div class="lg:col-span-2">
        <label class="mb-0.5 block text-[11px] font-medium text-slate-600">Order</label>
        <input
          v-model.number="node.displayOrder"
          type="number"
          min="1"
          disabled
          class="w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed"
        />
      </div>
    </div>

    <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
      <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        {{ hasChildren ? 'Parent' : 'Leaf' }}
      </span>
      <button
        v-if="hasChildren"
        type="button"
        class="rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
        @click.stop="isChildrenExpanded = !isChildrenExpanded"
      >
        {{ isChildrenExpanded ? 'Collapse' : 'Expand' }}
      </button>
      <span
        v-if="isMissingSourceField"
        class="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700"
      >
        Missing Source Field
      </span>
      <span
        v-if="isDuplicateSourceField"
        class="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700"
      >
        Duplicate Source Field
      </span>
      <div class="ml-auto flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          class="rounded-md border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
          @click="$emit('add-child', node)"
        >
          + Child
        </button>
        <button
          type="button"
          class="rounded-md border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
          @click="$emit('add-sibling', node)"
        >
          + Sibling
        </button>
        <button
          type="button"
          class="rounded-md border border-red-300 px-2 py-0.5 text-[11px] font-medium text-red-700 transition hover:bg-red-50"
          @click="$emit('delete-node', node)"
        >
          Delete
        </button>
      </div>
    </div>

    <div v-if="sortedChildren.length && isChildrenExpanded" class="mt-2 space-y-2 border-l-2 border-slate-200 pl-2">
      <TreeNodeEditor
        v-for="child in sortedChildren"
        :key="child._id"
        :node="child"
        :level="level + 1"
        :used-source-field-counts="usedSourceFieldCounts"
        :duplicate-source-fields="duplicateSourceFields"
        :source-options="sourceOptions"
        :selected-node-id="selectedNodeId"
        @add-child="$emit('add-child', $event)"
        @add-sibling="$emit('add-sibling', $event)"
        @delete-node="$emit('delete-node', $event)"
        @changed="$emit('changed')"
        @select="$emit('select', $event)"
        @drag-start="$emit('drag-start', $event)"
        @drop-on="$emit('drop-on', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TreeNodeEditor'
})

interface DesignerNode {
  _id: string
  headerId: number | null
  text: string
  sourceField: string | null
  width: number | null
  align: 'left' | 'center' | 'right' | null
  displayOrder: number
  children: DesignerNode[]
}

interface SourceOption {
  value: string
  label: string
}

const props = defineProps<{
  node: DesignerNode
  level: number
  usedSourceFieldCounts: Record<string, number>
  duplicateSourceFields: string[]
  sourceOptions: SourceOption[]
  selectedNodeId: string
}>()

const emit = defineEmits<{
  (event: 'add-child', node: DesignerNode): void
  (event: 'add-sibling', node: DesignerNode): void
  (event: 'delete-node', node: DesignerNode): void
  (event: 'changed'): void
  (event: 'select', node: DesignerNode): void
  (event: 'drag-start', node: DesignerNode): void
  (event: 'drop-on', node: DesignerNode): void
}>()

const hasChildren = computed(() => props.node.children.length > 0)
const isSelected = computed(() => props.node._id === props.selectedNodeId)
const isChildrenExpanded = ref(true)

const sortedChildren = computed(() =>
  [...props.node.children].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
)

const normalizedSourceField = computed(() => props.node.sourceField?.trim().toUpperCase() || '')

const isMissingSourceField = computed(() => !hasChildren.value && !normalizedSourceField.value)

const isDuplicateSourceField = computed(() =>
  Boolean(normalizedSourceField.value) && props.duplicateSourceFields.includes(normalizedSourceField.value)
)

const isOptionDisabled = (optionValue: string) => {
  if (hasChildren.value) return true
  const normalized = optionValue.toUpperCase()
  const current = normalizedSourceField.value
  const count = props.usedSourceFieldCounts[normalized] || 0
  return normalized !== current && count > 0
}

const emitChanged = () => {
  if (hasChildren.value && props.node.sourceField !== null) {
    props.node.sourceField = null
  }
  emit('changed')
}

const onDragStart = (event: DragEvent) => {
  event.dataTransfer?.setData('text/plain', props.node._id)
  emit('drag-start', props.node)
}

watch(hasChildren, (value) => {
  if (!value) {
    isChildrenExpanded.value = true
  }
})
</script>
