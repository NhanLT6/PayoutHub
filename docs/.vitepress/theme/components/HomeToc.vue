<script setup lang="ts">
import { withBase } from 'vitepress'

// Mục lục trang home, theo đúng trình tự học. Thêm trang mới: thêm một dòng vào đúng nhóm,
// `q` là 2–3 câu phỏng vấn hay bị hỏi nhất (anchor {#slug} có sẵn trên trang đó).
type Question = { text: string; link: string }
type Page = { text: string; link: string; q?: Question[] }
type Group = { title: string; hint: string; pages: Page[]; soon?: { text: string; link: string } }

const groups: Group[] = [
  {
    title: 'Nền tảng C#',
    hint: 'Từ Framework sang .NET hiện đại',
    pages: [
      { text: '.NET Framework vs .NET', link: '/dotnet/framework-vs-core', q: [
        { text: 'Khác nhau', link: '/dotnet/framework-vs-core#framework-vs-core' },
        { text: 'Kestrel', link: '/dotnet/framework-vs-core#kestrel' },
        { text: 'Config', link: '/dotnet/framework-vs-core#configuration' },
      ] },
      { text: 'OOP & C# cơ bản', link: '/dotnet/oop-fundamentals', q: [
        { text: 'OOP', link: '/dotnet/oop-fundamentals#oop' },
        { text: 'Abstract vs interface', link: '/dotnet/oop-fundamentals#abstract-vs-interface' },
        { text: 'SOLID', link: '/dotnet/oop-fundamentals#solid' },
      ] },
      { text: 'C# hiện đại', link: '/dotnet/modern-csharp', q: [
        { text: 'Nullable', link: '/dotnet/modern-csharp#nullable' },
        { text: 'Pattern matching', link: '/dotnet/modern-csharp#pattern-matching' },
        { text: 'Primary ctor', link: '/dotnet/modern-csharp#primary-ctor' },
      ] },
      { text: 'Collections & LINQ', link: '/dotnet/collections-linq', q: [
        { text: 'IEnumerable vs IQueryable', link: '/dotnet/collections-linq#ienumerable-vs-iqueryable' },
        { text: 'Deferred execution', link: '/dotnet/collections-linq#deferred-execution' },
        { text: 'Dictionary', link: '/dotnet/collections-linq#dictionary' },
      ] },
    ],
  },
  {
    title: 'Runtime',
    hint: 'Code chạy thế nào bên dưới',
    pages: [
      { text: 'Memory & GC', link: '/runtime/memory', q: [
        { text: 'Value vs reference', link: '/runtime/memory#value-vs-reference' },
        { text: 'GC', link: '/runtime/memory#gc' },
        { text: 'IDisposable', link: '/runtime/memory#idisposable' },
      ] },
      { text: 'Async & Concurrency', link: '/runtime/async', q: [
        { text: 'await chạy thế nào', link: '/runtime/async#how-await-works' },
        { text: 'Deadlock', link: '/runtime/async#deadlock' },
        { text: 'ConfigureAwait', link: '/runtime/async#configureawait' },
      ] },
    ],
  },
  {
    title: 'ASP.NET Core',
    hint: 'Theo đường đi của một request',
    pages: [
      { text: 'Dependency Injection', link: '/aspnet-core/dependency-injection', q: [
        { text: 'Lifetimes', link: '/aspnet-core/dependency-injection#lifetimes' },
        { text: 'Captive dependency', link: '/aspnet-core/dependency-injection#captive-dependency' },
      ] },
      { text: 'Options pattern', link: '/aspnet-core/options-pattern', q: [
        { text: 'Snapshot vs Monitor', link: '/aspnet-core/options-pattern#options-interfaces' },
        { text: 'Validate lúc start', link: '/aspnet-core/options-pattern#options-validation' },
      ] },
      { text: 'Logging', link: '/aspnet-core/logging', q: [
        { text: 'Message template', link: '/aspnet-core/logging#logging' },
        { text: 'Tìm log lỗi 500', link: '/aspnet-core/logging#find-log-500' },
      ] },
      { text: 'Middleware pipeline', link: '/aspnet-core/middleware', q: [
        { text: 'Thứ tự', link: '/aspnet-core/middleware#middleware' },
        { text: 'Filter', link: '/aspnet-core/middleware#filters' },
        { text: 'Route table', link: '/aspnet-core/middleware#routing' },
      ] },
      { text: 'Exception handling', link: '/aspnet-core/exception-handling', q: [
        { text: 'Validation và lỗi', link: '/aspnet-core/exception-handling#validation-errors' },
        { text: 'traceId', link: '/aspnet-core/exception-handling#traceid' },
      ] },
      { text: 'Result pattern', link: '/aspnet-core/result-pattern' },
      { text: 'Health check', link: '/aspnet-core/health-checks', q: [
        { text: 'Liveness vs readiness', link: '/aspnet-core/health-checks#liveness-vs-readiness' },
      ] },
      { text: 'Câu hỏi khác', link: '/aspnet-core/questions', q: [
        { text: 'Controller vs Minimal', link: '/aspnet-core/questions#controllers-vs-minimal' },
        { text: 'REST', link: '/aspnet-core/questions#rest-design' },
        { text: 'HttpClientFactory', link: '/aspnet-core/questions#httpclientfactory' },
      ] },
    ],
  },
  {
    title: 'Hệ thống',
    hint: 'Container, Kubernetes, microservices',
    pages: [
      { text: 'Container & Docker', link: '' },
      { text: 'Kubernetes', link: '' },
      { text: 'Microservices', link: '' },
    ],
    soon: { text: 'Sắp học ở M8', link: '/progress/plan#m8' },
  },
]
</script>

<template>
  <div class="home-toc">
    <section class="toc-grid" aria-label="Mục lục theo trình tự học">
      <div v-for="(g, i) in groups" :key="g.title" class="toc-group" :class="{ soon: g.soon }">
        <header>
          <span class="num">{{ i + 1 }}</span>
          <div>
            <h2>{{ g.title }}</h2>
            <p class="hint">{{ g.hint }}</p>
          </div>
        </header>
        <ul>
          <li v-for="p in g.pages" :key="p.text">
            <a v-if="p.link" class="page" :href="withBase(p.link)">{{ p.text }}</a>
            <span v-else class="page muted">{{ p.text }}</span>
            <span v-if="p.q" class="qs">
              <a v-for="q in p.q" :key="q.link" class="q" :href="withBase(q.link)">{{ q.text }}</a>
            </span>
          </li>
        </ul>
        <a v-if="g.soon" class="soon-link" :href="withBase(g.soon.link)">{{ g.soon.text }} →</a>
      </div>
    </section>

    <nav class="toc-footer" aria-label="Tra cứu và tiến độ">
      <span class="label">Tra cứu</span>
      <a :href="withBase('/reference/')">Mục lục câu hỏi</a>
      <a :href="withBase('/reference/glossary')">Glossary</a>
      <span class="label">Tiến độ</span>
      <a :href="withBase('/progress/plan')">Plan M1–M8</a>
      <a :href="withBase('/progress/learning-log')">Learning log</a>
    </nav>
  </div>
</template>

<style scoped>
.home-toc {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 64px;
}
@media (min-width: 640px) { .home-toc { padding: 0 48px 64px; } }
@media (min-width: 960px) { .home-toc { padding: 0 64px 64px; } }

.toc-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) { .toc-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1100px) { .toc-grid { grid-template-columns: repeat(4, 1fr); } }

.toc-group {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px 18px;
}
.toc-group.soon { border-style: dashed; }

header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
.num {
  flex: none;
  width: 28px; height: 28px;
  border-radius: 50%;
  display: grid; place-items: center;
  font-weight: 700; font-size: 14px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
h2 { margin: 0; font-size: 16px; font-weight: 700; line-height: 28px; border: 0; padding: 0; }
.hint { margin: 0; font-size: 12px; color: var(--vp-c-text-2); line-height: 1.4; }

ul { list-style: none; margin: 0; padding: 0; }
li { padding: 7px 0; border-top: 1px solid var(--vp-c-divider); }
li:first-child { border-top: 0; }

.page { font-size: 14px; font-weight: 600; color: var(--vp-c-text-1); text-decoration: none; }
a.page:hover { color: var(--vp-c-brand-1); }
.page.muted { color: var(--vp-c-text-3); font-weight: 500; }

.qs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.q {
  font-size: 12px;
  line-height: 18px;
  padding: 0 7px;
  border-radius: 9px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  text-decoration: none;
}
.q:hover { color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }

.soon-link {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.toc-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  margin-top: 20px;
  font-size: 14px;
}
.toc-footer .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--vp-c-text-3); }
.toc-footer .label:not(:first-child) { margin-left: 10px; }
.toc-footer a { color: var(--vp-c-brand-1); text-decoration: none; }
.toc-footer a:hover { text-decoration: underline; }
</style>
