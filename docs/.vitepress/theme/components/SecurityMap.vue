<script setup lang="ts">
// Bản đồ tổng quan cho aspnet-core/api-security, vẽ như bản đồ du lịch:
// request của chị Lan đi từ "nhà" (browser) qua "cổng thành" (edge của Microsoft),
// vào "khu tường bao" (VNet của mình), qua các phòng trong "toà nhà app", xuống "kho" (database), rồi đi đường về.
// Hình trả lời: cái gì nằm ở đâu, ai vận hành, và mỗi trạm hỏi câu gì. Chi tiết nằm ở bảng dưới hình.
// Bấm số trên hình hoặc một dòng trong bảng để tới #step-n.

interface Stop {
  n: number
  x: number
  y: number
  label: string
}

interface Station {
  n: number
  name: string
  where: string
  asks: string
}

// Trạm trên đường vào (y = 150) và đường về (y = 380). Toạ độ theo viewBox 1000 × 430.
const stops: Stop[] = [
  { n: 1, x: 190, y: 150, label: 'TLS' },
  { n: 6, x: 80, y: 285, label: 'CORS' },
  { n: 2, x: 275, y: 150, label: 'DDoS' },
  { n: 3, x: 400, y: 150, label: 'WAF' },
  { n: 4, x: 478, y: 150, label: 'Gateway' },
  { n: 5, x: 560, y: 150, label: 'Rate limit' },
  { n: 7, x: 625, y: 150, label: 'JWT' },
  { n: 8, x: 690, y: 150, label: 'Policy' },
  { n: 9, x: 752, y: 150, label: 'Owner' },
  { n: 10, x: 810, y: 150, label: 'Validate' },
  { n: 11, x: 905, y: 150, label: 'DB' },
  { n: 12, x: 690, y: 380, label: 'Response' },
  { n: 13, x: 858, y: 312, label: 'Monitor' },
]

const stations: Station[] = [
  { n: 1, name: 'TLS', where: 'đường ống browser ↔ edge', asks: 'Có đúng server không? Ai nghe lén được không?' },
  { n: 2, name: 'Chống DDoS', where: 'edge (Microsoft)', asks: 'Có phải lũ traffic ồ ạt không?' },
  { n: 3, name: 'WAF', where: 'edge, sau khi mở ống TLS', asks: 'Nội dung có pattern tấn công đã biết không?' },
  { n: 4, name: 'Gateway', where: 'cổng duy nhất vào VNet', asks: 'Có đi đúng cổng, đúng route không?' },
  { n: 5, name: 'Rate limit', where: 'middleware đầu tiên', asks: 'Người này gọi quá nhiều chưa? (429)' },
  { n: 6, name: 'CORS', where: 'trong browser', asks: 'Trang web này có được đọc response không?' },
  { n: 7, name: 'JWT', where: 'middleware', asks: 'Bạn là ai? (401)' },
  { n: 8, name: 'Policy', where: 'middleware', asks: 'Bạn được làm việc này không? (403)' },
  { n: 9, name: 'Owner check', where: 'handler, code của bạn', asks: 'Payout 42 có phải của công ty bạn không?' },
  { n: 10, name: 'Validation', where: 'handler + EF Core', asks: 'Dữ liệu đúng không? SQL có dùng tham số không?' },
  {
    n: 11,
    name: 'DB + Key Vault',
    where: 'trong VNet, không ra internet',
    asks: 'Nếu lớp trước thủng, thiệt hại tới đâu?',
  },
  { n: 12, name: 'Response', where: 'đường về', asks: 'Có lộ gì thừa không? (stack trace, header)' },
  { n: 13, name: 'Monitoring', where: 'nhìn cả khu', asks: 'Chuyện gì đã xảy ra? Có gì bất thường?' },
]
</script>

<template>
  <div class="sm">
    <div class="sm-scroll">
      <svg
        class="sm-svg"
        viewBox="0 0 1000 430"
        role="img"
        aria-label="Bản đồ: request đi từ browser qua edge, VNet, app, database rồi quay về"
      >
        <!-- Vùng 1: nhà của user -->
        <rect class="z z-user" x="10" y="40" width="140" height="370" rx="14" />
        <text class="zt" x="22" y="64">Nhà: browser</text>
        <text class="zs" x="22" y="80">máy của chị Lan</text>

        <rect class="obj" x="52" y="118" width="56" height="38" rx="4" />
        <rect class="obj" x="44" y="156" width="72" height="6" rx="3" />
        <text class="zs" x="80" y="182" text-anchor="middle">bấm Approve</text>

        <!-- Internet -->
        <text class="zs it" x="190" y="64" text-anchor="middle">Internet</text>
        <text class="zs it" x="190" y="80" text-anchor="middle">ai cũng thấy</text>

        <!-- Vùng 2: cổng thành của Microsoft -->
        <rect class="z z-ms" x="230" y="40" width="210" height="370" rx="14" />
        <text class="zt" x="242" y="64">Cổng thành: Edge</text>
        <text class="zs" x="242" y="80">Azure Front Door</text>
        <text class="zs" x="242" y="94">Microsoft chạy, bạn cấu hình</text>

        <g class="obj-g">
          <rect class="obj" x="300" y="230" width="110" height="46" rx="6" />
          <line class="shelf" x1="308" y1="245" x2="402" y2="245" />
          <line class="shelf" x1="308" y1="260" x2="402" y2="260" />
          <text class="zs" x="355" y="294" text-anchor="middle">CDN cache: file tĩnh</text>
          <text class="zs" x="355" y="308" text-anchor="middle">trả luôn từ đây</text>
        </g>

        <g>
          <rect class="open-lock" x="324" y="134" width="28" height="22" rx="4" />
          <path class="open-lock-arc" d="M330 134 v-6 a8 8 0 0 1 16 0" />
          <text class="zs" x="338" y="180" text-anchor="middle">mở ống TLS</text>
          <text class="zs" x="338" y="194" text-anchor="middle">để soi được</text>
        </g>

        <!-- Vùng 3: khu tường bao của mình -->
        <rect class="z z-you" x="460" y="24" width="530" height="394" rx="16" />
        <text class="zt" x="500" y="48">Khu tường bao: VNet của bạn</text>
        <text class="zs" x="500" y="64">mạng riêng trên Azure, không có IP public, chỉ vào qua cổng ④</text>

        <!-- Toà nhà app -->
        <rect class="z z-code" x="525" y="92" width="315" height="150" rx="10" />
        <text class="zt" x="537" y="112">Toà nhà App: ASP.NET Core</text>
        <text class="zs" x="537" y="226">middleware</text>
        <text class="zs" x="740" y="226">handler (code của bạn)</text>
        <line class="divider" x1="722" y1="120" x2="722" y2="232" />

        <!-- Kho dữ liệu -->
        <rect class="z z-db" x="860" y="92" width="115" height="150" rx="10" />
        <text class="zt" x="872" y="112">Kho dữ liệu</text>
        <ellipse class="obj" cx="905" cy="186" rx="26" ry="8" />
        <path class="obj" d="M879 186 v28 a26 8 0 0 0 52 0 v-28" />
        <text class="zs" x="905" y="234" text-anchor="middle">SQL Server</text>

        <rect class="obj" x="860" y="254" width="115" height="34" rx="6" />
        <text class="zs" x="917" y="275" text-anchor="middle">Key Vault: mật khẩu</text>

        <!-- Tháp canh -->
        <path class="tower" d="M890 330 l15 -36 l15 36 z" />
        <line class="watch" x1="858" y1="298" x2="840" y2="244" />
        <line class="watch" x1="905" y1="294" x2="905" y2="288" />
        <text class="zs" x="905" y="346" text-anchor="middle">Tháp canh:</text>
        <text class="zs" x="905" y="360" text-anchor="middle">log, audit, alert</text>

        <!-- Đường vào: ống TLS dày -->
        <path class="road-in" d="M116 140 H880" />
        <path class="pipe" d="M116 132 H330 M116 148 H330" />
        <path class="pipe2" d="M346 132 H478 M346 148 H478" />
        <text class="road-t" x="140" y="124">đường vào →</text>

        <!-- Đường về: mỏng -->
        <path class="road-out" d="M860 380 H80 V200" />
        <text class="road-t" x="140" y="374">← đường về (response)</text>

        <!-- Tường VNet và cổng -->
        <rect class="gate" x="470" y="124" width="16" height="32" rx="2" />

        <!-- CORS: luật nằm trong browser -->
        <path class="hint" d="M80 270 V200" />

        <!-- Các trạm -->
        <a v-for="s in stops" :key="s.n" :href="`#step-${s.n}`" class="stop">
          <circle :cx="s.x" :cy="s.y === 150 ? 140 : s.y" r="13" />
          <text class="stop-n" :x="s.x" :y="(s.y === 150 ? 140 : s.y) + 4" text-anchor="middle">{{ s.n }}</text>
          <text class="stop-l" :x="s.x" :y="s.y === 150 ? 170 : s.y + (s.n === 12 ? -20 : 28)" text-anchor="middle">
            {{ s.label }}
          </text>
        </a>
      </svg>
    </div>

    <p class="sm-hint">← kéo ngang để xem cả bản đồ →</p>

    <div class="sm-legend">
      <a v-for="s in stations" :key="s.n" :href="`#step-${s.n}`" class="sm-item">
        <span class="sm-n">{{ s.n }}</span>
        <span class="sm-body">
          <strong>{{ s.name }}</strong>
          <span class="sm-where">{{ s.where }}</span>
          <span class="sm-asks">{{ s.asks }}</span>
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.sm {
  margin: 16px 0;
}

.sm-scroll {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.sm-svg {
  display: block;
  width: 100%;
  min-width: 760px;
  height: auto;
}

/* Vùng */
.z {
  stroke-width: 1.5;
}

.z-user {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
}

.z-ms {
  fill: var(--vp-c-indigo-soft);
  stroke: var(--vp-c-indigo-1);
  stroke-opacity: 0.5;
}

.z-you {
  fill: none;
  stroke: var(--vp-c-green-1);
  stroke-width: 3;
  stroke-dasharray: 10 6;
}

.z-code {
  fill: var(--vp-c-purple-soft);
  stroke: var(--vp-c-purple-1);
  stroke-opacity: 0.5;
}

.z-db {
  fill: var(--vp-c-red-soft);
  stroke: var(--vp-c-red-1);
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

.it {
  font-style: italic;
}

/* Đồ vật */
.obj {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-text-2);
  stroke-width: 1.5;
}

.shelf,
.divider {
  stroke: var(--vp-c-divider);
  stroke-width: 1.5;
}

.divider {
  stroke-dasharray: 4 4;
}

.open-lock {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-indigo-1);
  stroke-width: 1.8;
}

.open-lock-arc {
  fill: none;
  stroke: var(--vp-c-indigo-1);
  stroke-width: 1.8;
}

.tower {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-text-2);
  stroke-width: 1.5;
}

.watch,
.hint {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.2;
  stroke-dasharray: 3 4;
}

.gate {
  fill: var(--vp-c-green-1);
}

/* Đường */
.road-in {
  stroke: var(--vp-c-brand-1);
  stroke-width: 6;
  stroke-opacity: 0.25;
  fill: none;
}

.pipe,
.pipe2 {
  stroke: var(--vp-c-brand-1);
  stroke-width: 2;
  fill: none;
}

.pipe2 {
  stroke-dasharray: 6 4;
}

.road-out {
  stroke: var(--vp-c-text-3);
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 2 0;
}

.road-t {
  font-family: var(--vp-font-family-base);
  font-size: 11px;
  font-weight: 600;
  fill: var(--vp-c-brand-1);
}

/* Trạm */
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
}

.stop:hover circle {
  fill: var(--vp-c-brand-2);
}

.sm-hint {
  display: none;
  margin: 6px 0 0;
  font-size: 12px;
  text-align: center;
  color: var(--vp-c-text-2);
}

@media (max-width: 760px) {
  .sm-hint {
    display: block;
  }
}

/* Bảng dưới hình */
.sm-legend {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 6px 14px;
  margin-top: 12px;
}

.sm-item {
  display: flex;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  font-size: 13.5px;
  line-height: 1.45;
}

.sm-item:hover {
  background: var(--vp-c-default-soft);
}

.sm-n {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
  color: var(--vp-c-white);
  background: var(--vp-c-brand-3);
}

.sm-body {
  display: flex;
  flex-direction: column;
}

.sm-where {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
</style>
