// Định dạng nhỏ cho chuỗi trong terms/: `code`, **đậm**, [chữ](/link), [[key]].
// Card (Term.vue) biến [[key]] thành nút mở thuật ngữ đó ngay trong card;
// trang Glossary biến nó thành link tới dòng của thuật ngữ đó.
import { withBase } from 'vitepress'
import { findTerm } from './index'

type RefMode = 'card' | 'anchor'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const termId = (key: string) => `term-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

function termRef(key: string, mode: RefMode) {
  const title = findTerm(key)?.title ?? key

  if (mode === 'anchor') return `<a href="#${termId(key)}">${title}</a>`

  return `<button type="button" class="term-ref" data-term="${key}">${title}</button>`
}

export function formatTerm(src: string | undefined, mode: RefMode = 'card') {
  if (!src) return ''

  const codes: string[] = []

  return esc(src)
    .replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[(.+?)\]\]/g, (_, k) => termRef(k, mode))
    .replace(/\[(.+?)\]\((\/[^)]*)\)/g, (_, t, href) => `<a href="${withBase(href)}">${t}</a>`)
    .replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`)
}
