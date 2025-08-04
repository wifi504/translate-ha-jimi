<template>
  <div class="top-bar" :class="props.mode">
    <img class="avatar" src="@/assets/image/hjm.png" alt="LOGO">
    <div class="title">
      哈基密语加密器<br>
      <span>一款离线的端到端加密聊天工具</span>
    </div>
    <span v-if="props.mode === 'pc'" class="sub-title" @click="navigateBiliBili">→<span>哈</span>观看<span>基密</span>演示视频，曼波~</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  mode?: 'pc' | 'phone'
}>(), {
  mode: 'pc',
})

function navigateBiliBili() {
  window.open('https://www.bilibili.com/video/BV1UctVzTEGv/', '_blank')
}
</script>

<style scoped lang="less">
.top-bar {
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.pc {
  padding-left: 20%;
}
.phone {
  padding: 0 5%;
}

.avatar {
  width: 50px;
  height: 50px;
  margin-right: 20px;
}

.title {
  font-size: 30px;
  font-weight: bold;
  color: #333333;
  line-height: .8;

  span {
    font-size: 18px;
    font-weight: normal;
    color: #494949;
  }
}

.sub-title {
  font-size: 18px;
  color: #a4a4a4;
  border-bottom: #a4a4a4 2px dashed;
  position: relative;
  left: 40px;
  transition: all 0.3s;

  span {
    display: inline-block;
    transition: transform 0.3s;
    transform: scale(1);
  }

  &:hover {
    border-bottom: #8a4845 2px dashed;
    cursor: pointer;
    transform: scale(0.9);
    letter-spacing: -0.7px;

    span {
      transform: scale(2.3);
      color: #8a4845;
    }
  }

  &:active {
    transform: scale(10);
    letter-spacing: -10px;
  }
}
</style>
