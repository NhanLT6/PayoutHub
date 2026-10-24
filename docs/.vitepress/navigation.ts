import type { DefaultTheme } from 'vitepress'

// Mỗi nhóm sidebar ứng với một folder trong docs/: URL, file và menu đi cùng một cấu trúc.
// Mỗi chủ đề một trang: bài học ở trên, câu phỏng vấn ở dưới. Trang mới: tạo file trong đúng folder
// rồi thêm một dòng vào nhóm tương ứng ở đây.

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Mục lục', link: '/reference/' },
  { text: 'Plan', link: '/progress/plan' },
]

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: 'C# & .NET',
    collapsed: false,
    items: [
      { text: '.NET Framework vs .NET', link: '/dotnet/framework-vs-core' },
      { text: 'Câu hỏi kinh điển', link: '/dotnet/classic-questions' },
      { text: 'C# hiện đại', link: '/dotnet/modern-csharp' },
      { text: 'Collections & LINQ', link: '/dotnet/collections-linq' },
    ],
  },
  {
    text: 'Runtime & Async',
    collapsed: false,
    items: [
      { text: 'Runtime & Memory', link: '/runtime/memory' },
      { text: 'Async & Concurrency', link: '/runtime/async' },
    ],
  },
  {
    text: 'ASP.NET Core',
    collapsed: false,
    items: [
      { text: 'Dependency Injection', link: '/aspnet-core/dependency-injection' },
      { text: 'Middleware pipeline', link: '/aspnet-core/middleware' },
      { text: 'Exception handling', link: '/aspnet-core/exception-handling' },
      { text: 'Result pattern', link: '/aspnet-core/result-pattern' },
      { text: 'Health check', link: '/aspnet-core/health-checks' },
      { text: 'Câu hỏi khác', link: '/aspnet-core/questions' },
    ],
  },
  {
    text: 'Tra cứu',
    items: [
      { text: 'Mục lục câu hỏi', link: '/reference/' },
      { text: 'Interview notes', link: '/reference/interview-notes' },
      { text: 'Glossary', link: '/reference/glossary' },
    ],
  },
  {
    text: 'Tiến độ',
    items: [
      { text: 'Plan (M1–M7)', link: '/progress/plan' },
      { text: 'Learning log', link: '/progress/learning-log' },
    ],
  },
]
