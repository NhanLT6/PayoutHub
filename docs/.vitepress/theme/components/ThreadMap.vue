<script setup lang="ts">
// Bản đồ tổng quan cho runtime/async#cpu-os-threadpool, vẽ như bản đồ du lịch (cùng kiểu SecurityMap):
// request 42 (Approve payout) đi qua một máy chủ: vào OS, xuống hàng đợi của thread pool, được một pool thread
// chạy trên CPU, gửi query sang process SQL Server, rồi quay về chạy tiếp trên một pool thread khác.
// Mỗi vùng ghi rõ nó là gì và ai quản lý. Mỗi trạm làm gì nằm ở dòng thu gọn của FlowStep ngay dưới hình.
// Bấm số trên hình để mở và cuộn tới #step-n.

interface Stop {
  n: number
  x: number
  y: number
  lx: number
  ly: number
  label: string
}

// Toạ độ theo viewBox 1000 × 540. lx, ly: vị trí nhãn của trạm.
const stops: Stop[] = [
  { n: 1, x: 166, y: 295, lx: 196, ly: 342, label: 'OS nhận byte' },
  { n: 2, x: 270, y: 108, lx: 215, ly: 70, label: 'vào hàng đợi' },
  { n: 3, x: 402, y: 96, lx: 402, ly: 74, label: 'W2 thức dậy' },
  { n: 4, x: 500, y: 270, lx: 500, ly: 342, label: 'xếp W2 lên CPU' },
  { n: 5, x: 497, y: 490, lx: 497, ly: 508, label: 'W2 chạy code' },
  { n: 6, x: 730, y: 270, lx: 730, ly: 342, label: 'gửi query, W2 về pool' },
  { n: 7, x: 850, y: 120, lx: 850, ly: 98, label: 'SQL tự chạy' },
  { n: 8, x: 300, y: 270, lx: 290, ly: 342, label: 'kết quả về' },
  { n: 9, x: 552, y: 96, lx: 552, ly: 74, label: 'W5 chạy tiếp' },
]

// Các thread của pool trong process PayoutHub.Api.
const pool = [
  { name: 'W1', x: 352 },
  { name: 'W2', x: 402, hot: true },
  { name: 'W3', x: 452 },
  { name: 'W4', x: 502 },
  { name: 'W5', x: 552, hot: true },
]

// 4 core × 2 logical processor. Ô nào đang chạy thread của PayoutHub.Api thì tô màu brand.
const cores = [
  ['Chrome', 'SQL'],
  ['Rider', 'W2'],
  ['Teams', 'SQL'],
  ['W5', 'Chrome'],
]

const coreX = (i: number) => 150 + i * 205
const lpX = (i: number, j: number) => coreX(i) + 14 + j * 90
const isApi = (t: string) => t.startsWith('W')
</script>

<template>
  <div class="tm">
    <div class="tm-scroll">
      <svg
        class="tm-svg"
        viewBox="0 0 1000 540"
        role="img"
        aria-label="Bản đồ: request đi qua OS, thread pool, CPU và SQL Server"
      >
        <!-- Ngoài máy: mạng -->
        <rect class="z z-net" x="10" y="20" width="110" height="510" rx="14" />
        <text class="zt" x="22" y="44">Mạng</text>
        <text class="zs" x="22" y="60">ngoài máy chủ</text>
        <rect class="obj" x="38" y="282" width="54" height="36" rx="4" />
        <text class="zs" x="65" y="336" text-anchor="middle">browser:</text>
        <text class="zs" x="65" y="350" text-anchor="middle">POST approve</text>

        <!-- Vùng 1: process PayoutHub.Api -->
        <rect class="z z-api" x="140" y="20" width="490" height="190" rx="12" />
        <text class="zt" x="152" y="42">Process PayoutHub.Api</text>
        <text class="zs" x="152" y="58">app .NET của bạn, CLR quản lý thread pool bên trong</text>

        <rect class="obj" x="160" y="80" width="110" height="56" rx="6" />
        <rect class="item" x="174" y="100" width="22" height="16" rx="3" />
        <rect class="item" x="202" y="100" width="22" height="16" rx="3" />
        <text class="zs b" x="215" y="156" text-anchor="middle">Hàng đợi việc</text>
        <text class="zs" x="215" y="170" text-anchor="middle">của thread pool</text>

        <rect class="pool-box" x="325" y="84" width="275" height="64" rx="8" />
        <g v-for="p in pool" :key="p.name">
          <circle :class="['thr', { hot: p.hot }]" :cx="p.x" cy="128" r="12" />
          <text class="thr-t" :x="p.x" y="132" text-anchor="middle">{{ p.name }}</text>
        </g>
        <text class="zs b" x="462" y="166" text-anchor="middle">Thread pool: W1…W5 là OS thread</text>
        <text class="zs" x="462" y="180" text-anchor="middle">CLR tạo sẵn, giữ lại để dùng lại</text>

        <!-- Vùng 2: process SQL Server -->
        <rect class="z z-db" x="650" y="20" width="340" height="190" rx="12" />
        <text class="zt" x="662" y="42">Process SQL Server</text>
        <text class="zs" x="662" y="60">app khác, có thread riêng của nó</text>
        <ellipse class="obj" cx="920" cy="96" rx="30" ry="9" />
        <path class="obj" d="M890 96 v44 a30 9 0 0 0 60 0 v-44" />
        <text class="zs" x="920" y="176" text-anchor="middle">query chạy bằng</text>
        <text class="zs" x="920" y="190" text-anchor="middle">thread của SQL Server</text>

        <!-- Vùng 3: OS kernel -->
        <rect class="z z-os" x="140" y="226" width="850" height="130" rx="12" />
        <text class="zt" x="152" y="250">OS kernel: Windows</text>
        <text class="zs" x="310" y="250">dùng chung cho mọi process</text>

        <rect class="obj" x="166" y="270" width="164" height="50" rx="6" />
        <text class="zs b" x="248" y="292" text-anchor="middle">mạng + IOCP</text>
        <text class="zs" x="248" y="308" text-anchor="middle">báo khi I/O xong</text>

        <rect class="obj" x="400" y="270" width="200" height="50" rx="6" />
        <text class="zs b" x="500" y="292" text-anchor="middle">OS scheduler</text>
        <text class="zs" x="500" y="308" text-anchor="middle">hàng Ready: W2, Chrome, SQL…</text>

        <rect class="obj" x="660" y="270" width="140" height="50" rx="6" />
        <text class="zs b" x="730" y="292" text-anchor="middle">socket</text>
        <text class="zs" x="730" y="308" text-anchor="middle">tới SQL Server</text>

        <!-- Vùng 4: CPU -->
        <rect class="z z-cpu" x="140" y="372" width="850" height="158" rx="12" />
        <text class="zt" x="152" y="396">CPU: phần cứng</text>
        <text class="zs" x="290" y="396">4 core × 2 = 8 logical processor (LP): 8 chỗ chạy cùng lúc</text>
        <g v-for="(lps, i) in cores" :key="i">
          <rect class="core" :x="coreX(i)" y="414" width="190" height="104" rx="8" />
          <text class="zs" :x="coreX(i) + 10" y="508">Core {{ i }}</text>
          <g v-for="(t, j) in lps" :key="j">
            <rect :class="['lp', { hot: isApi(t) }]" :x="lpX(i, j)" y="426" width="76" height="44" rx="5" />
            <text class="lp-n" :x="lpX(i, j) + 6" y="438">LP{{ i * 2 + j }}</text>
            <text class="lp-t" :x="lpX(i, j) + 38" y="458" text-anchor="middle">{{ t }}</text>
          </g>
        </g>

        <!-- Chiều đi (brand, liền) -->
        <path
          class="road-in"
          d="M92 300 L166 295 L230 210 L270 108 L402 96 L500 270 L497 490 M497 490 L620 362 L730 270 L850 120"
        />

        <!-- Chiều về (xanh, nét đứt) -->
        <path
          class="road-back"
          d="M850 120 V218 H300 V270 M292 270 V150 L240 136 M215 80 V64 H552 V96 M560 108 L817 426"
        />

        <!-- Các trạm -->
        <a v-for="s in stops" :key="s.n" :href="`#step-${s.n}`" class="stop">
          <circle :cx="s.x" :cy="s.y" r="13" />
          <text class="stop-n" :x="s.x" :y="s.y + 4" text-anchor="middle">{{ s.n }}</text>
          <text class="stop-l" :x="s.lx" :y="s.ly" text-anchor="middle">{{ s.label }}</text>
        </a>
      </svg>
    </div>

    <p class="tm-legend">
      <span><i class="sw sw-in" /> chiều đi: request tới, chạy tới <code>await</code></span>
      <span><i class="sw sw-back" /> chiều về: kết quả SQL tới, chạy tiếp, trả response</span>
      <span><i class="sw sw-hot" /> thread của PayoutHub.Api</span>
    </p>
    <p class="tm-hint">← kéo ngang để xem cả bản đồ →</p>
  </div>
</template>

<style scoped>
.tm {
  margin: 16px 0;
}

.tm-scroll {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.tm-svg {
  display: block;
  width: 100%;
  min-width: 760px;
  height: auto;
}

/* ---- Vùng ---- */

.z {
  stroke-width: 1.5;
}

.z-net {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
}

.z-api {
  fill: var(--vp-c-purple-soft);
  stroke: var(--vp-c-purple-1);
  stroke-opacity: 0.5;
}

.z-db {
  fill: var(--vp-c-red-soft);
  stroke: var(--vp-c-red-1);
  stroke-opacity: 0.5;
}

.z-os {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-text-3);
  stroke-opacity: 0.6;
}

.z-cpu {
  fill: var(--vp-c-indigo-soft);
  stroke: var(--vp-c-indigo-1);
  stroke-opacity: 0.5;
}

.zt {
  font-family: var(--vp-font-family-base);
  font-size: 14px;
  font-weight: 700;
  fill: var(--vp-c-text-1);
}

.zs {
  font-family: var(--vp-font-family-base);
  font-size: 11px;
  fill: var(--vp-c-text-2);
}

.b {
  font-weight: 600;
  fill: var(--vp-c-text-1);
}

/* ---- Đồ vật ---- */

.obj {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-text-2);
  stroke-width: 1.5;
}

.item {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.2;
}

.pool-box {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-purple-1);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}

.thr {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-text-3);
  stroke-width: 1.5;
}

.thr.hot {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
}

.thr-t,
.lp-t {
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 600;
  fill: var(--vp-c-text-1);
}

.core {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-indigo-1);
  stroke-opacity: 0.5;
  stroke-width: 1.5;
}

.lp {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-text-3);
  stroke-width: 1.2;
}

.lp.hot {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
}

.lp-n {
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  fill: var(--vp-c-text-3);
}

/* ---- Đường ---- */

.road-in,
.road-back {
  fill: none;
  stroke-width: 3;
  stroke-linejoin: round;
}

.road-in {
  stroke: var(--vp-c-brand-1);
  stroke-opacity: 0.55;
}

.road-back {
  stroke: var(--vp-c-green-1);
  stroke-opacity: 0.55;
  stroke-dasharray: 8 5;
}

/* ---- Trạm ---- */

.stop circle {
  fill: var(--vp-c-brand-3);
  stroke: var(--vp-c-bg);
  stroke-width: 3;
}

.stop-n {
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 700;
  fill: var(--vp-c-white);
}

.stop-l {
  font-family: var(--vp-font-family-base);
  font-size: 11.5px;
  font-weight: 600;
  fill: var(--vp-c-text-1);
  paint-order: stroke;
  stroke: var(--vp-c-bg-soft);
  stroke-width: 4px;
}

.stop:hover circle {
  fill: var(--vp-c-brand-2);
}

/* ---- Chú thích ---- */

.tm-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

.tm-legend > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sw {
  display: inline-block;
  width: 22px;
  height: 0;
  border-top: 3px solid;
}

.sw-in {
  border-color: var(--vp-c-brand-1);
}

.sw-back {
  border-color: var(--vp-c-green-1);
  border-top-style: dashed;
}

.sw-hot {
  width: 14px;
  height: 14px;
  border: 2.5px solid var(--vp-c-brand-1);
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
}

.tm-hint {
  display: none;
  margin: 6px 0 0;
  font-size: 12px;
  text-align: center;
  color: var(--vp-c-text-2);
}

@media (max-width: 760px) {
  .tm-hint {
    display: block;
  }
}
</style>
