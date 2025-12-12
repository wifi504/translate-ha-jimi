<template>
  <div
    class="item-container" :class="{
      'item-active': route.path === routePath,
    }"
    @click="handleClick"
  >
    <div class="icon single-line">
      <n-icon :size="25">
        <slot name="icon" />
      </n-icon>
    </div>
    <div class="title-container">
      <div class="title single-line">
        <slot />
      </div>
      <div class="sub-title single-line">
        <slot name="sub-title" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  routePath?: string | undefined
  aLinkPath?: string | undefined
}>(), {
  routePath: undefined,
  aLinkPath: undefined,
})

const router = useRouter()
const route = useRoute()

function handleClick() {
  if (props.routePath) {
    router.push(props.routePath)
  }
  if (props.aLinkPath) {
    window.open(props.aLinkPath, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped lang="less">
.item-container {
  user-select: none;
  overflow: hidden;
  display: flex;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  padding: 8px;

  .icon {
    text-overflow: ellipsis;
    width: 25px;
    height: 25px;
    color: var(--text-color-normal);
  }

  .title-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .title {
      font-size: var(--font-size-normal);
      color: var(--text-color-normal);
    }

    .sub-title {
      font-size: var(--font-size-small);
      color: var(--text-color-light);
    }
  }

}

.item-container:hover {
  .item-active()
}

.item-active {
  background-color: var(--primary-color-action);
  border-radius: 8px;

  .icon {
    color: var(--primary-color);
  }

  .title-container {
    .title {
      color: var(--primary-color);
    }

    .sub-title {
      color: var(--primary-color-light);
    }
  }
}

.single-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
