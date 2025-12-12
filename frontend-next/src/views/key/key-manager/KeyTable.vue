<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :pagination="pagination"
    size="small"
  >
    <template #empty>
      <n-empty description="没有哈基密钥" />
    </template>
  </n-data-table>
</template>

<script setup lang="ts">
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import type { TableColumn } from 'naive-ui/es/data-table/src/interface'
import { uint8ArrayToHex } from '@hayalib/utils'
import { computed, h, ref, watch } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import { useViewportStore } from '@/stores/viewportStore.ts'
import KeyTableActions from '@/views/key/key-manager/KeyTableActions.vue'

const contactStore = useContactStore()
const viewportStore = useViewportStore()

interface RowData {
  no: number
  name: string
  key: string
}

const columns = ref<DataTableColumns<RowData>>([])

function createColumns(isSmallScreen: boolean): DataTableColumns<RowData> {
  const res: DataTableColumns<RowData> = []
  // 序号
  res.push({
    title: '序号',
    key: 'no',
    width: 50,
  })
  // 名称
  const nameCol: TableColumn<RowData> = {
    title: '名称',
    key: 'name',
  }
  if (!isSmallScreen) {
    nameCol.width = 140
  }
  res.push(nameCol)
  // 密钥预览
  if (!isSmallScreen) {
    res.push({
      title: '密钥预览（仅PC端展示）',
      key: 'key',
    })
  }
  // 操作
  const actionsCol: TableColumn<RowData> = {
    title: '操作',
    key: 'actions',
    render(row: RowData) {
      return h(KeyTableActions, { name: row.name })
    },
  }
  if (!isSmallScreen) {
    actionsCol.width = 170
  }
  res.push(actionsCol)
  return res
}

const data = computed<RowData[]>(() => {
  let i = 1
  return contactStore.contactList.map(name => ({
    no: i++,
    name,
    key: getKeyPreview(name),
  }) as RowData)
})

function getKeyPreview(name: string): string {
  const res = contactStore.getSecretKey(name)
  if (typeof res === 'string') {
    return res
  }
  return `${uint8ArrayToHex(res).substring(0, 36)}...`
}

// 分页
const pagination = ref<PaginationProps>({})

function createPagination(isSmallScreen: boolean): PaginationProps {
  const res: PaginationProps = {
    defaultPage: 1,
    defaultPageSize: 10,
    pageSlot: 12,
  }
  if (isSmallScreen) {
    res.pageSlot = 8
  }
  return res
}

function updatePaginationStyle(isSmallScreen: boolean) {
  const paginator = document.querySelector('.n-data-table__pagination')
  if (paginator) {
    if (isSmallScreen) {
      paginator.classList.remove('n-data-table__pagination--pc')
      paginator.classList.add('n-data-table__pagination--phone')
    }
    else {
      paginator.classList.remove('n-data-table__pagination--phone')
      paginator.classList.add('n-data-table__pagination--pc')
    }
  }
}

// 监听屏幕尺寸
watch(() => viewportStore.isSmallScreen, (newVal) => {
  // 更新表格字段
  columns.value = createColumns(newVal)
  // 更新分页样式
  pagination.value = createPagination(newVal)
  updatePaginationStyle(newVal)
}, { immediate: true })
</script>

<style>
.n-data-table__pagination--phone {
  justify-content: center !important;
}

.n-data-table__pagination--pc {
  justify-content: flex-end !important;
}
</style>
