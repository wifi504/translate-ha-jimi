<template>
  <n-card title="联系人" style="width: 290px;" hoverable>
    <template #header-extra>
      <n-button
        type="primary"
        :disabled="!contactStore.hasAuth"
        @click="$emit('addOne')"
      >
        添加
        <template #icon>
          <n-icon>
            <user-add-outlined />
          </n-icon>
        </template>
      </n-button>
    </template>
    <n-scrollbar
      v-if="list && list !== 'access_denied' && list.length > 0"
      ref="scrollbarRef"
      style="height: 400px; border: 1px solid #efeff5;"
    >
      <n-list>
        <n-list-item
          v-for="item in list"
          :key="item"
          class="item"
          :class="item === active ? 'item-active' : ''"
          @click.stop="handleSelect(item)"
        >
          <template #suffix>
            <n-flex :wrap="false" :size="4">
              <n-popconfirm
                negative-text="取消"
                positive-text="修改"
                :show-icon="false"
                @positive-click="handleEdit(item)"
              >
                <n-card :bordered="false" title="修改哈基友名字" header-style="padding: 0px;" content-style="padding: 0px;">
                  <n-input
                    v-model:value="newName"
                    maxlength="8"
                    placeholder="请输入新昵称"
                    show-count
                  />
                </n-card>
                <template #trigger>
                  <n-button class="btn" circle secondary type="info" size="small" @click="() => newName = ''">
                    <template #icon>
                      <n-icon>
                        <edit-outlined />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </n-popconfirm>
              <n-popconfirm
                negative-text="取消"
                positive-text="删除"
                :show-icon="false"
                @positive-click="handleRemove(item)"
              >
                <n-card :bordered="false" title="删除哈基友" header-style="padding: 0px;" content-style="padding: 0px;" />
                <template #trigger>
                  <n-button class="btn" circle secondary type="primary" size="small">
                    <template #icon>
                      <n-icon>
                        <user-delete-outlined />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
              </n-popconfirm>
            </n-flex>
          </template>
          {{ item }}
        </n-list-item>
      </n-list>
    </n-scrollbar>
    <n-empty
      v-else
      description="没有联系人"
      style="user-select: none; height: 400px;"
    >
      <template #icon>
        <n-icon>
          <inbox-outlined />
        </n-icon>
      </template>
    </n-empty>
  </n-card>
</template>

<script setup lang="ts">
import {
  EditOutlined,
  InboxOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@vicons/antd'
import {
  NButton,
  NCard,
  NEmpty,
  NFlex,
  NIcon,
  NInput,
  NList,
  NListItem,
  NPopconfirm,
  NScrollbar,
  useMessage,
} from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'

const props = defineProps<{
  list: string[] | 'access_denied'
  active: string
}>()

defineEmits<{
  (e: 'addOne'): void
}>()

const contactStore = useContactStore()
const message = useMessage()
const newName = ref<string>('')

async function handleEdit(nickname: string) {
  if (nickname !== newName.value && newName.value.length > 0 && newName.value.length <= 8) {
    const res = await contactStore.rename(nickname, newName.value)
    if (res === 'success') {
      message.success('修改成功')
      handleSelect(newName.value)
      newName.value = ''
      setTimeout(() => autoScroll(), 100)
      return
    }
  }
  message.error('修改失败')
}

async function handleRemove(nickname: string) {
  const res = await contactStore.remove(nickname)
  if (res === 'success') {
    message.success('删除成功')
    contactStore.currentContact
        = contactStore.getContactList !== 'access_denied' ? contactStore.getContactList[0] : ''
    return
  }
  message.error('删除失败')
}

function handleSelect(nickname: string) {
  contactStore.currentContact = nickname
}

const scrollbarRef = ref<InstanceType<typeof NScrollbar>>()

function autoScroll() {
  scrollbarRef.value?.scrollTo({
    top: 52 * (props.list.indexOf(props.active) - 2),
    behavior: 'smooth',
  })
}

onMounted(() => {
  // 自动滚动到选中的
  setTimeout(() => autoScroll(), 1000)
  console.log(contactStore.hasAuth)
})

defineExpose({
  autoScroll,
})
</script>

<style scoped lang="less">
.item {
  cursor: pointer;
  padding: 12px 20px;

  &:hover {
    .item-active();
    background-color: #AE6662FF;
  }
}

.item-active {
  background-color: #8a4845FF;
  color: #FFFFFF;
  font-weight: bold;
  .btn {
    background-color: #ffffff;
  }
}
</style>
