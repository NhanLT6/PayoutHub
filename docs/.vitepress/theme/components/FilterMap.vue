<script setup lang="ts">
// Bản đồ cho aspnet-core/filters#where, cùng kiểu SecurityMap / ThreadMap.
// Hàng trên: khu middleware (mọi request). Hàng dưới: toà nhà MVC, 5 phòng filter đánh số khớp bảng #order.
// Nhãn dưới đường đi = những gì request mang theo ở từng chặng. /health, 404 rẽ ra trước khi vào toà nhà.

interface Room {
  x: number
  label: string
  sub: string
  n?: number
  kind: 'mw' | 'filter' | 'bind' | 'action'
}

const MW_Y = 100 // đường đi hàng trên
const MVC_Y = 350 // đường đi hàng dưới
const MW_W = 100
const MVC_W = 92

const mwRooms: Room[] = [
  { x: 140, label: 'ExceptionHandler', sub: 'bắt lỗi toàn cục', kind: 'mw' },
  { x: 250, label: 'Routing', sub: 'chọn endpoint', kind: 'mw' },
  { x: 360, label: 'Cors', sub: 'origin hợp lệ?', kind: 'mw' },
  { x: 470, label: 'Authentication', sub: 'ai đây?', kind: 'mw' },
]

const mvcRooms: Room[] = [
  { x: 80, label: 'Authorization', sub: 'filter', n: 1, kind: 'filter' },
  { x: 184, label: 'Resource', sub: 'filter', n: 2, kind: 'filter' },
  { x: 288, label: 'Model binding', sub: 'không phải filter', kind: 'bind' },
  { x: 392, label: 'Action', sub: 'filter', n: 3, kind: 'filter' },
  { x: 496, label: 'Approve(42)', sub: 'code của bạn', kind: 'action' },
  { x: 600, label: 'Result', sub: 'filter', n: 5, kind: 'filter' },
]

// Nhãn request mang theo, xuất hiện dần dọc đường đi.
const mwTags = [
  { x: 300, y: MW_Y + 50, text: 'endpoint = Approve' },
  { x: 520, y: MW_Y + 50, text: 'User = chị Lan' },
]
const mvcTags = [
  { x: 334, y: MVC_Y + 50, text: 'id = 42, ModelState' },
  { x: 542, y: MVC_Y + 50, text: 'IActionResult' },
]
</script>

<template>
  <div class="fm">
    <div class="fm-scroll">
      <svg class="fm-svg" viewBox="0 0 720 580" role="img" aria-label="Request đi qua khu middleware rồi vào toà nhà MVC qua 5 loại filter">
        <!-- Điểm xuất phát -->
        <rect class="env" x="22" y="78" width="80" height="44" rx="5" />
        <path class="env-flap" d="M22 78 l40 22 l40 -22" />
        <text class="zs b" x="62" y="140" text-anchor="middle">POST</text>
        <text class="zs mono" x="62" y="154" text-anchor="middle">/payouts/42</text>
        <text class="zs mono" x="62" y="166" text-anchor="middle">/approve</text>

        <!-- Khu 1: middleware -->
        <rect class="z z-mw" x="120" y="16" width="584" height="190" rx="14" />
        <text class="zt" x="136" y="40">Khu middleware</text>
        <text class="zs" x="136" y="56">mọi request đều đi qua; chỉ thấy HttpContext</text>

        <!-- Khu 2: toà nhà MVC -->
        <rect class="z z-mvc" x="20" y="250" width="684" height="300" rx="14" />
        <text class="zt" x="96" y="274">Toà nhà MVC: action PayoutsController.Approve</text>
        <text class="zs" x="96" y="290">chỉ request được Routing chọn tới một action MVC mới vào</text>
        <rect class="door" x="44" y="242" width="32" height="16" rx="3" />

        <!-- Đường đi: hàng trên → xuống → hàng dưới -->
        <path class="road" :d="`M102 ${MW_Y} H650 V226 H60 V${MVC_Y} H${mvcRooms[5].x + MVC_W / 2}`" />

        <!-- Phòng middleware -->
        <g v-for="r in mwRooms" :key="r.label">
          <rect class="room k-mw" :x="r.x" :y="MW_Y - 24" :width="MW_W" height="48" rx="7" />
          <text class="rt" :x="r.x + MW_W / 2" :y="MW_Y - 3" text-anchor="middle">{{ r.label }}</text>
          <text class="rs" :x="r.x + MW_W / 2" :y="MW_Y + 12" text-anchor="middle">{{ r.sub }}</text>
        </g>

        <!-- Phòng trong toà nhà MVC -->
        <g v-for="r in mvcRooms" :key="r.label">
          <rect :class="['room', `k-${r.kind}`]" :x="r.x" :y="MVC_Y - 26" :width="MVC_W" height="52" rx="7" />
          <text class="rt" :x="r.x + MVC_W / 2" :y="MVC_Y - 3" text-anchor="middle">{{ r.label }}</text>
          <text class="rs" :x="r.x + MVC_W / 2" :y="MVC_Y + 12" text-anchor="middle">{{ r.sub }}</text>
          <g v-if="r.n" class="stop">
            <circle :cx="r.x + MVC_W / 2" :cy="MVC_Y - 40" r="12" />
            <text class="stop-n" :x="r.x + MVC_W / 2" :y="MVC_Y - 36" text-anchor="middle">{{ r.n }}</text>
          </g>
        </g>

        <!-- Nhãn request mang theo -->
        <g v-for="t in [...mwTags, ...mvcTags]" :key="t.text">
          <line class="tag-ln" :x1="t.x" :y1="t.y - 26" :x2="t.x" :y2="t.y" />
          <rect class="tag" :x="t.x - 62" :y="t.y" width="124" height="22" rx="11" />
          <text class="tag-t" :x="t.x" :y="t.y + 15" text-anchor="middle">{{ t.text }}</text>
        </g>
        <text class="zs" x="36" y="448">càng vào trong nhãn càng nhiều: tới phòng 3 đã có id = 42 và ModelState,</text>
        <text class="zs" x="36" y="462">thứ mà middleware ở hàng trên chưa có</text>

        <!-- /health, 404: rẽ ra, không vào toà nhà -->
        <path class="branch" :d="`M610 ${MW_Y} V140`" />
        <rect class="room k-mw dashed" x="584" y="140" width="112" height="44" rx="7" />
        <text class="rt" x="640" y="158" text-anchor="middle">/health, 404</text>
        <text class="rs" x="640" y="173" text-anchor="middle">rẽ ra ở đây: 0 filter</text>

        <!-- Nhánh 4: Exception filter -->
        <path class="branch" :d="`M542 ${MVC_Y + 26} V398`" />
        <path class="branch" d="M542 422 V472" />
        <rect class="room k-filter dashed" x="492" y="472" width="100" height="40" rx="7" />
        <text class="rt" x="542" y="490" text-anchor="middle">Exception filter</text>
        <text class="rs" x="542" y="504" text-anchor="middle">chỉ khi ném lỗi</text>
        <g class="stop">
          <circle cx="478" cy="492" r="12" />
          <text class="stop-n" x="478" y="496" text-anchor="middle">4</text>
        </g>
        <path class="branch" d="M592 492 H620 V562" />
        <text class="zs" x="612" y="536" text-anchor="end">bỏ qua Result, ra luôn</text>

        <!-- Đường về -->
        <path class="road-back" :d="`M646 ${MVC_Y + 26} V562 H10 V100 H22`" />
        <text class="back-t" x="36" y="556">← response 204 đi ngược ra, qua code sau next của từng middleware</text>
      </svg>
    </div>

    <p class="fm-legend">
      <span><i class="sw sw-mw" /> middleware</span>
      <span><i class="sw sw-filter" /> filter (số khớp bảng thứ tự)</span>
      <span><i class="sw sw-bind" /> bước của MVC, không phải filter</span>
      <span><i class="sw sw-tag" /> request mang theo gì</span>
    </p>
    <p class="fm-hint">← kéo ngang để xem cả bản đồ →</p>
  </div>
</template>

<style scoped>
.fm {
  margin: 16px 0;
}

.fm-scroll {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.fm-svg {
  display: block;
  width: 100%;
  min-width: 600px;
  height: auto;
}

/* ---- Vùng ---- */

.z {
  stroke-width: 1.5;
}

.z-mw {
  fill: var(--vp-c-indigo-soft);
  stroke: var(--vp-c-indigo-1);
  stroke-opacity: 0.5;
}

.z-mvc {
  fill: var(--vp-c-green-soft);
  stroke: var(--vp-c-green-1);
  stroke-opacity: 0.6;
}

.door {
  fill: var(--vp-c-green-1);
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
  font-weight: 700;
  fill: var(--vp-c-text-1);
}

.mono {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
}

.it {
  font-style: italic;
}

/* ---- Phong bì ---- */

.env,
.env-flap {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.8;
}

.env-flap {
  fill: none;
}

/* ---- Phòng ---- */

.room {
  stroke-width: 1.5;
}

.k-mw {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-indigo-1);
}

.k-filter {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-green-1);
  stroke-width: 2.2;
}

.k-bind {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-text-3);
  stroke-dasharray: 4 3;
}

.k-action {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
}

.dashed {
  stroke-dasharray: 5 4;
}

.rt {
  font-family: var(--vp-font-family-base);
  font-size: 11px;
  font-weight: 700;
  fill: var(--vp-c-text-1);
}

.rs {
  font-family: var(--vp-font-family-base);
  font-size: 10px;
  fill: var(--vp-c-text-2);
}

/* ---- Đường ---- */

.road {
  stroke: var(--vp-c-brand-1);
  stroke-width: 6;
  stroke-opacity: 0.25;
  fill: none;
}

.road-back {
  stroke: var(--vp-c-text-3);
  stroke-width: 2;
  fill: none;
}

.road-side,
.branch {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.8;
  stroke-dasharray: 5 4;
  fill: none;
}

.back-t {
  font-family: var(--vp-font-family-base);
  font-size: 11px;
  font-weight: 600;
  fill: var(--vp-c-text-2);
}

/* ---- Nhãn ---- */

.tag-ln {
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.2;
  stroke-dasharray: 2 3;
}

.tag {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.2;
}

.tag-t {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 600;
  fill: var(--vp-c-brand-1);
}

/* ---- Số thứ tự ---- */

.stop circle {
  fill: var(--vp-c-green-1);
  stroke: var(--vp-c-bg);
  stroke-width: 3;
}

.stop-n {
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 700;
  fill: var(--vp-c-white);
}

/* ---- Chú thích ---- */

.fm-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

.fm-legend > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sw {
  display: inline-block;
  width: 16px;
  height: 12px;
  border-radius: 3px;
  border: 2px solid;
}

.sw-mw {
  border-color: var(--vp-c-indigo-1);
}

.sw-filter {
  border-color: var(--vp-c-green-1);
}

.sw-bind {
  border-color: var(--vp-c-text-3);
  border-style: dashed;
}

.sw-tag {
  border-color: var(--vp-c-brand-1);
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
}

.fm-hint {
  display: none;
  margin: 6px 0 0;
  font-size: 12px;
  text-align: center;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .fm-hint {
    display: block;
  }
}
</style>
