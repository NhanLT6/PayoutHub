import DefaultTheme from 'vitepress/theme'
import { withBase, type Theme } from 'vitepress'
import Compare from './components/Compare.vue'
import FlowStep from './components/FlowStep.vue'
import Glossary from './components/Glossary.vue'
import HomeToc from './components/HomeToc.vue'
import SecurityFunnel from './components/SecurityFunnel.vue'
import Term from './components/Term.vue'
import Timeline from './components/Timeline.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Link HTML thô trong markdown (<a href> trong fig-caption) không được VitePress tự thêm base.
    // Viết <a :href="$withBase('/path')"> thay vì href="/path".
    app.config.globalProperties.$withBase = withBase
    app.component('Compare', Compare)
    app.component('FlowStep', FlowStep)
    app.component('Glossary', Glossary)
    app.component('HomeToc', HomeToc)
    app.component('SecurityFunnel', SecurityFunnel)
    app.component('T', Term)
    app.component('Timeline', Timeline)
    if (typeof window !== 'undefined') enableDiagramZoom()
  },
} satisfies Theme

// Bấm vào sơ đồ mermaid để mở toàn màn hình: kéo để di chuyển, cuộn chuột (hoặc +/-) để zoom,
// bấm không kéo hoặc Esc để đóng.
function enableDiagramZoom() {
  let overlay: HTMLDivElement | null = null
  const close = () => {
    overlay?.remove()
    overlay = null
  }

  const open = (src: SVGSVGElement) => {
    const box = src.getBoundingClientRect()
    const svg = src.cloneNode(true) as SVGSVGElement
    svg.style.width = `${box.width}px`
    svg.style.height = `${box.height}px`
    svg.style.maxWidth = 'none'
    overlay = document.createElement('div')
    overlay.className = 'mermaid-zoom'
    overlay.appendChild(svg)
    document.body.appendChild(overlay)

    let scale = Math.min(innerWidth / box.width, innerHeight / box.height) * 0.92
    let x = (innerWidth - box.width * scale) / 2
    let y = (innerHeight - box.height * scale) / 2
    const apply = () => {
      svg.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    }
    const zoomAt = (factor: number, cx: number, cy: number) => {
      x = cx - (cx - x) * factor
      y = cy - (cy - y) * factor
      scale *= factor
      apply()
    }
    apply()

    let drag: { px: number; py: number; moved: boolean } | null = null
    overlay.addEventListener('pointerdown', (e) => {
      drag = { px: e.clientX, py: e.clientY, moved: false }
      overlay!.setPointerCapture(e.pointerId)
    })
    overlay.addEventListener('pointermove', (e) => {
      if (!drag) return
      const dx = e.clientX - drag.px,
        dy = e.clientY - drag.py
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true
      x += dx
      y += dy
      drag.px = e.clientX
      drag.py = e.clientY
      apply()
    })
    overlay.addEventListener('pointerup', () => {
      if (drag && !drag.moved) close()
      drag = null
    })
    overlay.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
        zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY)
      },
      { passive: false },
    )
    ;(overlay as any).zoomAt = zoomAt
  }

  document.addEventListener('click', (e) => {
    if (overlay) return
    const svg = (e.target as HTMLElement).closest('.vp-doc .mermaid')?.querySelector('svg')
    if (svg) open(svg)
  })
  document.addEventListener('keydown', (e) => {
    if (!overlay) return
    if (e.key === 'Escape') close()
    if (e.key === '+' || e.key === '=') (overlay as any).zoomAt(1.2, innerWidth / 2, innerHeight / 2)
    if (e.key === '-') (overlay as any).zoomAt(1 / 1.2, innerWidth / 2, innerHeight / 2)
  })
}
