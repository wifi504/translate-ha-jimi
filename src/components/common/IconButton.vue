<template>
  <svg
    v-if="props.icon === 'close'" :style="`width: ${props.size}px; height: ${props.size}px; --rotate: ${props.rotate}deg;
  --theme: ${props.color}; --hover-theme: ${props.hoverColor}; --active-theme: ${props.activityColor};`"
    t="1752900712400"
    class="icon-btn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
    p-id="10848" @click="$emit('click')"
  >
    <path d="M512 56.888889C261.688889 56.888889 56.888889 261.688889 56.888889 512s204.8 455.111111 455.111111 455.111111 455.111111-204.8 455.111111-455.111111-204.8-455.111111-455.111111-455.111111m0 853.333333c-221.866667 0-398.222222-176.355556-398.222222-398.222222s176.355556-398.222222 398.222222-398.222222 398.222222 176.355556 398.222222 398.222222-176.355556 398.222222-398.222222 398.222222" fill="#707070" p-id="10849" /><path d="M684.942222 725.048889L302.705778 342.926222l40.220444-40.220444 382.179556 382.122666z" fill="#707070" p-id="10850" /><path d="M298.837333 684.942222l382.122667-382.179555 40.220444 40.220444-382.122666 382.179556z" fill="#707070" p-id="10851" />
  </svg>

  <svg
    v-if="props.icon === 'paste'" :style="`width: ${props.size}px; height: ${props.size}px; --rotate: ${props.rotate}deg;
  --theme: ${props.color}; --hover-theme: ${props.hoverColor}; --active-theme: ${props.activityColor};`"
    t="1752902651314"
    class="icon-btn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
    p-id="13563" @click="$emit('click')"
  >
    <path d="M320 447.84c0-35.264 28.576-63.84 63.84-63.84h448.32c35.264 0 63.84 28.576 63.84 63.84v448.32A63.84 63.84 0 0 1 832.16 960H383.84A63.84 63.84 0 0 1 320 896.16V447.84z m64 32.384v383.552C384 881.6 398.4 896 416.224 896h383.552C817.6 896 832 881.6 832 863.776V480.224C832 462.4 817.6 448 799.776 448H416.224C398.4 448 384 462.4 384 480.224zM448 800c0-17.664 14.496-32 31.904-32h192.192c17.6 0 31.904 14.208 31.904 32 0 17.664-14.496 32-31.904 32H479.904A31.872 31.872 0 0 1 448 800z m0-128c0-17.664 14.592-32 31.84-32h256.32c17.6 0 31.84 14.208 31.84 32 0 17.664-14.592 32-31.84 32H479.84A31.84 31.84 0 0 1 448 672z m0-128c0-17.664 14.592-32 31.84-32h256.32c17.6 0 31.84 14.208 31.84 32 0 17.664-14.592 32-31.84 32H479.84A31.84 31.84 0 0 1 448 544z m256-288v-64h63.872C803.296 192 832 220.48 832 256.128V320h-64v-32.032A31.776 31.776 0 0 0 736.032 256H704z m-448 0h-32.032A31.776 31.776 0 0 0 192 287.968V768c0 17.92 14.304 31.968 31.968 31.968H256v64h-63.872A63.968 63.968 0 0 1 128 799.872V256.128C128 220.704 156.48 192 192.128 192H256v64z m64-32c0-17.664 14.592-32 31.84-32h256.32c17.6 0 31.84 14.208 31.84 32 0 17.664-14.592 32-31.84 32H351.84A31.84 31.84 0 0 1 320 224z m64-128a32 32 0 0 1 31.68-32h128.64C561.792 64 576 78.208 576 96a32 32 0 0 1-31.68 32H415.68A31.776 31.776 0 0 1 384 96z" p-id="13564" fill="#707070" />
  </svg>

  <svg
    v-if="props.icon === 'switch'" :style="`width: ${props.size}px; height: ${props.size}px; --rotate: ${props.rotate}deg;
  --theme: ${props.color}; --hover-theme: ${props.hoverColor}; --active-theme: ${props.activityColor};`"
    t="1752860313763"
    class="icon-btn"
    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4465" width="200"
    height="200" @click="$emit('click')"
  >
    <path
      d="M922.048 593.536H102.016c-3.072 0-6.08 0-7.616 1.664h-3.008c-1.536 0-3.072 1.6-4.544 1.6-1.6 1.792-1.6 1.792-3.072 1.792-1.536 1.6-3.008 1.6-3.008 1.6-3.072 1.664-4.608 3.328-6.144 4.992-1.472 1.664-3.008 4.992-4.544 6.656 0 0 0 1.664-1.472 3.328 0 1.664-1.472 1.664-1.472 3.328s0 3.392-1.472 4.992v3.328c-1.664 3.264-1.664 9.92-0.128 14.848v3.328c1.472 1.664 1.472 3.392 1.472 4.992 1.472 1.664 1.472 1.664 1.472 3.328 1.472 1.664 1.472 3.328 1.472 3.328 1.536 3.328 3.072 4.992 4.544 6.656l261.248 285.504a37.12 37.12 0 0 0 53.12 0 42.816 42.816 0 0 0 0-58.112l-197.44-215.744h730.496c21.248 0 37.952-16.64 37.952-39.872s-16.576-41.536-37.824-41.536zM102.016 430.848h827.712c1.472 0 1.472-1.664 3.008-1.664s1.472 0 3.072-1.6c1.472 0 1.472-1.664 3.008-1.664 1.536-1.6 3.072-1.6 3.072-1.6 3.072-1.664 4.544-3.328 6.08-4.992s3.072-4.992 4.544-6.656c0 0 0-1.664 1.472-3.328 0-1.664 1.536-1.664 1.536-3.392 0-1.6 0-3.328 1.472-4.928v-3.328a25.728 25.728 0 0 0 0-14.912v-3.392c-1.472-1.664-1.472-3.328-1.472-4.928-1.536-1.664-1.536-1.664-1.536-3.328-1.472-1.664-1.472-3.328-1.472-3.328-1.472-3.392-3.072-4.992-4.544-6.656l-261.184-285.504c-7.744-8.32-16.768-11.648-25.92-11.648s-19.776 3.328-27.392 11.648a46.4 46.4 0 0 0 0 58.112l198.912 215.744H102.016c-21.248 0-38.016 18.304-38.016 39.872 0 23.232 16.768 41.472 38.016 41.472z"
      p-id="4466" fill="#707070"
    />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: 'close' | 'paste' | 'switch'
  size?: number
  color?: string
  hoverColor?: string
  activityColor?: string
  rotate?: number
}>(), {
  icon: 'close',
  size: 24,
  color: '#444444',
  hoverColor: '#808080',
  activityColor: '#171717',
  rotate: 0,
})

defineEmits(['click'])
</script>

<style scoped lang="less">
.icon-btn {
  transform: rotate(var(--rotate));

  path {
    fill: var(--theme);
  }
  cursor: pointer ;

  &:hover {
    path {
      fill: var(--hover-theme);
    }
  }

  &:active {
    path {
      fill: var(--active-theme);
    }
  }
}
</style>
