// Gom mọi file thuật ngữ trong thư mục này thành một bảng tra.
// Viết <T>TLS</T> trong markdown: chữ trong thẻ là key (không phân biệt hoa thường).
// Chữ hiển thị khác key thì viết <T k="tls-handshake">bắt tay TLS</T>.
// Mỗi file export default một Record<key, TermDef>; key viết thường.
import type { TermDef } from './types'

export type { TermDef, TermGroup } from './types'

const modules = import.meta.glob<Record<string, TermDef>>(['./*.ts', '!./index.ts', '!./types.ts', '!./format.ts'], {
  eager: true,
  import: 'default',
})

export const terms: Record<string, TermDef> = {}

for (const [file, entries] of Object.entries(modules)) {
  for (const [key, def] of Object.entries(entries)) {
    if (import.meta.env.DEV && terms[key]) console.warn(`[terms] "${key}" bị khai báo lại trong ${file}`)

    terms[key] = def
  }
}

export function findTerm(key: string): TermDef | undefined {
  return terms[key.trim().toLowerCase()]
}
