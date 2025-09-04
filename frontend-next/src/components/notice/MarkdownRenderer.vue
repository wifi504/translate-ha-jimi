<template>
  <span>
    <template v-for="item in parseMarkdown(text)" :key="item">
      <template v-if="item.type === 'text'">
        {{ item.content }}
      </template>
      <template v-if="item.type === 'bold'">
        <high-light-text>{{ item.content }}</high-light-text>
      </template>
      <template v-if="item.type === 'link'">
        <icon-a-link :href="item.href ?? ''" style="margin: 0 4px">{{ item.content }}</icon-a-link>
      </template>
      <template v-if="item.type === 'br'">
        <br>
      </template>
      <template v-if="item.type === 'tab'">
        <span style="display:inline-block; width:0.5em;" />
      </template>
    </template>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  text: string
}>()

// 简易的 Markdown 渲染，只处理加粗、超链接和换行
interface MarkdownElt {
  type: 'text' | 'bold' | 'link' | 'br' | 'tab'
  content?: string
  href?: string
}

// 转换 Markdown
function parseMarkdown(text: string): MarkdownElt[] {
  const results: MarkdownElt[] = []
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  let lastIndex: number = 0

  // 把纯文本进一步拆分成 text / br / tab
  function pushTextWithSpecial(segment: string) {
    for (const char of segment) {
      if (char === '\n') {
        results.push({ type: 'br' })
      }
      else if (char === '\t') {
        results.push({ type: 'tab' })
      }
      else {
        // 如果上一个也是 text，就合并，避免碎片化
        const last = results[results.length - 1]
        if (last && last.type === 'text') {
          last.content += char
        }
        else {
          results.push({ type: 'text', content: char })
        }
      }
    }
  }

  for (const match of text.matchAll(regex)) {
    if (match.index! > lastIndex) {
      pushTextWithSpecial(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      results.push({ type: 'bold', content: match[1] })
    }
    else {
      results.push({ type: 'link', content: match[2], href: match[3] })
    }

    lastIndex = match.index! + match[0].length
  }

  if (lastIndex < text.length) {
    pushTextWithSpecial(text.slice(lastIndex))
  }

  return results
}
</script>

<style scoped lang="less">

</style>
