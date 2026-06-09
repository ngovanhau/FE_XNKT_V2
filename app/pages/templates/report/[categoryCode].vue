<template>
  <div class="relative space-y-3 p-2 sm:p-3">
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
          @click="goBack"
        >
          <ArrowLeftOutlined />
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          @click="addRootNode"
        >
          <PlusOutlined />
          <span>Column</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          :disabled="!selectedNode"
          @click="addChildNode"
        >
          <PlusOutlined />
          <span>Child</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          @click="addPreviewRow"
        >
          <PlusOutlined />
          <span>Row</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          :disabled="previewRowCount <= 1"
          @click="removePreviewRow"
        >
          <MinusOutlined />
          <span>Row</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-red-300 px-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed"
          :disabled="!selectedNode"
          @click="deleteFromSelection"
        >
          <DeleteOutlined />
          <span>Delete</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-blue-300 px-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed"
          :disabled="isLoading || isSaving"
          @click="copyCurrentPageDesign"
        >
          <CopyOutlined />
          <span>Copy</span>
        </button>
        
        <button
          type="button"
          class="ml-auto flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          :disabled="isLoading || isSaving"
          @click="loadTemplate"
        >
          <ReloadOutlined />
          <span>Reload</span>
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
          :disabled="isLoading || isSaving"
          @click="saveTemplate"
        >
          <SaveOutlined />
          <span>Save</span>
        </button>
      </div>
      <h1 class="text-sm font-semibold text-slate-900">Report Designer - {{ categoryCode }}</h1>
    </section>

    <section class="grid h-[calc(100vh-230px)] min-h-[500px] grid-cols-1 gap-3 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
      <aside class="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p class="text-sm font-semibold text-blue-700">FIELD LIBRARY</p>
        <div class="mt-3 min-h-0 flex-1 overflow-y-auto space-y-1 pr-1">
          <button
            v-for="option in sourceFieldOptions"
            :key="option.value"
            type="button"
            draggable="true"
            class="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            @click="applySourceField(option.value)"
            @dragstart="onFieldDragStart(option.value)"
            @dragend="onFieldDragEnd"
          >
            {{ option.label }}
          </button>
        </div>
      </aside>

      <div class="grid min-h-0 grid-cols-1 gap-3">
        <section class="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-sm font-semibold text-blue-700">{{ previewTitle }}</p>
            <button
              type="button"
              class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              @click="addHeaderParent"
            >
              + Parent Title
            </button>
          </div>
          <div
            class="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200"
            @dragover.prevent
            @drop.prevent="onPreviewDropAppend"
          >
            <table class="min-w-full border-collapse table-fixed">
              <colgroup v-if="leafColumns.length">
                <col
                  v-for="leaf in leafColumns"
                  :key="`col-${leaf._id}`"
                  :style="getLeafWidthStyle(leaf)"
                />
              </colgroup>
              <thead>
                <tr v-for="(parent, parentIndex) in normalizedHeaderParents" :key="`parent-title-${parentIndex}`">
                  <th
                    class="border border-slate-300 bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-900"
                    :class="selectedParentIndex === parentIndex ? 'border-2 border-blue-500 bg-blue-50' : ''"
                    :colspan="Math.max(leafColumns.length, 1)"
                    :style="getHeaderParentStyle(parent)"
                    @click="onSelectHeaderParent(parentIndex)"
                  >
                    {{ parent.text || 'TABLE TITLE' }}
                  </th>
                </tr>
                <tr v-for="(row, rowIndex) in previewRows" :key="`header-row-${rowIndex}`">
                  <th
                    v-for="cell in row"
                    :key="cell.node._id"
                    draggable="true"
                    class="border border-slate-300 bg-white px-2 py-2 text-center text-xs font-medium text-slate-800"
                    :class="[
                      isHeaderCellSelected(cell.node._id) ? 'border-2 border-slate-900 ring-1 ring-inset ring-slate-700' : '',
                      dragOverNodeId === cell.node._id ? 'ring-2 ring-inset ring-blue-300' : '',
                      draggedColumnNodeId === cell.node._id ? 'opacity-60' : ''
                    ]"
                    :colspan="cell.colspan"
                    :rowspan="cell.rowspan"
                    :style="getHeaderCellStyle(cell.node)"
                    @click="onSelectNode(cell.node, rowIndex, $event)"
                    @dragstart="onHeaderDragStart(cell.node)"
                    @dragover.prevent="onPreviewCellDragOver(cell.node)"
                    @drop.prevent="onPreviewCellDrop(cell.node)"
                    @dragend="onHeaderDragEnd"
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
                <tr v-else>
                  <td
                    v-for="leaf in leafColumns"
                    :key="`value-row-${leaf._id}`"
                    class="h-8 cursor-pointer border border-slate-300 p-0"
                    :class="isValueCellSelected(leaf._id) ? 'border-slate-900 ring-2 ring-inset ring-slate-900' : ''"
                    :style="getBodyCellStyle(leaf)"
                    @click.stop="onSelectValueNode(leaf, $event)"
                  >
                    <button
                      type="button"
                      class="pointer-events-none block h-full w-full select-none truncate px-1 text-[11px] font-semibold"
                      :class="[getAlignClass(leaf.valueStyle.align || leaf.align), 'text-slate-600']"
                    >
                      {{ `<${leaf.sourceField || 'VALUE'}>` }}
                    </button>
                  </td>
                </tr>
                <tr v-for="emptyRow in Math.max(previewRowCount - 1, 0)" :key="`empty-row-${emptyRow}`" v-if="leafColumns.length">
                  <td
                    v-for="leaf in leafColumns"
                    :key="`${leaf._id}-${emptyRow}`"
                    class="h-7 border border-slate-300 bg-white"
                    :style="getBodyCellStyle(leaf)"
                  />
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside class="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p class="text-sm font-semibold text-blue-700">PROPERTIES</p>
        <div class="mt-3 space-y-3 overflow-y-auto">
          <div class="rounded-lg border border-slate-200 p-2">
            <p class="mb-2 text-xs font-semibold text-slate-700">TEMPLATE</p>
            <div class="space-y-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Template Name</label>
                <input
                  v-model="templateName"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  placeholder="Nhập template name"
                />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Row Height</label>
                  <input
                    v-model.number="rowStyle.height"
                    type="number"
                    min="20"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @input="normalizeTemplateSettings"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Row Font Size</label>
                  <input
                    v-model.number="rowStyle.fontSize"
                    type="number"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @input="normalizeTemplateSettings"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedParent" class="rounded-lg border border-slate-200 p-2">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-xs font-semibold text-slate-700">SELECTED PARENT TITLE</p>
              <button
                type="button"
                class="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed"
                :disabled="headerParents.length <= 1 || selectedParentIndex === null"
                @click="removeHeaderParentBySelection"
              >
                <DeleteOutlined />
              </button>
            </div>
            <div class="space-y-2">
              <input
                v-model="selectedParent.text"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                placeholder="Parent title"
              />
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-1 rounded-lg border border-slate-300 p-1">
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedParent.style.align === 'left' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="selectedParent.style.align = 'left'"
                  >
                    <AlignLeftOutlined />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedParent.style.align === 'center' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="selectedParent.style.align = 'center'"
                  >
                    <AlignCenterOutlined />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedParent.style.align === 'right' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="selectedParent.style.align = 'right'"
                  >
                    <AlignRightOutlined />
                  </button>
                </div>
                <div class="rounded-lg border border-slate-300 p-1">
                  <button
                    type="button"
                    class="flex h-8 w-full items-center justify-center rounded-md text-sm transition hover:bg-slate-100"
                    :class="selectedParent.style.fontWeight === 'bold' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700'"
                    @click="selectedParent.style.fontWeight = selectedParent.style.fontWeight === 'bold' ? 'normal' : 'bold'"
                  >
                    B
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 p-2">
            <p class="mb-2 text-xs font-semibold text-slate-700">HEADER PROPERTIES</p>
            <div v-if="selectedNode && selectedNode._id !== selectedValueNodeId" class="space-y-2">
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
                <div class="flex items-center gap-1 rounded-lg border border-slate-300 p-1">
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedNode.align === 'left' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="applyAlign('left')"
                  >
                    <AlignLeftOutlined />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedNode.align === 'center' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="applyAlign('center')"
                  >
                    <AlignCenterOutlined />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedNode.align === 'right' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="applyAlign('right')"
                  >
                    <AlignRightOutlined />
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Font Weight</label>
                  <div class="rounded-lg border border-slate-300 p-1">
                    <button
                      type="button"
                      class="flex h-8 w-full items-center justify-center rounded-md text-sm transition hover:bg-slate-100"
                      :class="selectedNode.style.fontWeight === 'bold' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700'"
                      @click="selectedNode.style.fontWeight = selectedNode.style.fontWeight === 'bold' ? 'normal' : 'bold'; handleNodeChanged()"
                    >
                      B
                    </button>
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Font Size</label>
                  <input
                    v-model.number="selectedNode.style.fontSize"
                    type="number"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @input="handleNodeChanged"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Border</label>
                  <div class="rounded-lg border border-slate-300 p-1">
                    <button
                      type="button"
                      class="flex h-8 w-full items-center justify-center rounded-md transition hover:bg-slate-100"
                      :class="selectedNode.style.border === 'all' ? 'bg-blue-100 text-blue-700' : 'text-slate-700'"
                      @click="selectedNode.style.border = selectedNode.style.border === 'all' ? 'none' : 'all'; handleNodeChanged()"
                    >
                      <span
                        class="inline-block h-4 w-4"
                        :class="selectedNode.style.border === 'all' ? 'border border-slate-800' : 'border border-dashed border-slate-400'"
                      ></span>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Background</label>
                  <input
                    v-model="selectedNode.style.backgroundColor"
                    type="color"
                    class="h-10 w-full rounded-lg border border-slate-300 px-1 py-1 outline-none transition focus:border-blue-600"
                    @input="handleNodeChanged"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Display Order</label>
                <input
                  :value="selectedNode.displayOrder"
                  type="number"
                  disabled
                  class="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div v-else class="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              Chọn một ô header trong preview để chỉnh style header.
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 p-2">
            <p class="mb-2 text-xs font-semibold text-slate-700">VALUE PROPERTIES</p>
            <div v-if="selectedValueNode" class="space-y-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Source Field</label>
                <select
                  v-model="selectedValueNode.sourceField"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  @change="handleNodeChanged"
                >
                  <option :value="null">-- Select --</option>
                  <option
                    v-for="option in sourceFieldOptions"
                    :key="option.value"
                    :value="option.value"
                    :disabled="isSourceOptionDisabled(option.value, selectedValueNode)"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Align</label>
                <div class="flex items-center gap-1 rounded-lg border border-slate-300 p-1">
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedValueNode.valueStyle.align === 'left' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="selectedValueNode.valueStyle.align = 'left'; handleNodeChanged()"
                  >
                    <AlignLeftOutlined />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedValueNode.valueStyle.align === 'center' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="selectedValueNode.valueStyle.align = 'center'; handleNodeChanged()"
                  >
                    <AlignCenterOutlined />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="selectedValueNode.valueStyle.align === 'right' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="selectedValueNode.valueStyle.align = 'right'; handleNodeChanged()"
                  >
                    <AlignRightOutlined />
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Data Type</label>
                  <select
                    v-model="selectedValueNode.dataType"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @change="handleDataTypeChanged"
                  >
                    <option value="text">text</option>
                    <option value="number">number</option>
                    <option value="option">option</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Input Type</label>
                  <select
                    v-model="selectedValueNode.inputType"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @change="handleNodeChanged"
                  >
                    <option value="text">text</option>
                    <option value="number">number</option>
                    <option value="select">select</option>
                    <option value="checkbox">checkbox</option>
                    <option value="textarea">textarea</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Default Value</label>
                <input
                  v-model="selectedValueNode.defaultValueText"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  @input="handleDefaultValueChanged"
                />
              </div>
              <div v-if="isSelectInputType(selectedValueNode?.inputType)" class="grid grid-cols-1 gap-2">
                <div>
                  <div class="mb-1 flex items-center justify-between gap-2">
                    <label class="block text-xs font-medium text-slate-600">Optional Type</label>
                    <button
                      type="button"
                      class="shrink-0 rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed"
                      :disabled="isOptionTypesLoading"
                      @click="loadOptionTypes"
                    >
                      Reload
                    </button>
                  </div>
                  <select
                    v-model="selectedValueNode.optionalType"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @change="handleOptionalTypeChanged"
                  >
                    <option :value="null">-- Select Optional Type --</option>
                    <option
                      v-for="option in formattedTypeOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.value }}
                    </option>
                  </select>
                  <p v-if="!formattedTypeOptions.length" class="mt-1 text-[11px] text-amber-600">
                    Chưa có dữ liệu Option Type. Vui lòng tạo ở màn Option Management.
                  </p>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Selection Mode</label>
                  <select
                    v-model="selectedValueNode.optionSelectionMode"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @change="handleOptionSelectionModeChanged"
                  >
                    <option value="single">single</option>
                    <option value="multiple">multiple</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Required</label>
                  <select
                    v-model="selectedValueNode.validation.required"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @change="handleNodeChanged"
                  >
                    <option :value="false">false</option>
                    <option :value="true">true</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-600">Max Length</label>
                  <input
                    v-model.number="selectedValueNode.validation.maxLength"
                    type="number"
                    min="1"
                    class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                    @input="handleNodeChanged"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600">Options (comma separated)</label>
                <input
                  v-model="selectedValueNode.optionsText"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                  @input="handleOptionsChanged"
                />
              </div>
              <div class="rounded-lg border border-slate-200 p-2">
                <p class="mb-2 text-xs font-semibold text-slate-700">Value Style</p>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Font Weight</label>
                    <div class="rounded-lg border border-slate-300 p-1">
                      <button
                        type="button"
                        class="flex h-8 w-full items-center justify-center rounded-md text-sm transition hover:bg-slate-100"
                        :class="selectedValueNode.valueStyle.fontWeight === 'bold' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700'"
                        @click="selectedValueNode.valueStyle.fontWeight = selectedValueNode.valueStyle.fontWeight === 'bold' ? 'normal' : 'bold'; handleNodeChanged()"
                      >
                        B
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Font Size</label>
                    <input
                      v-model.number="selectedValueNode.valueStyle.fontSize"
                      type="number"
                      class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                      @input="handleNodeChanged"
                    />
                  </div>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Border</label>
                    <div class="rounded-lg border border-slate-300 p-1">
                      <button
                        type="button"
                        class="flex h-8 w-full items-center justify-center rounded-md transition hover:bg-slate-100"
                        :class="selectedValueNode.valueStyle.border === 'all' ? 'bg-blue-100 text-blue-700' : 'text-slate-700'"
                        @click="selectedValueNode.valueStyle.border = selectedValueNode.valueStyle.border === 'all' ? 'none' : 'all'; handleNodeChanged()"
                      >
                        <span
                          class="inline-block h-4 w-4"
                          :class="selectedValueNode.valueStyle.border === 'all' ? 'border border-slate-800' : 'border border-dashed border-slate-400'"
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Padding</label>
                    <input
                      v-model.number="selectedValueNode.valueStyle.padding"
                      type="number"
                      min="0"
                      class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                      @input="handleNodeChanged"
                    />
                  </div>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Background</label>
                    <input
                      v-model="selectedValueNode.valueStyle.backgroundColor"
                      type="color"
                      class="h-10 w-full rounded-lg border border-slate-300 px-1 py-1 outline-none transition focus:border-blue-600"
                      @input="handleNodeChanged"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-600">Text Color</label>
                    <input
                      v-model="selectedValueNode.valueStyle.color"
                      type="color"
                      class="h-10 w-full rounded-lg border border-slate-300 px-1 py-1 outline-none transition focus:border-blue-600"
                      @input="handleNodeChanged"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              Chọn một ô ở hàng value để chỉnh dữ liệu và style value.
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, ArrowLeftOutlined, CopyOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons-vue'
import {
  GetTypeOptionsPaged,
  GetTemplateByCategory,
  SaveTemplate,
  type TypeOptionTypeItem,
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
  style: {
    fontWeight: 'normal' | 'bold'
    fontSize: number
    border: 'all' | 'none'
    backgroundColor: string
  }
  valueStyle: {
    align: 'left' | 'center' | 'right' | null
    fontWeight: 'normal' | 'bold'
    fontSize: number
    border: 'all' | 'none'
    backgroundColor: string
    color: string
    padding: number
  }
  inputType: 'text' | 'number' | 'select' | 'checkbox' | 'textarea'
  dataType: 'text' | 'number' | 'option'
  optionalType: string | null
  optionSelectionMode: 'single' | 'multiple'
  defaultValue: string | number | boolean | null
  defaultValueText: string
  validation: {
    required: boolean
    maxLength: number | null
  }
  options: string[]
  optionsText: string
  children: DesignerNode[]
}

interface HeaderParentItem {
  text: string
  style: {
    align: 'left' | 'center' | 'right'
    fontSize: number
    fontWeight: 'normal' | 'bold'
  }
}

interface DesignerSavableState {
  templateName: string
  headerParents: HeaderParentItem[]
  tableStyle: {
    borderCollapse: string
    widthMode: string
  }
  rowStyle: {
    height: number
    fontSize: number
  }
  headerChildren: DesignerNode[]
}

interface DesignerHistoryState extends DesignerSavableState {
  previewRowCount: number
}

interface ReportDesignerCopyBuffer {
  kind: 'report-designer-copy'
  version: 1
  sourceCategoryCode: string
  copiedAt: string
  state: DesignerHistoryState
}

const route = useRoute()
const categoryCode = computed(() => String(route.params.categoryCode ?? '').trim().toUpperCase())

const templateId = ref(0)
const templateName = ref('')
const headerParents = ref<HeaderParentItem[]>([
  {
    text: '',
    style: {
      align: 'center',
      fontSize: 16,
      fontWeight: 'bold'
    }
  }
])
const tableStyle = reactive({
  borderCollapse: 'collapse',
  widthMode: 'auto'
})
const rowStyle = reactive({
  height: 40,
  fontSize: 14
})
const headerChildren = ref<DesignerNode[]>([])
const selectedNodeId = ref('')
const selectedValueNodeId = ref('')
const selectedHeaderNodeIds = ref<string[]>([])
const selectedValueNodeIds = ref<string[]>([])
const selectedHeaderRowIndex = ref<number | null>(null)
const selectedHeaderAnchorId = ref('')
const selectedHeaderAnchorRowIndex = ref<number | null>(null)
const selectedValueAnchorId = ref('')
const selectedParentIndex = ref<number | null>(null)
const draggedFieldSource = ref('')
const draggedColumnNodeId = ref('')
const dragOverNodeId = ref('')
const previewRowCount = ref(6)
const optionTypeRows = ref<TypeOptionTypeItem[]>([])
const isOptionTypesLoading = ref(false)

const isLoading = ref(false)
const isSaving = ref(false)
const message = ref('')
const isSuccess = ref(false)
let messageTimer: ReturnType<typeof setTimeout> | null = null
let historyRecordTimer: ReturnType<typeof setTimeout> | null = null

const deleteConfirmNodeId = ref('')
const deleteConfirmNodeName = ref('')
const historySnapshots = ref<string[]>([])
const historyIndex = ref(0)
const lastSavedSnapshot = ref('')
const isApplyingHistoryState = ref(false)
const HISTORY_LIMIT = 200
const REPORT_DESIGN_COPY_KEY = 'report-designer-copy-buffer-v1'

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

const formattedTypeOptions = computed(() =>
  optionTypeRows.value
    .map((item) => ({
      value: String((item as any)?.optional_TYPE ?? (item as any)?.OPTIONAL_TYPE ?? '').trim(),
      label: String((item as any)?.description ?? (item as any)?.DESCRIPTION ?? '').trim()
    }))
    .filter(item => item.value)
)

const isSelectInputType = (inputType: unknown) => String(inputType || '').toLowerCase() === 'select'

const ALLOWED_SOURCE_FIELDS = new Set(sourceFieldOptions.map(option => option.value))

const messageClass = computed(() =>
  isSuccess.value
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-red-200 bg-red-50 text-red-700'
)

const toDeepClonedValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const getSavableState = (): DesignerSavableState => ({
  templateName: templateName.value,
  headerParents: toDeepClonedValue(headerParents.value),
  tableStyle: {
    borderCollapse: String(tableStyle.borderCollapse || 'collapse'),
    widthMode: String(tableStyle.widthMode || 'auto')
  },
  rowStyle: {
    height: Number(rowStyle.height || 30),
    fontSize: Number(rowStyle.fontSize || 14)
  },
  headerChildren: toDeepClonedValue(headerChildren.value)
})

const getHistoryState = (): DesignerHistoryState => ({
  ...getSavableState(),
  previewRowCount: Number(previewRowCount.value || 1)
})

const serializeSavableState = () => JSON.stringify(getSavableState())
const serializeHistoryState = () => JSON.stringify(getHistoryState())

const setHistoryBaseline = (markAsSaved: boolean) => {
  const serializedHistory = serializeHistoryState()
  historySnapshots.value = [serializedHistory]
  historyIndex.value = 0
  if (markAsSaved) {
    lastSavedSnapshot.value = serializeSavableState()
  }
}

const recordHistorySnapshot = () => {
  if (isApplyingHistoryState.value || isLoading.value || isSaving.value) return
  const serialized = serializeHistoryState()
  const current = historySnapshots.value[historyIndex.value]
  if (serialized === current) return

  if (historyIndex.value < historySnapshots.value.length - 1) {
    historySnapshots.value = historySnapshots.value.slice(0, historyIndex.value + 1)
  }

  historySnapshots.value.push(serialized)
  if (historySnapshots.value.length > HISTORY_LIMIT) {
    historySnapshots.value.shift()
  }
  historyIndex.value = historySnapshots.value.length - 1
}

const scheduleHistorySnapshot = () => {
  if (historyRecordTimer) {
    clearTimeout(historyRecordTimer)
  }
  historyRecordTimer = setTimeout(() => {
    recordHistorySnapshot()
    historyRecordTimer = null
  }, 120)
}

const applyHistorySnapshot = (serializedState: string) => {
  if (!serializedState) return
  const parsed = JSON.parse(serializedState) as DesignerHistoryState
  isApplyingHistoryState.value = true
  if (historyRecordTimer) {
    clearTimeout(historyRecordTimer)
    historyRecordTimer = null
  }
  try {
    templateName.value = String(parsed.templateName || '')
    headerParents.value = toDeepClonedValue(parsed.headerParents || [])
    tableStyle.borderCollapse = String(parsed.tableStyle?.borderCollapse || 'collapse')
    tableStyle.widthMode = String(parsed.tableStyle?.widthMode || 'auto')
    rowStyle.height = Number(parsed.rowStyle?.height || 30)
    rowStyle.fontSize = Number(parsed.rowStyle?.fontSize || 14)
    headerChildren.value = toDeepClonedValue(parsed.headerChildren || [])
    previewRowCount.value = Math.max(1, Number(parsed.previewRowCount || 1))
    normalizeTemplateSettings()
    normalizeHeaderParentsState()
    normalizeTree(headerChildren.value)
    selectedNodeId.value = ''
    selectedValueNodeId.value = ''
    selectedHeaderNodeIds.value = []
    selectedValueNodeIds.value = []
    selectedHeaderRowIndex.value = null
    selectedHeaderAnchorId.value = ''
    selectedHeaderAnchorRowIndex.value = null
    selectedValueAnchorId.value = ''
    selectedParentIndex.value = null
  } finally {
    isApplyingHistoryState.value = false
  }
}

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < historySnapshots.value.length - 1)
const hasUnsavedChanges = computed(() => serializeSavableState() !== lastSavedSnapshot.value)
const previewTitle = computed(() => hasUnsavedChanges.value ? 'PREVIEW *' : 'PREVIEW')

const undoHistory = () => {
  if (!canUndo.value) return
  historyIndex.value -= 1
  const target = historySnapshots.value[historyIndex.value]
  if (target) {
    applyHistorySnapshot(target)
  }
}

const redoHistory = () => {
  if (!canRedo.value) return
  historyIndex.value += 1
  const target = historySnapshots.value[historyIndex.value]
  if (target) {
    applyHistorySnapshot(target)
  }
}

const handleHistoryHotkeys = (event: KeyboardEvent) => {
  if (!(event.ctrlKey || event.metaKey)) return
  const target = event.target as HTMLElement | null
  const isTypingTarget = Boolean(
    target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
  )
  const key = event.key.toLowerCase()
  if (key === 's') {
    event.preventDefault()
    if (!isLoading.value && !isSaving.value) {
      void saveTemplate()
    }
    return
  }
  if (key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undoHistory()
    return
  }
  if (key === 'y' || (key === 'z' && event.shiftKey)) {
    event.preventDefault()
    redoHistory()
    return
  }
  if (key === 'v' && !isTypingTarget) {
    event.preventDefault()
    void pasteCopiedPageDesign()
  }
}

const buildCopyBuffer = (): ReportDesignerCopyBuffer => ({
  kind: 'report-designer-copy',
  version: 1,
  sourceCategoryCode: categoryCode.value,
  copiedAt: new Date().toISOString(),
  state: toDeepClonedValue(getHistoryState())
})

const saveCopyBufferToLocal = (buffer: ReportDesignerCopyBuffer) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(REPORT_DESIGN_COPY_KEY, JSON.stringify(buffer))
}

const parseCopyBuffer = (raw: string): ReportDesignerCopyBuffer | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<ReportDesignerCopyBuffer>
    if (parsed?.kind !== 'report-designer-copy' || parsed?.version !== 1 || !parsed?.state) return null
    return parsed as ReportDesignerCopyBuffer
  } catch {
    return null
  }
}

const getCopyBufferFromLocal = (): ReportDesignerCopyBuffer | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(REPORT_DESIGN_COPY_KEY) || ''
  return parseCopyBuffer(raw)
}

const applyCopiedState = (state: DesignerHistoryState) => {
  const cloned = toDeepClonedValue(state)
  templateName.value = String(cloned.templateName || '')
  headerParents.value = toDeepClonedValue(cloned.headerParents || [])
  tableStyle.borderCollapse = String(cloned.tableStyle?.borderCollapse || 'collapse')
  tableStyle.widthMode = String(cloned.tableStyle?.widthMode || 'auto')
  rowStyle.height = Number(cloned.rowStyle?.height || 30)
  rowStyle.fontSize = Number(cloned.rowStyle?.fontSize || 14)
  headerChildren.value = toDeepClonedValue(cloned.headerChildren || [])
  previewRowCount.value = Math.max(1, Number(cloned.previewRowCount || 1))
  normalizeTemplateSettings()
  normalizeHeaderParentsState()
  normalizeTree(headerChildren.value)
  selectedNodeId.value = ''
  selectedValueNodeId.value = ''
  selectedHeaderNodeIds.value = []
  selectedValueNodeIds.value = []
  selectedHeaderRowIndex.value = null
  selectedHeaderAnchorId.value = ''
  selectedHeaderAnchorRowIndex.value = null
  selectedValueAnchorId.value = ''
  selectedParentIndex.value = null
  scheduleHistorySnapshot()
}

const copyCurrentPageDesign = async () => {
  normalizeTemplateSettings()
  normalizeHeaderParentsState()
  normalizeTree(headerChildren.value)
  const buffer = buildCopyBuffer()
  saveCopyBufferToLocal(buffer)
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(JSON.stringify(buffer))
    }
  } catch {
    // Clipboard có thể bị browser chặn; localStorage vẫn đủ để Ctrl+V trong app.
  }
  setMessage(`Đã copy page ${categoryCode.value}. Sang category khác nhấn Ctrl+V để dán.`, true)
}

const pasteCopiedPageDesign = async () => {
  if (isLoading.value || isSaving.value) return
  let buffer = getCopyBufferFromLocal()
  if (!buffer) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const raw = await navigator.clipboard.readText()
        buffer = parseCopyBuffer(raw)
      }
    } catch {
      // Không đủ quyền đọc clipboard thì dùng local buffer.
    }
  }
  if (!buffer) {
    setMessage('Không có dữ liệu copy hợp lệ để dán.', false)
    return
  }
  applyCopiedState(buffer.state)
  setMessage(`Đã dán cấu hình từ ${buffer.sourceCategoryCode} sang ${categoryCode.value}.`, true)
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

const normalizeAlignValue = (align: unknown): 'left' | 'center' | 'right' => {
  const value = String(align || '').trim().toLowerCase()
  if (value === 'left' || value === 'right') return value
  return 'center'
}

const getAlignClass = (align: unknown) => {
  const normalized = normalizeAlignValue(align)
  if (normalized === 'left') return 'text-left'
  if (normalized === 'right') return 'text-right'
  return 'text-center'
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
  style: {
    fontWeight: 'normal',
    fontSize: 14,
    border: 'all',
    backgroundColor: '#ffffff'
  },
  valueStyle: {
    align: 'center',
    fontWeight: 'normal',
    fontSize: 14,
    border: 'all',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    padding: 4
  },
  inputType: 'text',
  dataType: 'text',
  optionalType: null,
  optionSelectionMode: 'single',
  defaultValue: null,
  defaultValueText: '',
  validation: {
    required: false,
    maxLength: null
  },
  options: [],
  optionsText: '',
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
  align: normalizeAlignValue(node.align),
  displayOrder: Number(node.displayOrder ?? 1),
  style: {
    fontWeight: node.style?.fontWeight === 'bold' ? 'bold' : 'normal',
    fontSize: Number.isFinite(Number(node.style?.fontSize)) ? Number(node.style?.fontSize) : 14,
    border: node.style?.border === 'none' ? 'none' : 'all',
    backgroundColor: typeof node.style?.backgroundColor === 'string' ? node.style.backgroundColor : '#ffffff'
  },
  valueStyle: {
    align: normalizeAlignValue((node as any).valueStyle?.align ?? node.align),
    fontWeight: (node as any).valueStyle?.fontWeight === 'bold' ? 'bold' : 'normal',
    fontSize: Number.isFinite(Number((node as any).valueStyle?.fontSize)) ? Number((node as any).valueStyle?.fontSize) : 14,
    border: (node as any).valueStyle?.border === 'none' ? 'none' : 'all',
    backgroundColor: typeof (node as any).valueStyle?.backgroundColor === 'string' ? (node as any).valueStyle.backgroundColor : '#ffffff',
    color: typeof (node as any).valueStyle?.color === 'string' ? (node as any).valueStyle.color : '#0f172a',
    padding: Number((node as any).valueStyle?.padding || 4)
  },
  inputType: node.inputType || 'text',
  dataType: (node as any).dataType === 'number' || (node as any).dataType === 'option' ? (node as any).dataType : (
    node.inputType === 'number' ? 'number' : (node.inputType === 'select' ? 'option' : 'text')
  ),
  optionalType: typeof (node as any).optionalType === 'string' ? (node as any).optionalType : null,
  optionSelectionMode: normalizeOptionSelectionMode(node),
  defaultValue: node.defaultValue ?? null,
  defaultValueText: node.defaultValue == null ? '' : String(node.defaultValue),
  validation: {
    required: Boolean(node.validation?.required),
    maxLength: node.validation?.maxLength ? Number(node.validation.maxLength) : null
  },
  options: Array.isArray(node.options)
    ? node.options.map(item => String(item))
    : [],
  optionsText: Array.isArray(node.options)
    ? node.options.map(item => String(item)).join(', ')
    : '',
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
    if (!['normal', 'bold'].includes(String(node.style.fontWeight))) {
      node.style.fontWeight = 'normal'
    }
    const normalizedFontSize = Number(node.style.fontSize)
    node.style.fontSize = Number.isFinite(normalizedFontSize) ? normalizedFontSize : 14
    node.style.border = node.style.border === 'none' ? 'none' : 'all'
    if (!node.style.backgroundColor) {
      node.style.backgroundColor = '#ffffff'
    }
    if (!['normal', 'bold'].includes(String(node.valueStyle.fontWeight))) {
      node.valueStyle.fontWeight = 'normal'
    }
    if (!['left', 'center', 'right'].includes(String(node.valueStyle.align))) {
      node.valueStyle.align = (['left', 'center', 'right'].includes(String(node.align)) ? node.align : 'center')
    }
    const normalizedValueFontSize = Number(node.valueStyle.fontSize)
    node.valueStyle.fontSize = Number.isFinite(normalizedValueFontSize) ? normalizedValueFontSize : 14
    node.valueStyle.border = node.valueStyle.border === 'none' ? 'none' : 'all'
    if (!node.valueStyle.backgroundColor) {
      node.valueStyle.backgroundColor = '#ffffff'
    }
    if (!node.valueStyle.color) {
      node.valueStyle.color = '#0f172a'
    }
    const normalizedPadding = Number(node.valueStyle.padding)
    node.valueStyle.padding = Number.isFinite(normalizedPadding) && normalizedPadding >= 0 ? normalizedPadding : 4
    if (!['text', 'number', 'select', 'checkbox', 'textarea'].includes(String(node.inputType))) {
      node.inputType = 'text'
    }
    if (!['text', 'number', 'option'].includes(String(node.dataType))) {
      node.dataType = node.inputType === 'number' ? 'number' : (node.inputType === 'select' ? 'option' : 'text')
    }
    if (node.dataType === 'option' && node.inputType !== 'select') {
      node.inputType = 'select'
    }
    if (node.dataType === 'number' && node.inputType !== 'number') {
      node.inputType = 'number'
    }
    if (node.dataType === 'text' && (node.inputType === 'number' || node.inputType === 'select')) {
      node.inputType = 'text'
    }
    if (node.inputType !== 'select' || node.children.length > 0) {
      node.optionalType = null
      node.optionSelectionMode = 'single'
    } else if (node.optionalType) {
      node.optionalType = String(node.optionalType).trim().toUpperCase()
    }
    if (node.inputType === 'select' && node.children.length === 0) {
      node.optionSelectionMode = node.optionSelectionMode === 'multiple' ? 'multiple' : 'single'
    }
    node.defaultValueText = node.defaultValue == null ? '' : String(node.defaultValue)
    node.validation.required = Boolean(node.validation.required)
    if (node.validation.maxLength !== null) {
      const maxLength = Number(node.validation.maxLength)
      node.validation.maxLength = Number.isFinite(maxLength) && maxLength > 0 ? maxLength : null
    }
    node.options = node.options.map(item => String(item).trim()).filter(Boolean)
    node.optionsText = node.options.join(', ')
    normalizeTree(node.children)
  })
}

const findNodeInChildren = (
  parent: DesignerNode,
  targetId: string
): { container: DesignerNode[]; index: number; parent: DesignerNode | null } | null => {
  for (const [index, child] of parent.children.entries()) {
    if (child._id === targetId) {
      return { container: parent.children, index, parent }
    }
    const nestedResult = findNodeInChildren(child, targetId)
    if (nestedResult) return nestedResult
  }
  return null
}

const findNodeContainer = (
  nodes: DesignerNode[],
  targetId: string
): { container: DesignerNode[]; index: number; parent: DesignerNode | null } | null => {
  for (const [index, node] of nodes.entries()) {
    if (node._id === targetId) return { container: nodes, index, parent: null }
    const childResult = findNodeInChildren(node, targetId)
    if (childResult) return childResult
  }
  return null
}

const findNodeById = (nodes: DesignerNode[], targetId: string): DesignerNode | null => {
  if (!targetId) return null
  for (const node of nodes) {
    if (node._id === targetId) return node
    const nested = findNodeById(node.children, targetId)
    if (nested) return nested
  }
  return null
}

const selectedNode = computed(() => findNodeById(headerChildren.value, selectedNodeId.value))
const selectedValueNode = computed(() => {
  const node = findNodeById(headerChildren.value, selectedValueNodeId.value)
  if (!node || node.children.length > 0) return null
  return node
})
const selectedHeaderNodes = computed(() =>
  selectedHeaderNodeIds.value
    .map(id => findNodeById(headerChildren.value, id))
    .filter((node): node is DesignerNode => Boolean(node))
)
const selectedValueNodes = computed(() =>
  selectedValueNodeIds.value
    .map(id => findNodeById(headerChildren.value, id))
    .filter((node): node is DesignerNode => Boolean(node) && node!.children.length === 0)
)
const isHeaderMultiSelection = computed(() => selectedHeaderNodes.value.length > 1)
const isValueMultiSelection = computed(() => selectedValueNodes.value.length > 1)
const selectedParent = computed(() =>
  selectedParentIndex.value === null ? null : headerParents.value[selectedParentIndex.value] || null
)
const normalizedHeaderParents = computed(() =>
  headerParents.value.length
    ? headerParents.value
    : [{
      text: '',
      style: {
        align: 'center' as const,
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    }]
)

const addHeaderParent = () => {
  headerParents.value.push({
    text: '',
    style: {
      align: 'center',
      fontSize: 16,
      fontWeight: 'bold'
    }
  })
}

const removeHeaderParent = (index: number) => {
  if (headerParents.value.length <= 1) return
  headerParents.value.splice(index, 1)
  if (selectedParentIndex.value !== null) {
    if (selectedParentIndex.value === index) {
      selectedParentIndex.value = null
    } else if (selectedParentIndex.value > index) {
      selectedParentIndex.value -= 1
    }
  }
}

const removeHeaderParentBySelection = () => {
  if (selectedParentIndex.value === null) return
  removeHeaderParent(selectedParentIndex.value)
}

const normalizeTemplateSettings = () => {
  const nextHeight = Number(rowStyle.height)
  rowStyle.height = Number.isFinite(nextHeight) && nextHeight >= 20 ? nextHeight : 30
  const nextFontSize = Number(rowStyle.fontSize)
  rowStyle.fontSize = Number.isFinite(nextFontSize) ? nextFontSize : 14
}

const normalizeHeaderParentsState = () => {
  if (!headerParents.value.length) {
    addHeaderParent()
  }
  headerParents.value.forEach((parent) => {
    if (!['left', 'center', 'right'].includes(parent.style.align)) {
      parent.style.align = 'center'
    }
    const fontSize = Number(parent.style.fontSize)
    parent.style.fontSize = Number.isFinite(fontSize) ? fontSize : 16
    parent.style.fontWeight = parent.style.fontWeight === 'normal' ? 'normal' : 'bold'
  })
}

const addRootNode = () => {
  const newNode = createNode(headerChildren.value.length + 1)
  headerChildren.value.push(newNode)
  normalizeTree(headerChildren.value)
  selectedNodeId.value = newNode._id
}

const addChildNode = () => {
  if (!selectedNode.value) return
  const parentNode = selectedNode.value
  const newNode = createNode(parentNode.children.length + 1)
  parentNode.children.push(newNode)
  parentNode.sourceField = null
  normalizeTree(headerChildren.value)
  selectedNodeId.value = newNode._id
}

const addPreviewRow = () => {
  previewRowCount.value += 1
}

const removePreviewRow = () => {
  if (previewRowCount.value <= 1) return
  previewRowCount.value -= 1
}

const createColumnFromSource = (sourceField: string, targetNodeId?: string) => {
  const normalized = sourceField.trim().toUpperCase()
  if (!normalized) return
  if (!ALLOWED_SOURCE_FIELDS.has(normalized)) return
  const exists = collectLeafNodes(headerChildren.value)
    .some(node => (node.sourceField?.trim().toUpperCase() || '') === normalized)
  if (exists) {
    setMessage(`Source Field "${normalized}" đã tồn tại.`, false)
    return
  }
  const newNode = createNode(headerChildren.value.length + 1)
  newNode.sourceField = normalized
  const option = sourceFieldOptions.find(item => item.value === normalized)
  newNode.text = option?.label.split(' - ')[0] || normalized
  if (!targetNodeId) {
    headerChildren.value.push(newNode)
  } else {
    const found = findNodeContainer(headerChildren.value, targetNodeId)
    if (!found) {
      headerChildren.value.push(newNode)
    } else {
      found.container.splice(found.index, 0, newNode)
    }
  }
  normalizeTree(headerChildren.value)
  selectedNodeId.value = newNode._id
}

const onFieldDragStart = (sourceField: string) => {
  draggedFieldSource.value = sourceField
}

const onFieldDragEnd = () => {
  draggedFieldSource.value = ''
  draggedColumnNodeId.value = ''
  dragOverNodeId.value = ''
}

const onPreviewDropAppend = () => {
  if (!draggedFieldSource.value) return
  createColumnFromSource(draggedFieldSource.value)
  onFieldDragEnd()
}

const onPreviewCellDragOver = (targetNode: DesignerNode) => {
  if (!draggedFieldSource.value) return
  dragOverNodeId.value = targetNode._id
}

const onPreviewCellDrop = (targetNode: DesignerNode) => {
  if (draggedFieldSource.value) {
    createColumnFromSource(draggedFieldSource.value, targetNode._id)
    onFieldDragEnd()
    return
  }

  if (!draggedColumnNodeId.value || draggedColumnNodeId.value === targetNode._id) {
    onFieldDragEnd()
    return
  }

  const source = findNodeContainer(headerChildren.value, draggedColumnNodeId.value)
  const target = findNodeContainer(headerChildren.value, targetNode._id)
  if (!source || !target || source.container !== target.container) {
    setMessage('Chỉ hoán đổi cột trong cùng cấp.', false)
    onFieldDragEnd()
    return
  }

  const sourceNode = source.container[source.index]
  const targetNodeAtIndex = target.container[target.index]
  if (!sourceNode || !targetNodeAtIndex) {
    onFieldDragEnd()
    return
  }

  source.container[source.index] = targetNodeAtIndex
  target.container[target.index] = sourceNode
  normalizeTree(headerChildren.value)
  selectedNodeId.value = sourceNode._id
  onFieldDragEnd()
}

const onHeaderDragStart = (targetNode: DesignerNode) => {
  draggedColumnNodeId.value = targetNode._id
  selectedNodeId.value = targetNode._id
  selectedHeaderNodeIds.value = [targetNode._id]
  selectedValueNodeIds.value = []
  selectedValueNodeId.value = ''
}

const onHeaderDragEnd = () => {
  onFieldDragEnd()
}

const applyAlign = (align: 'left' | 'center' | 'right') => {
  const targetIds = selectedHeaderNodeIds.value.length
    ? selectedHeaderNodeIds.value
    : (selectedNode.value && selectedNode.value._id !== selectedValueNodeId.value ? [selectedNode.value._id] : [])
  if (!targetIds.length) return
  targetIds.forEach((id) => {
    const node = findNodeById(headerChildren.value, id)
    if (!node) return
    node.align = align
  })
  handleNodeChanged()
}

const getActiveValueNode = () => {
  if (selectedValueNode.value) return selectedValueNode.value
  if (selectedNode.value && selectedNode.value.children.length === 0) return selectedNode.value
  return null
}

const handleDefaultValueChanged = () => {
  const valueNode = getActiveValueNode()
  if (!valueNode) return
  valueNode.defaultValue = valueNode.defaultValueText
  handleNodeChanged()
}

const handleOptionalTypeChanged = () => {
  const valueNode = getActiveValueNode()
  if (!valueNode) return
  if (valueNode.inputType !== 'select') {
    valueNode.optionalType = null
  } else if (valueNode.optionalType) {
    valueNode.optionalType = String(valueNode.optionalType).trim().toUpperCase()
  }
  handleNodeChanged()
}

const handleOptionSelectionModeChanged = () => {
  const valueNode = getActiveValueNode()
  if (!valueNode) return
  valueNode.optionSelectionMode = valueNode.optionSelectionMode === 'multiple' ? 'multiple' : 'single'
  handleNodeChanged()
}

const handleDataTypeChanged = () => {
  const valueNode = getActiveValueNode()
  if (!valueNode) return
  if (valueNode.dataType === 'option') {
    valueNode.inputType = 'select'
    valueNode.optionSelectionMode = valueNode.optionSelectionMode === 'multiple' ? 'multiple' : 'single'
  } else if (valueNode.dataType === 'number') {
    valueNode.inputType = 'number'
    valueNode.optionalType = null
    valueNode.optionSelectionMode = 'single'
  } else {
    valueNode.inputType = 'text'
    valueNode.optionalType = null
    valueNode.optionSelectionMode = 'single'
  }
  handleNodeChanged()
}

const handleOptionsChanged = () => {
  const valueNode = getActiveValueNode()
  if (!valueNode) return
  valueNode.options = valueNode.optionsText
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  handleNodeChanged()
}

const performDeleteNode = (targetNode: DesignerNode) => {
  const found = findNodeContainer(headerChildren.value, targetNode._id)
  if (!found) return
  found.container.splice(found.index, 1)
  normalizeTree(headerChildren.value)
  if (selectedNodeId.value === targetNode._id) {
    selectedNodeId.value = found.parent?._id || ''
  }
  const valueNodeStillExists = findNodeById(headerChildren.value, selectedValueNodeId.value)
  if (!valueNodeStillExists || valueNodeStillExists.children.length > 0) {
    selectedValueNodeId.value = ''
    selectedHeaderAnchorId.value = targetNode._id
    selectedHeaderAnchorRowIndex.value = selectedHeaderRowIndex.value
    selectedValueAnchorId.value = ''
  }
  selectedHeaderNodeIds.value = selectedHeaderNodeIds.value.filter(id => id !== targetNode._id)
  selectedValueNodeIds.value = selectedValueNodeIds.value.filter(id => id !== targetNode._id)
  if (!selectedHeaderNodeIds.value.length) selectedHeaderRowIndex.value = null
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

const applySourceField = (sourceField: string) => {
  if (!selectedNode.value) {
    setMessage('Hãy chọn dòng trước khi áp source field.', false)
    return
  }
  if (selectedNode.value.children.length > 0) {
    setMessage('Node cha không được gán source field.', false)
    return
  }
  selectedNode.value.sourceField = sourceField
  normalizeTree(headerChildren.value)
}

const handleNodeChanged = () => {
  if (selectedHeaderNodeIds.value.length > 1 && selectedNode.value && selectedNode.value._id !== selectedValueNodeId.value) {
    const source = selectedNode.value
    selectedHeaderNodeIds.value.forEach((id) => {
      if (id === source._id) return
      const node = findNodeById(headerChildren.value, id)
      if (!node) return
      node.align = source.align
      node.width = source.width
      node.style = { ...source.style }
    })
  }
  if (selectedValueNodeIds.value.length > 1 && selectedValueNode.value) {
    const source = selectedValueNode.value
    selectedValueNodeIds.value.forEach((id) => {
      if (id === source._id) return
      const node = findNodeById(headerChildren.value, id)
      if (!node || node.children.length > 0) return
      node.dataType = source.dataType
      node.inputType = source.inputType
      node.optionalType = source.optionalType
      node.optionSelectionMode = source.optionSelectionMode
      node.defaultValue = source.defaultValue
      node.defaultValueText = source.defaultValueText
      node.validation = { ...source.validation }
      node.options = [...source.options]
      node.optionsText = source.optionsText
      node.valueStyle = { ...source.valueStyle }
    })
  }
  normalizeTree(headerChildren.value)
}

watch(
  () => serializeHistoryState(),
  () => {
    if (isApplyingHistoryState.value || isLoading.value || isSaving.value) return
    scheduleHistorySnapshot()
  }
)

const clearHeaderSelection = () => {
  selectedHeaderNodeIds.value = []
  selectedHeaderRowIndex.value = null
  selectedHeaderAnchorId.value = ''
  selectedHeaderAnchorRowIndex.value = null
}

const clearValueSelection = () => {
  selectedValueNodeIds.value = []
  selectedValueNodeId.value = ''
  selectedValueAnchorId.value = ''
}

const isHeaderCellSelected = (nodeId: string) => selectedHeaderNodeIds.value.includes(nodeId)
const isValueCellSelected = (nodeId: string) => selectedValueNodeIds.value.includes(nodeId)

const getHeaderRowNodeIds = (rowIndex: number): string[] => {
  const row = previewRows.value[rowIndex] || []
  return row.map(cell => cell.node._id)
}

const getHeaderRangeSelection = (rowIndex: number, fromId: string, toId: string): string[] => {
  const rowIds = getHeaderRowNodeIds(rowIndex)
  const fromIndex = rowIds.indexOf(fromId)
  const toIndex = rowIds.indexOf(toId)
  if (fromIndex < 0 || toIndex < 0) return [toId]
  const [start, end] = fromIndex <= toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex]
  return rowIds.slice(start, end + 1)
}

const getValueRangeSelection = (fromId: string, toId: string): string[] => {
  const ids = leafColumns.value.map(node => node._id)
  const fromIndex = ids.indexOf(fromId)
  const toIndex = ids.indexOf(toId)
  if (fromIndex < 0 || toIndex < 0) return [toId]
  const [start, end] = fromIndex <= toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex]
  return ids.slice(start, end + 1)
}

const onSelectNode = (targetNode: DesignerNode, rowIndex: number, event?: MouseEvent) => {
  selectedParentIndex.value = null
  clearValueSelection()
  const isShiftMode = Boolean(event?.shiftKey)
  const isToggleMode = Boolean(event?.ctrlKey || event?.metaKey)
  if (isShiftMode) {
    if (selectedHeaderAnchorId.value && selectedHeaderAnchorRowIndex.value === rowIndex) {
      selectedHeaderNodeIds.value = getHeaderRangeSelection(rowIndex, selectedHeaderAnchorId.value, targetNode._id)
      selectedHeaderRowIndex.value = rowIndex
      selectedNodeId.value = targetNode._id
      return
    }
    selectedHeaderNodeIds.value = [targetNode._id]
    selectedHeaderRowIndex.value = rowIndex
    selectedHeaderAnchorId.value = targetNode._id
    selectedHeaderAnchorRowIndex.value = rowIndex
    selectedNodeId.value = targetNode._id
    return
  }
  if (!isToggleMode) {
    selectedHeaderNodeIds.value = [targetNode._id]
    selectedHeaderRowIndex.value = rowIndex
    selectedHeaderAnchorId.value = targetNode._id
    selectedHeaderAnchorRowIndex.value = rowIndex
    selectedNodeId.value = targetNode._id
    return
  }
  if (selectedHeaderRowIndex.value !== rowIndex) {
    selectedHeaderNodeIds.value = [targetNode._id]
    selectedHeaderRowIndex.value = rowIndex
    selectedHeaderAnchorId.value = targetNode._id
    selectedHeaderAnchorRowIndex.value = rowIndex
    selectedNodeId.value = targetNode._id
    return
  }
  if (selectedHeaderNodeIds.value.includes(targetNode._id)) {
    const next = selectedHeaderNodeIds.value.filter(id => id !== targetNode._id)
    selectedHeaderNodeIds.value = next
    selectedNodeId.value = next[next.length - 1] || ''
    if (!next.length) selectedHeaderRowIndex.value = null
    return
  }
  selectedHeaderNodeIds.value = [...selectedHeaderNodeIds.value, targetNode._id]
  selectedHeaderAnchorId.value = targetNode._id
  selectedHeaderAnchorRowIndex.value = rowIndex
  selectedNodeId.value = targetNode._id
}

const onSelectValueNode = (targetNode: DesignerNode, event?: MouseEvent) => {
  if (targetNode.children.length > 0) return
  selectedParentIndex.value = null
  clearHeaderSelection()
  const isShiftMode = Boolean(event?.shiftKey)
  const isToggleMode = Boolean(event?.ctrlKey || event?.metaKey)
  if (isShiftMode) {
    if (selectedValueAnchorId.value) {
      selectedValueNodeIds.value = getValueRangeSelection(selectedValueAnchorId.value, targetNode._id)
    } else {
      selectedValueNodeIds.value = [targetNode._id]
      selectedValueAnchorId.value = targetNode._id
    }
    selectedNodeId.value = targetNode._id
    selectedValueNodeId.value = targetNode._id
    return
  }
  if (!isToggleMode) {
    selectedValueNodeIds.value = [targetNode._id]
    selectedValueAnchorId.value = targetNode._id
    selectedNodeId.value = targetNode._id
    selectedValueNodeId.value = targetNode._id
    return
  }
  if (selectedValueNodeIds.value.includes(targetNode._id)) {
    const next = selectedValueNodeIds.value.filter(id => id !== targetNode._id)
    selectedValueNodeIds.value = next
    const fallback = next[next.length - 1] || ''
    selectedNodeId.value = fallback
    selectedValueNodeId.value = fallback
    return
  }
  selectedValueNodeIds.value = [...selectedValueNodeIds.value, targetNode._id]
  selectedValueAnchorId.value = targetNode._id
  selectedNodeId.value = targetNode._id
  selectedValueNodeId.value = targetNode._id
}

const onSelectHeaderParent = (index: number) => {
  clearHeaderSelection()
  clearValueSelection()
  selectedNodeId.value = ''
  selectedParentIndex.value = index
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

const leafColumns = computed(() => collectLeafNodes(headerChildren.value))

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

const previewRows = computed(() => {
  const nodes = [...headerChildren.value]
  if (!nodes.length) return []
  const maxDepth = Math.max(...nodes.map(getDepth))
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
    node.children.forEach(child => visit(child, currentDepth + 1))
  }

  nodes.forEach(node => visit(node, 1))
  return rows
})

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
  const baseStyle = {
    textAlign: node.align || 'center',
    fontWeight: node.style.fontWeight,
    fontSize: `${node.style.fontSize}px`,
    backgroundColor: node.style.backgroundColor,
    border: node.style.border === 'none' ? 'none' : undefined
  }
  if (node.children.length > 0) {
    return baseStyle
  }
  return {
    ...baseStyle,
    ...getLeafWidthStyle(node)
  }
}

const getBodyCellStyle = (leaf: DesignerNode) => ({
  ...getLeafWidthStyle(leaf),
  textAlign: leaf.valueStyle.align || leaf.align || 'center',
  height: `${rowStyle.height}px`,
  fontWeight: leaf.valueStyle.fontWeight,
  fontSize: `${leaf.valueStyle.fontSize || rowStyle.fontSize}px`,
  backgroundColor: leaf.valueStyle.backgroundColor,
  color: leaf.valueStyle.color,
  padding: `${leaf.valueStyle.padding}px`,
  border: leaf.valueStyle.border === 'none' ? 'none' : undefined
})

const getHeaderParentStyle = (parent: HeaderParentItem) => ({
  textAlign: parent.style.align,
  fontSize: `${parent.style.fontSize}px`,
  fontWeight: parent.style.fontWeight
})

const validateTemplate = () => {
  const errors: string[] = []
  normalizeTemplateSettings()
  normalizeHeaderParentsState()
  if (!templateName.value.trim()) {
    errors.push('Template Name is required.')
  }
  if (!headerParents.value.length || !headerParents.value.some(item => item.text.trim())) {
    errors.push('At least one Header Parent title is required.')
  }
  if (!headerChildren.value.length) {
    errors.push('At least one header column is required.')
  }

  const seenSourceField = new Set<string>()
  const traverse = (node: DesignerNode, path: string) => {
    const nodePath = path ? `${path} > ${node.text || 'New Column'}` : node.text || 'New Column'
    if (node.children.length > 0) {
      if (node.sourceField) {
        errors.push(`Parent node must not have source field: ${nodePath}`)
      }
      node.children.forEach(child => traverse(child, nodePath))
      return
    }
    const sourceField = node.sourceField?.trim().toUpperCase()
    if (!sourceField) {
      errors.push(`Leaf node missing source field: ${nodePath}`)
      return
    }
    if ((node.inputType === 'select' || node.dataType === 'option') && !node.optionalType) {
      errors.push(`Leaf node dùng select phải chọn Optional Type: ${nodePath}`)
    }
    if (node.inputType === 'select' && !['single', 'multiple'].includes(node.optionSelectionMode)) {
      errors.push(`Leaf node dùng select phải chọn Selection Mode hợp lệ: ${nodePath}`)
    }
    if (!ALLOWED_SOURCE_FIELDS.has(sourceField)) {
      errors.push(`Invalid source field "${sourceField}" at: ${nodePath}`)
    }
    if (seenSourceField.has(sourceField)) {
      errors.push(`Duplicate source field "${sourceField}" detected.`)
    } else {
      seenSourceField.add(sourceField)
    }
  }

  headerChildren.value.forEach(node => traverse(node, ''))
  return errors
}

const toApiNode = (node: DesignerNode): TemplateHeaderNode => ({
  headerId: node.headerId,
  text: node.text.trim(),
  sourceField: node.children.length > 0 ? null : (node.sourceField?.trim().toUpperCase() || null),
  width: node.width,
  align: normalizeAlignValue(node.align),
  displayOrder: node.displayOrder,
  style: {
    fontWeight: node.style.fontWeight,
    fontSize: node.style.fontSize,
    border: node.style.border,
    backgroundColor: node.style.backgroundColor
  },
  valueStyle: {
    align: normalizeAlignValue(node.valueStyle.align),
    fontWeight: node.valueStyle.fontWeight,
    fontSize: node.valueStyle.fontSize,
    border: node.valueStyle.border,
    backgroundColor: node.valueStyle.backgroundColor,
    color: node.valueStyle.color,
    padding: node.valueStyle.padding
  },
  inputType: node.inputType,
  dataType: node.dataType,
  optionalType: node.inputType === 'select' ? (node.optionalType || null) : null,
  optionSelectionMode: node.inputType === 'select'
    ? (node.optionSelectionMode === 'multiple' ? 'multiple' : 'single')
    : null,
  defaultValue: node.defaultValueText || null,
  validation: {
    required: node.validation.required,
    maxLength: node.validation.maxLength
  },
  options: node.options.length ? node.options : null,
  children: node.children.map(toApiNode)
})

const loadTemplate = async () => {
  if (isLoading.value || !categoryCode.value) return
  isLoading.value = true
  try {
    const response = await GetTemplateByCategory(categoryCode.value)
    const templateData = extractTemplateData(response)
    const rawHeaderParents = Array.isArray(templateData?.headerParents) ? templateData.headerParents : null
    const rawHeaderChildren = Array.isArray(templateData?.headerChildren) ? templateData.headerChildren : []
    templateId.value = Number(templateData?.templateId || templateData?.TEMPLATE_ID || 0)
    templateName.value = String(templateData?.templateName || templateData?.TEMPLATE_NAME || '')
    const apiHeaderParents = rawHeaderParents
      ? rawHeaderParents
      : [{
        text: templateData?.headerParent?.text || templateData?.HEADER_PARENT_TEXT || '',
        style: {
          align: 'center',
          fontSize: 16,
          fontWeight: 'bold'
        }
      }]
    headerParents.value = apiHeaderParents.map((parent: any) => ({
      text: String(parent?.text || ''),
      style: {
        align: normalizeAlignValue(parent?.style?.align),
        fontSize: Number.isFinite(Number(parent?.style?.fontSize)) ? Number(parent?.style?.fontSize) : 16,
        fontWeight: parent?.style?.fontWeight === 'normal' ? 'normal' : 'bold'
      }
    }))
    tableStyle.borderCollapse = String(templateData?.tableStyle?.borderCollapse || 'collapse')
    tableStyle.widthMode = String(templateData?.tableStyle?.widthMode || 'auto')
    rowStyle.height = Number(templateData?.rowStyle?.height || 30)
    rowStyle.fontSize = Number.isFinite(Number(templateData?.rowStyle?.fontSize)) ? Number(templateData?.rowStyle?.fontSize) : 14
    normalizeTemplateSettings()
    normalizeHeaderParentsState()
    headerChildren.value = rawHeaderChildren.map(toDesignerNode)
    normalizeTree(headerChildren.value)
    selectedNodeId.value = ''
    selectedValueNodeId.value = ''
    selectedHeaderNodeIds.value = []
    selectedValueNodeIds.value = []
    selectedHeaderRowIndex.value = null
    selectedHeaderAnchorId.value = ''
    selectedHeaderAnchorRowIndex.value = null
    selectedValueAnchorId.value = ''
    selectedParentIndex.value = null
    setHistoryBaseline(true)
    message.value = ''
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Không tải được template.'), false)
  } finally {
    isLoading.value = false
  }
}

const loadOptionTypes = async () => {
  isOptionTypesLoading.value = true
  try {
    const allRows: any[] = []
    const pageSize = 200
    let currentPage = 1
    let totalCount = 0
    let safety = 0

    do {
      const response = await GetTypeOptionsPaged(currentPage, pageSize, '')
      const outer = response as any
      const payload = outer?.data ?? outer?.Data ?? {}
      const rows = payload?.data ?? payload?.Data ?? []
      totalCount = Number(payload?.totalCount ?? payload?.TotalCount ?? 0)
      if (Array.isArray(rows) && rows.length) {
        allRows.push(...rows)
      }
      currentPage += 1
      safety += 1
      if (safety >= 20) break
    } while (allRows.length < totalCount)

    optionTypeRows.value = allRows
  } catch (error) {
    optionTypeRows.value = []
    console.error('Failed to load option types', error)
  } finally {
    isOptionTypesLoading.value = false
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
  normalizeTemplateSettings()
  normalizeHeaderParentsState()
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
      headerParents: normalizedHeaderParents.value.map(parent => ({
        text: parent.text.trim(),
        style: {
          align: parent.style.align,
          fontSize: parent.style.fontSize,
          fontWeight: parent.style.fontWeight
        }
      })),
      tableStyle: {
        borderCollapse: tableStyle.borderCollapse,
        widthMode: tableStyle.widthMode
      },
      rowStyle: {
        height: rowStyle.height,
        fontSize: rowStyle.fontSize
      },
      headerChildren: headerChildren.value.map(toApiNode)
    })
    setHistoryBaseline(true)
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
  window.addEventListener('keydown', handleHistoryHotkeys)
  await Promise.all([
    loadOptionTypes(),
    loadTemplate()
  ])
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleHistoryHotkeys)
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
  if (historyRecordTimer) {
    clearTimeout(historyRecordTimer)
    historyRecordTimer = null
  }
})
</script>
