import DefaultTheme from 'vitepress/theme'
import { withBase, type Theme } from 'vitepress'
import Compare from './components/Compare.vue'
import HomeToc from './components/HomeToc.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Link HTML thô trong markdown (<a href> trong fig-caption) không được VitePress tự thêm base.
    // Viết <a :href="$withBase('/path')"> thay vì href="/path".
    app.config.globalProperties.$withBase = withBase
    app.component('Compare', Compare)
    app.component('HomeToc', HomeToc)
  },
} satisfies Theme
