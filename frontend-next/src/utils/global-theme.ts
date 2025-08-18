import themeOverrides from '../assets/style/naive-ui-theme-overrides.json'
/**
 * 主题工具
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/7/18_21:37
 */

// NaiveUI 覆写的主题
const naiveUITheme = themeOverrides.common as { [key: string]: string }

// 主题配置项
const theme = {
  primaryColor: naiveUITheme.primaryColor,
  primaryColorLight: naiveUITheme.primaryColorHover,
  primaryColorDark: naiveUITheme.primaryColorPressed,
  backgroundColor: '#EFEFEF',
  backgroundColorLight: '#FFFFFF',
  backgroundColorLark: '#CFCFCF',
  fontSizeSmall: '14px',
  fontSizeNormal: '16px',
  fontSizeLarge: '18px',
  fontSizeSuper: '30px',
  textColorDark: '#131313',
  textColorNormal: '#333333',
  textColorLight: '#a4a4a4',
}
export type Theme = typeof theme

// 主题代理对象，直接设置值可以同步主题配置
export const themeProxy = new Proxy<Theme>(theme, {
  get(target: Theme, key: keyof Theme): string {
    return target[key] as string
  },
  set(target: Theme, key: keyof Theme, newValue: string): boolean {
    target[key] = newValue
    injectCSS(key, newValue)
    return true
  },
})

/**
 * 全局注入单个CSS
 * @param property 属性（小驼峰会自动变短线）
 * @param value 值
 */
export function injectCSS(property: string, value: string): void {
  if (property.startsWith('--')) {
    document.documentElement.style.setProperty(property, value)
  }
  else {
    document.documentElement.style.setProperty(formatCSSVariableName(property), value)
  }
}

/**
 * 全局注入所有CSS
 */
export function injectAllTheme(): void {
  (Object.keys(theme) as Array<keyof Theme>).forEach((key) => {
    injectCSS(key, theme[key])
  })
}

/**
 * 格式化CSS变量名，把小驼峰变成 --XX-X-X
 * @param value
 */
export function formatCSSVariableName(value: string): string {
  let result = '--'
  for (let i = 0; i < value.length; i++) {
    const ch = value.charAt(i)
    if (ch === ch.toLowerCase() && ch !== ch.toUpperCase()) {
      result += ch
    }
    else {
      result += `-${ch.toLowerCase()}`
    }
  }
  return result
}
