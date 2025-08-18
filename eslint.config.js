import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  javascript: true,
  typescript: true,
  markdown: true,
  rules: {
    // 允许使用console.log()
    'no-console': 'off',
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
    'no-cond-assign': ['error', 'except-parens'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case', {
      registeredComponentsOnly: false,
    }],
    // 允许在必要的时候使用显示的 any 类型，但是仍然不建议，不要把TypeScript写成AnyScript啊
    '@typescript-eslint/no-explicit-any': 'off',
    // if 后可以不换行
    'antfu/if-newline': 'off',
  },
  ignores: [
    'java-sdk/**',
    'python-sdk/**',
  ],
})
