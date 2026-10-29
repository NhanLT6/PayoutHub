import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { nav, sidebar } from './navigation'

export default withMermaid(
  defineConfig({
    lang: 'vi-VN',
    // Deploy lên GitHub Pages: https://nhanlt6.github.io/PayoutHub/
    base: '/PayoutHub/',
    title: 'PayoutHub',
    description: 'Học lại .NET bằng cách build một backend thật',
    cleanUrls: true,
    lastUpdated: false,

    markdown: {
      lineNumbers: false,
      // <T> (card thuật ngữ) đứng đầu dòng vẫn là chữ trong đoạn văn, không bị coi là khối HTML.
      component: { inlineTags: ['T'] },
    },

    // pnpm không hoist dependency con của mermaid, nên ở chế độ dev Vite không tự
    // pre-bundle được các package CommonJS như dayjs. Khai báo rõ để Vite bundle chúng.
    vite: {
      optimizeDeps: {
        include: [
          'mermaid',
          'mermaid > dayjs',
          'mermaid > @braintree/sanitize-url',
          'mermaid > cytoscape',
          'mermaid > cytoscape-cose-bilkent',
        ],
      },
    },

    themeConfig: {
      outline: { level: [2, 3], label: 'Trong trang này' },
      docFooter: { prev: 'Trang trước', next: 'Trang sau' },
      darkModeSwitchLabel: 'Giao diện',
      sidebarMenuLabel: 'Menu',
      returnToTopLabel: 'Lên đầu trang',
      search: { provider: 'local' },

      nav,
      sidebar,
    },
  }),
)
