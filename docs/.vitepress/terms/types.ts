// Một thuật ngữ trong card <T> (theme/components/Term.vue) và trong trang Glossary.
// def / blocks hỗ trợ **đậm**, `code`, [chữ](/link) và [[key]] để nhảy sang thuật ngữ khác.
export interface TermDef {
  title: string // tên in đậm ở đầu card
  full?: string // tên đầy đủ của viết tắt, hoặc nghĩa tiếng Việt
  def: string // 1–3 câu: nó là gì
  blocks?: string // nó chặn được gì (chỉ dùng cho thuật ngữ bảo mật)
  link?: string // trang hoặc heading để đọc kỹ
  group: TermGroup // nhóm trong trang Glossary
}

export type TermGroup =
  | 'Runtime & build'
  | 'Thiết kế & nguyên tắc'
  | 'Web & API'
  | 'Bảo mật'
  | 'Dữ liệu'
  | 'Quy trình & khác'
