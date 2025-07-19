import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  javascript: true,
  typescript: true,
  pnpm: true,
  markdown: true,
  rules: {
    // 允许使用console.log()
    'no-console': 'off',
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
    'no-cond-assign': ['error', 'except-parens'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
  },
})
