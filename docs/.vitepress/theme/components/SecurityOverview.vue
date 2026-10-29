<script setup lang="ts">
// Bản đồ tổng quan cho aspnet-core/api-security: một hình nằm ngang, browser bên trái → DB bên phải.
// Làn trên (dày) = request đi vào qua 11 lớp; làn dưới (mỏng, phải → trái) = response đi ra.
// Mục đích: bản đồ để nhớ lại (recall map). Mỗi cổng là một bước của FlowStep: số bước, 2 từ khoá gợi nhớ,
// dòng đỏ = chặn gì, bấm để tới #step-n. Từ khoá, không viết câu.
// Màu cổng = màu tầng của FlowStep. Ký hiệu góc phải: vuông = blocklist, tròn = allowlist, thoi = ngưỡng/hành vi.
// Dùng: <div class="so-host"><SecurityOverview /></div> trong markdown (bọc div để VitePress không bọc <p>,
// vì <p> ở cấp ngoài bị giới hạn 820px trong custom.css). Chỉ dùng biến màu của theme nên tự đổi light/dark.
type Kind = 'deny' | 'allow' | 'limit'
type Gate = { n: number; zone: number; color: string; a: string; b: string; blocks: string; kind: Kind }

const gates: Gate[] = [
  { n: 1, zone: 0, color: 'gray', a: 'TLS·cert', b: 'HSTS', blocks: 'MITM', kind: 'allow' },
  { n: 2, zone: 0, color: 'indigo', a: 'CDN', b: 'DDoS', blocks: 'flood', kind: 'deny' },
  { n: 3, zone: 0, color: 'indigo', a: 'WAF', b: 'pattern', blocks: 'SQLi · XSS', kind: 'deny' },
  { n: 4, zone: 1, color: 'purple', a: 'gateway', b: ':443', blocks: 'direct hit', kind: 'allow' },
  { n: 5, zone: 2, color: 'purple', a: 'limit', b: '→ 429', blocks: 'brute force', kind: 'limit' },
  { n: 6, zone: 2, color: 'indigo', a: 'CORS', b: 'origin?', blocks: 'evil page', kind: 'allow' },
  { n: 7, zone: 2, color: 'purple', a: 'JWT sig', b: '→ 401', blocks: 'fake user', kind: 'allow' },
  { n: 8, zone: 2, color: 'purple', a: 'policy', b: '→ 403', blocks: 'wrong role', kind: 'allow' },
  { n: 9, zone: 2, color: 'green', a: 'IDOR', b: 'owner?', blocks: 'not yours', kind: 'allow' },
  { n: 10, zone: 2, color: 'green', a: 'validate', b: '@p0', blocks: 'injection', kind: 'allow' },
  { n: 11, zone: 3, color: 'red', a: 'least priv', b: 'TDE · Vault', blocks: 'blast radius', kind: 'allow' },
]
const zones = [
  { label: 'Edge · Front Door' },
  { label: 'Gateway' },
  { label: 'App · ASP.NET Core: middleware → handler' },
  { label: 'Data' },
]

// Cột nội dung ở 1440px rộng khoảng 830px: viewBox ~1056 nên chữ 15px hiện ra khoảng 12px.
const W = 76,
  W_LAST = 100,
  GAP = 5,
  ZGAP = 10,
  X0 = 62,
  GY = 66,
  GH = 112
const gw = (i: number) => (i === gates.length - 1 ? W_LAST : W)
const pos: number[] = []
let x = X0
gates.forEach((g, i) => {
  if (i > 0) x += gw(i - 1) + (g.zone !== gates[i - 1].zone ? ZGAP : GAP)
  pos.push(x)
})
const zoneBox = zones.map((z, zi) => {
  const idx = gates.map((g, i) => (g.zone === zi ? i : -1)).filter((i) => i >= 0)
  const x0 = pos[idx[0]],
    x1 = pos[idx[idx.length - 1]] + gw(idx[idx.length - 1])
  return { ...z, x: x0 - 4, w: x1 - x0 + 8 }
})
const appEnd = zoneBox[2].x + zoneBox[2].w
const dbX = pos[pos.length - 1] + W_LAST + 12
const VW = dbX + 60
const stroke = (c: string) => (c === 'gray' ? 'var(--vp-c-text-2)' : `var(--vp-c-${c}-1)`)
const soft = (c: string) => `var(--vp-c-${c}-soft)`
const kindColor: Record<Kind, string> = {
  deny: 'var(--vp-c-red-1)',
  allow: 'var(--vp-c-green-1)',
  limit: 'var(--vp-c-warning-1)',
}
const kindText: Record<Kind, string> = {
  deny: 'blocklist (pattern)',
  allow: 'allowlist / deny by default',
  limit: 'threshold / behavior',
}
</script>

<template>
  <div class="so-wrap">
    <svg
      class="so"
      :viewBox="`0 0 ${VW} 340`"
      role="img"
      aria-label="Bản đồ tổng quan: 11 lớp chiều vào, 3 lớp chiều ra"
    >
      <!-- nhãn làn -->
      <text class="t tb lane-t" :x="X0 - 4" y="20">INBOUND · request → (nặng: 11 lớp)</text>
      <text class="t tb lane-t" :x="X0 - 4" y="240">← OUTBOUND · response (nhẹ)</text>

      <!-- vùng -->
      <g v-for="z in zoneBox" :key="z.label">
        <rect class="zone" :x="z.x" y="32" :width="z.w" height="160" rx="8" />
        <text class="t s tb muted" :x="z.x + 8" y="51">{{ z.label }}</text>
      </g>

      <!-- làn vào: dải dày từ browser tới DB -->
      <line class="lane-in" x1="56" y1="121" :x2="dbX - 4" y2="121" />
      <path class="head-in" :d="`M${dbX - 4} 111 l12 10 l-12 10 z`" />

      <!-- browser và DB -->
      <rect class="end" x="2" y="86" width="54" height="70" rx="8" />
      <text class="t xs tb" x="29" y="118" text-anchor="middle">Browser</text>
      <text class="t xs muted" x="29" y="134" text-anchor="middle">Finance</text>
      <g>
        <path class="db" :d="`M${dbX + 4} 92 v52 a24 8 0 0 0 48 0 v-52`" />
        <ellipse class="db" :cx="dbX + 28" cy="92" rx="24" ry="8" />
        <text class="t s tb" :x="dbX + 28" y="126" text-anchor="middle">SQL</text>
        <text class="t s tb" :x="dbX + 28" y="140" text-anchor="middle">Server</text>
      </g>

      <!-- cổng -->
      <a v-for="(g, i) in gates" :key="g.n" class="gate" :href="`#step-${g.n}`">
        <title>Bước {{ g.n }}: {{ g.a }} {{ g.b }} (chặn {{ g.blocks }})</title>
        <rect class="gate-bg" :x="pos[i]" :y="GY" :width="gw(i)" :height="GH" rx="7" />
        <rect
          class="gate-box"
          :x="pos[i]"
          :y="GY"
          :width="gw(i)"
          :height="GH"
          rx="7"
          :style="{ fill: soft(g.color), stroke: stroke(g.color) }"
        />
        <circle :cx="pos[i] + 15" :cy="GY + 16" r="10" :style="{ fill: stroke(g.color) }" />
        <text class="t s tb on" :x="pos[i] + 15" :y="GY + 20" text-anchor="middle">{{ g.n }}</text>
        <rect
          v-if="g.kind === 'deny'"
          :x="pos[i] + gw(i) - 18"
          :y="GY + 10"
          width="10"
          height="10"
          :style="{ fill: kindColor.deny }"
        />
        <circle
          v-else-if="g.kind === 'allow'"
          :cx="pos[i] + gw(i) - 13"
          :cy="GY + 15"
          r="5.5"
          :style="{ fill: kindColor.allow }"
        />
        <path v-else :d="`M${pos[i] + gw(i) - 13} ${GY + 8} l7 7 l-7 7 l-7 -7 z`" :style="{ fill: kindColor.limit }" />
        <text class="t tb cue" :x="pos[i] + gw(i) / 2" :y="GY + 50" text-anchor="middle">{{ g.a }}</text>
        <text class="t cue2" :x="pos[i] + gw(i) / 2" :y="GY + 68" text-anchor="middle">{{ g.b }}</text>
        <line class="sep" :x1="pos[i] + 10" :y1="GY + 80" :x2="pos[i] + gw(i) - 10" :y2="GY + 80" />
        <text class="t xs bad" :x="pos[i] + gw(i) / 2" :y="GY + 98" text-anchor="middle">{{ g.blocks }}</text>
      </a>

      <!-- làn ra: mảnh, phải → trái, bắt đầu từ handler -->
      <line class="lane-out" :x1="appEnd - 6" y1="270" x2="40" y2="270" />
      <path class="head-out" d="M40 264 l-9 6 l9 6 z" />
      <line class="lane-out" :x1="appEnd - 6" y1="192" :x2="appEnd - 6" y2="270" />
      <line class="lane-out" x1="29" y1="156" x2="29" y2="270" />

      <a class="gate" href="#step-12">
        <title>Bước 12: ProblemDetails, không stack trace</title>
        <rect class="gate-bg" :x="appEnd - 290" y="252" width="270" height="36" rx="6" />
        <rect class="out-box" :x="appEnd - 290" y="252" width="270" height="36" rx="6" />
        <text class="t s tb" :x="appEnd - 155" y="275" text-anchor="middle">12 · ProblemDetails, no stack trace</text>
      </a>
      <a class="gate" href="#step-12">
        <title>Bước 12: security headers</title>
        <rect class="gate-bg" :x="appEnd - 520" y="252" width="210" height="36" rx="6" />
        <rect class="out-box" :x="appEnd - 520" y="252" width="210" height="36" rx="6" />
        <text class="t s tb" :x="appEnd - 415" y="275" text-anchor="middle">12 · HSTS · nosniff · CSP</text>
      </a>
      <a class="gate" href="#step-1">
        <title>Bước 1: TLS mã hoá cả chiều về</title>
        <rect class="gate-bg" :x="pos[0]" y="252" width="170" height="36" rx="6" />
        <rect class="out-box" :x="pos[0]" y="252" width="170" height="36" rx="6" />
        <text class="t s tb" :x="pos[0] + 85" y="275" text-anchor="middle">1 · TLS again (encrypt)</text>
      </a>

      <!-- audit bên cạnh -->
      <line class="tap" :x1="appEnd - 30" y1="192" :x2="zoneBox[3].x + 20" y2="226" />
      <a class="gate" href="#step-13">
        <title>Bước 13: audit log và alert</title>
        <rect class="gate-bg" :x="zoneBox[3].x" y="222" :width="VW - zoneBox[3].x - 8" height="66" rx="7" />
        <rect
          class="gate-box"
          :x="zoneBox[3].x"
          y="222"
          :width="VW - zoneBox[3].x - 8"
          height="66"
          rx="7"
          style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-text-2)"
        />
        <path :d="`M${VW - 24} 230 l7 7 l-7 7 l-7 -7 z`" :style="{ fill: kindColor.limit }" />
        <text class="t s tb" :x="zoneBox[3].x + 10" y="244">13 · audit + alert</text>
        <text class="t xs muted" :x="zoneBox[3].x + 10" y="262">who · what · when</text>
        <text class="t xs muted" :x="zoneBox[3].x + 10" y="279">no token · baseline</text>
      </a>

      <!-- chú thích -->
      <g transform="translate(8 326)">
        <rect x="0" y="-10" width="11" height="11" :style="{ fill: kindColor.deny }" />
        <text class="t s" x="18" y="0">{{ kindText.deny }}: luôn đi sau kẻ tấn công</text>
        <circle cx="358" cy="-4.5" r="6" :style="{ fill: kindColor.allow }" />
        <text class="t s" x="370" y="0">{{ kindText.allow }}</text>
        <path d="M580 -12 l7.5 7.5 l-7.5 7.5 l-7.5 -7.5 z" :style="{ fill: kindColor.limit }" />
        <text class="t s" x="593" y="0">{{ kindText.limit }}</text>
        <text class="t s muted" :x="VW - 16" y="0" text-anchor="end">bấm cổng → tới bước</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.so-wrap {
  margin: 16px 0;
  padding: 10px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}
/* Rộng tối thiểu để chữ đọc được; màn hình hẹp thì cuộn ngang bên trong khung, không cuộn cả trang */
.so {
  display: block;
  width: 100%;
  min-width: 760px;
  height: auto;
}

/* class + data-v thắng `.vp-doc svg text` trong custom.css */
.so .t {
  font-family: var(--vp-font-family-base);
  font-size: 14px;
  fill: var(--vp-c-text-1);
}
.so .t.s {
  font-size: 13.5px;
}
.so .t.xs {
  font-size: 12.5px;
}
.so .t.tb {
  font-weight: 700;
}
.so .t.muted {
  fill: var(--vp-c-text-2);
}
.so .t.bad {
  fill: var(--vp-c-red-1);
}
.so .t.on {
  fill: var(--vp-c-white);
}
.so .t.cue {
  font-size: 15px;
}
.so .t.cue2 {
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  fill: var(--vp-c-text-2);
}
.so .t.lane-t {
  font-size: 12.5px;
  letter-spacing: 0.06em;
  fill: var(--vp-c-text-2);
}

.so .zone {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}
.so .lane-in {
  stroke: var(--vp-c-brand-1);
  stroke-width: 12;
  opacity: 0.28;
  stroke-linecap: round;
}
.so .head-in {
  fill: var(--vp-c-brand-1);
  opacity: 0.5;
}
.so .lane-out {
  stroke: var(--vp-c-text-3);
  stroke-width: 2;
  fill: none;
}
.so .head-out {
  fill: var(--vp-c-text-3);
}
.so .tap {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.5;
  stroke-dasharray: 3 4;
}
.so .end {
  fill: var(--vp-c-indigo-soft);
  stroke: var(--vp-c-indigo-1);
  stroke-width: 1.5;
}
.so .db {
  fill: var(--vp-c-red-soft);
  stroke: var(--vp-c-red-1);
  stroke-width: 1.5;
}
.so .gate-bg {
  fill: var(--vp-c-bg);
}
.so .gate-box {
  stroke-width: 1.6;
}
.so .out-box {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-text-3);
  stroke-width: 1.2;
}
.so .sep {
  stroke: var(--vp-c-divider);
  stroke-width: 1;
}
.so .gate {
  cursor: pointer;
  text-decoration: none;
}
.so .gate:hover .gate-box,
.so .gate:hover .out-box {
  stroke-width: 3;
}
.so .gate:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
}
</style>
