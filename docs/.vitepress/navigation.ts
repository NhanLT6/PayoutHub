import type { DefaultTheme } from 'vitepress'

// Mỗi nhóm sidebar ứng với một folder trong docs/: URL, file và menu đi cùng một cấu trúc.
// Thứ tự nhóm và trang = trình tự học, khớp với mục lục ở trang home (theme/components/HomeToc.vue).
// Mỗi chủ đề một trang: bài học ở trên, câu phỏng vấn ở dưới. Trang mới: tạo file trong đúng folder
// rồi thêm một dòng vào nhóm tương ứng ở đây.

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Mục lục', link: '/reference/' },
  { text: 'Plan', link: '/progress/plan' },
  { text: 'Bản đồ dự án', link: '/progress/project-map' },
]

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: '1 · Nền tảng C#',
    collapsed: false,
    items: [
      { text: '.NET Framework vs .NET', link: '/dotnet/framework-vs-core' },
      { text: 'OOP', link: '/dotnet/oop-fundamentals' },
      { text: 'Kiểu dữ liệu C#', link: '/dotnet/csharp-types' },
      { text: 'SOLID & pattern', link: '/dotnet/solid-patterns' },
      { text: 'C# hiện đại', link: '/dotnet/modern-csharp' },
      { text: 'Collections & LINQ', link: '/dotnet/collections-linq' },
    ],
  },
  {
    text: '2 · Runtime',
    collapsed: false,
    items: [
      { text: 'Memory & GC', link: '/runtime/memory' },
      { text: 'Async & Concurrency', link: '/runtime/async' },
      { text: 'Async: từ nút bấm tới DB', link: '/runtime/async-flow' },
    ],
  },
  {
    text: '3 · ASP.NET Core',
    collapsed: false,
    items: [
      { text: 'Dependency Injection', link: '/aspnet-core/dependency-injection' },
      { text: 'Options pattern', link: '/aspnet-core/options-pattern' },
      { text: 'Logging', link: '/aspnet-core/logging' },
      { text: 'Middleware pipeline', link: '/aspnet-core/middleware' },
      { text: 'Filter', link: '/aspnet-core/filters' },
      { text: 'Exception handling', link: '/aspnet-core/exception-handling' },
      { text: 'Result pattern', link: '/aspnet-core/result-pattern' },
      { text: 'Health check', link: '/aspnet-core/health-checks' },
      { text: 'Bảo mật API', link: '/aspnet-core/api-security' },
      { text: 'Đăng nhập và JWT', link: '/aspnet-core/authentication-jwt' },
      { text: 'REST API: status code, idempotency', link: '/aspnet-core/rest-api' },
      { text: 'Câu hỏi khác', link: '/aspnet-core/questions' },
    ],
  },
  {
    text: '4 · Data',
    collapsed: false,
    items: [
      { text: 'EF Core: query, tracking, concurrency', link: '/data/ef-core' },
      { text: 'SQL chậm và index', link: '/data/sql-performance' },
      { text: 'LINQ to SQL vs EF Core', link: '/data/linq-to-sql' },
    ],
  },
  {
    text: '5 · Kiến trúc phân tán',
    collapsed: false,
    items: [
      { text: 'Microservices', link: '/architecture/microservices' },
      { text: 'Messaging: queue, outbox, saga', link: '/architecture/messaging' },
      { text: 'DDD', link: '/architecture/ddd' },
      { text: 'Công cụ: broker, thư viện', link: '/architecture/tooling' },
    ],
  },
  {
    text: 'Tra cứu',
    items: [
      { text: 'Mục lục câu hỏi', link: '/reference/' },
      { text: 'Glossary', link: '/reference/glossary' },
    ],
  },
  {
    text: 'Tiến độ',
    items: [
      { text: 'Plan (M1–M8)', link: '/progress/plan' },
      { text: 'Bản đồ dự án', link: '/progress/project-map' },
      { text: 'Learning log', link: '/progress/learning-log' },
    ],
  },
]
