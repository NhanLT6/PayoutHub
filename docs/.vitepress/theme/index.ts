import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Compare from './components/Compare.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Compare', Compare)
  },
} satisfies Theme
