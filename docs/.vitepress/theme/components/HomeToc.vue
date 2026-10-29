<script setup lang="ts">
import { withBase } from 'vitepress'

// Mục lục trang home, theo đúng trình tự học. Padding và max-width khớp với VPHero để thẳng hàng với hero.
// Mỗi nhóm là một hàng tiêu đề, card của nhóm nằm trong
// lưới tự xuống dòng bên dưới: thêm trang mới chỉ cần thêm một phần tử vào `pages` của đúng nhóm.
// `q` là 2–3 câu phỏng vấn hay bị hỏi nhất (anchor {#slug} có sẵn trên trang đó).
type Question = { text: string; link: string }
type Page = { text: string; desc: string; link?: string; q?: Question[] }
type Group = { title: string; hint: string; pages: Page[]; soon?: { text: string; link: string } }

const groups: Group[] = [
  {
    title: 'Nền tảng C#',
    hint: 'Từ Framework sang .NET hiện đại',
    pages: [
      {
        text: '.NET Framework vs .NET',
        desc: 'Khác nhau ở runtime, hosting, config. Thứ thay thế cho những gì bạn dùng hằng ngày ở Web Forms.',
        link: '/dotnet/framework-vs-core',
        q: [
          { text: 'Khác nhau', link: '/dotnet/framework-vs-core#framework-vs-core' },
          { text: 'Kestrel', link: '/dotnet/framework-vs-core#kestrel' },
          { text: 'Config', link: '/dotnet/framework-vs-core#configuration' },
        ],
      },
      {
        text: 'OOP & C# cơ bản',
        desc: '4 tính chất OOP, abstract và interface, SOLID, các câu trả bài kinh điển.',
        link: '/dotnet/oop-fundamentals',
        q: [
          { text: 'OOP', link: '/dotnet/oop-fundamentals#oop' },
          { text: 'Abstract vs interface', link: '/dotnet/oop-fundamentals#abstract-vs-interface' },
          { text: 'SOLID', link: '/dotnet/oop-fundamentals#solid' },
        ],
      },
      {
        text: 'C# hiện đại',
        desc: 'Nullable reference types, pattern matching, primary constructor, required, init.',
        link: '/dotnet/modern-csharp',
        q: [
          { text: 'Nullable', link: '/dotnet/modern-csharp#nullable' },
          { text: 'Pattern matching', link: '/dotnet/modern-csharp#pattern-matching' },
          { text: 'Primary ctor', link: '/dotnet/modern-csharp#primary-ctor' },
        ],
      },
      {
        text: 'Collections & LINQ',
        desc: 'Độ phức tạp, Dictionary bên trong, IEnumerable và IQueryable, deferred execution.',
        link: '/dotnet/collections-linq',
        q: [
          { text: 'IEnumerable vs IQueryable', link: '/dotnet/collections-linq#ienumerable-vs-iqueryable' },
          { text: 'Deferred execution', link: '/dotnet/collections-linq#deferred-execution' },
          { text: 'Dictionary', link: '/dotnet/collections-linq#dictionary' },
        ],
      },
    ],
  },
  {
    title: 'Runtime',
    hint: 'Code chạy thế nào bên dưới',
    pages: [
      {
        text: 'Memory & GC',
        desc: 'CLR, IL, JIT. Value và reference type, GC, IDisposable, memory leak, Span.',
        link: '/runtime/memory',
        q: [
          { text: 'Value vs reference', link: '/runtime/memory#value-vs-reference' },
          { text: 'GC', link: '/runtime/memory#gc' },
          { text: 'IDisposable', link: '/runtime/memory#idisposable' },
        ],
      },
      {
        text: 'Async & Concurrency',
        desc: 'await chạy thế nào, Task và Thread, deadlock, ConfigureAwait, cancellation.',
        link: '/runtime/async',
        q: [
          { text: 'await chạy thế nào', link: '/runtime/async#how-await-works' },
          { text: 'Deadlock', link: '/runtime/async#deadlock' },
          { text: 'ConfigureAwait', link: '/runtime/async#configureawait' },
        ],
      },
    ],
  },
  {
    title: 'ASP.NET Core',
    hint: 'Theo đường đi của một request',
    pages: [
      {
        text: 'Dependency Injection',
        desc: 'IoC, DI, DIP và container. Resolve cây object, lifetime, captive dependency.',
        link: '/aspnet-core/dependency-injection',
        q: [
          { text: 'Lifetimes', link: '/aspnet-core/dependency-injection#lifetimes' },
          { text: 'Captive dependency', link: '/aspnet-core/dependency-injection#captive-dependency' },
        ],
      },
      {
        text: 'Options pattern',
        desc: 'Config thành class có kiểu, validate lúc start. IOptions, Snapshot, Monitor đọc giá trị lúc nào.',
        link: '/aspnet-core/options-pattern',
        q: [
          { text: 'Snapshot vs Monitor', link: '/aspnet-core/options-pattern#options-interfaces' },
          { text: 'Validate lúc start', link: '/aspnet-core/options-pattern#options-validation' },
        ],
      },
      {
        text: 'Logging',
        desc: 'Message template, JSON console, log scope, tìm log cho một lỗi 500 qua traceId.',
        link: '/aspnet-core/logging',
        q: [
          { text: 'Message template', link: '/aspnet-core/logging#logging' },
          { text: 'Tìm log lỗi 500', link: '/aspnet-core/logging#find-log-500' },
        ],
      },
      {
        text: 'Middleware pipeline',
        desc: 'Pipeline là các hàm gọi lồng nhau. Thứ tự, short-circuit, route table, ba cách viết middleware.',
        link: '/aspnet-core/middleware',
        q: [
          { text: 'Thứ tự', link: '/aspnet-core/middleware#middleware' },
          { text: 'Filter', link: '/aspnet-core/middleware#filters' },
          { text: 'Route table', link: '/aspnet-core/middleware#routing' },
        ],
      },
      {
        text: 'Exception handling',
        desc: 'IExceptionHandler, ProblemDetails, traceId, nhiều handler cho lỗi nghiệp vụ.',
        link: '/aspnet-core/exception-handling',
        q: [
          { text: 'Validation và lỗi', link: '/aspnet-core/exception-handling#validation-errors' },
          { text: 'traceId', link: '/aspnet-core/exception-handling#traceid' },
        ],
      },
      {
        text: 'Result pattern',
        desc: 'Trả lỗi như một giá trị thay vì throw. Khi nào Result, khi nào exception.',
        link: '/aspnet-core/result-pattern',
      },
      {
        text: 'Health check',
        desc: 'Liveness và readiness, vì sao không đưa DB vào liveness, Kubernetes trong 1 phút.',
        link: '/aspnet-core/health-checks',
        q: [{ text: 'Liveness vs readiness', link: '/aspnet-core/health-checks#liveness-vs-readiness' }],
      },
      {
        text: 'Bảo mật API',
        desc: 'Một request đi qua TLS, WAF, gateway, JWT, policy, IDOR, SQL injection, Key Vault. OWASP API Top 10, PII/PHI.',
        link: '/aspnet-core/api-security',
        q: [
          { text: 'AuthN vs AuthZ', link: '/aspnet-core/api-security#authn-vs-authz' },
          { text: 'IDOR', link: '/aspnet-core/api-security#idor' },
          { text: 'Checklist', link: '/aspnet-core/api-security#secure-api-checklist' },
        ],
      },
      {
        text: 'Câu hỏi khác',
        desc: 'Startup, Controller hay Minimal API, REST, HttpClientFactory, caching.',
        link: '/aspnet-core/questions',
        q: [
          { text: 'Controller vs Minimal', link: '/aspnet-core/questions#controllers-vs-minimal' },
          { text: 'REST', link: '/aspnet-core/questions#rest-design' },
          { text: 'HttpClientFactory', link: '/aspnet-core/questions#httpclientfactory' },
        ],
      },
    ],
  },
  {
    title: 'Hệ thống',
    hint: 'Container, Kubernetes, microservices',
    soon: { text: 'Sắp học ở M8', link: '/progress/plan#m8' },
    pages: [
      { text: 'Container & Docker', desc: 'Dockerfile multi-stage, docker compose, config qua env var.' },
      { text: 'Kubernetes', desc: 'Pod, Deployment, Service, probe chạy thật trên cluster local.' },
      { text: 'Microservices', desc: 'Sync và async, service discovery, API gateway, distributed tracing.' },
    ],
  },
]
</script>

<template>
  <div class="home-toc">
    <section v-for="(g, i) in groups" :key="g.title" class="group" :aria-label="g.title">
      <header>
        <span class="num">{{ i + 1 }}</span>
        <h2>{{ g.title }}</h2>
        <span class="hint">{{ g.hint }}</span>
        <a v-if="g.soon" class="soon-link" :href="withBase(g.soon.link)">{{ g.soon.text }} →</a>
      </header>

      <div class="cards">
        <article v-for="p in g.pages" :key="p.text" class="card" :class="{ soon: !p.link }">
          <a v-if="p.link" class="title" :href="withBase(p.link)">{{ p.text }}</a>
          <span v-else class="title">{{ p.text }}</span>
          <p class="desc">{{ p.desc }}</p>
          <div v-if="p.q" class="qs">
            <a v-for="q in p.q" :key="q.link" class="q" :href="withBase(q.link)">{{ q.text }}</a>
          </div>
        </article>
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
/* Giống VPHero: padding ở ngoài, khung 1152px ở trong, nên mép trái khớp với hero */
.home-toc {
  padding: 0 24px 64px;
}
.home-toc > * {
  max-width: 1152px;
  margin-left: auto;
  margin-right: auto;
}
@media (min-width: 640px) {
  .home-toc {
    padding: 0 48px 64px;
  }
}
@media (min-width: 960px) {
  .home-toc {
    padding: 0 64px 64px;
  }
}

.group + .group {
  margin-top: 56px;
}
@media (min-width: 960px) {
  .group + .group {
    margin-top: 64px;
  }
}

header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin-bottom: 12px;
}
.num {
  align-self: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  border: 0;
  padding: 0;
}
.hint {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.soon-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.soon-link:hover {
  text-decoration: underline;
}

/* Lưới tự xuống dòng: thêm card không phải sửa layout */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.card {
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 18px 20px;
  transition: border-color 0.25s;
}
.card:hover {
  border-color: var(--vp-c-brand-1);
}
.card.soon {
  background: transparent;
  border: 1px dashed var(--vp-c-divider);
}
.card.soon:hover {
  border-color: var(--vp-c-divider);
}

.title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
a.title:hover {
  color: var(--vp-c-brand-1);
}
.card.soon .title {
  color: var(--vp-c-text-2);
}

.desc {
  flex: 1;
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--vp-c-text-2);
}

.qs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 12px;
}
.q {
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  text-decoration: none;
}
.q:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.toc-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  margin-top: 36px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 14px;
}
.toc-footer .label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
}
.toc-footer .label:not(:first-child) {
  margin-left: 10px;
}
.toc-footer a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.toc-footer a:hover {
  text-decoration: underline;
}
</style>
