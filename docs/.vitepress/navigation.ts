import type { DefaultTheme } from 'vitepress'

// Mỗi nhóm sidebar ứng với một folder trong docs/: URL, file và menu đi cùng một cấu trúc.
// Trang mới: tạo file trong đúng folder rồi thêm một dòng vào nhóm tương ứng ở đây.

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
      { text: 'Câu hỏi ASP.NET Core', link: '/aspnet-core/questions' },
      { text: 'Dependency Injection', link: '/aspnet-core/dependency-injection' },
      {
        text: 'Note đào sâu',
        items: [
          { text: 'DI hoạt động thế nào', link: '/aspnet-core/notes/how-di-works' },
          { text: 'Middleware pipeline', link: '/aspnet-core/notes/middleware-pipeline' },
          { text: 'Exception handling', link: '/aspnet-core/notes/exception-handling' },
          { text: 'Result pattern', link: '/aspnet-core/notes/result-pattern' },
          { text: 'Health check', link: '/aspnet-core/notes/health-checks' },
        ],
      },
    ],
  },
  {
    text: 'Tra cứu',
    items: [
      { text: 'Mục lục handbook', link: '/reference/' },
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
