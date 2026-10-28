<script setup lang="ts">
// Sơ đồ dòng thời gian có hoạt hình: mỗi hàng (lane) là một thread / core, thời gian chạy từ trái sang phải.
// Một "đầu đọc" (playhead) quét từ trái sang phải rồi lặp lại; thanh nào đầu đọc đi qua thì được tô dần,
// thanh đang bị đầu đọc chạm thì sáng lên. Có nút tạm dừng; nếu máy bật "giảm chuyển động" thì chỉ hiện hình tĩnh.
//
// Viết cả thẻ trên MỘT dòng trong markdown (dòng trống trong thuộc tính làm hỏng parse), chuỗi dùng nháy đơn,
// không dùng ký tự < > trong chuỗi:
// <Timeline :duration="10" :markers="[{ at: 6, text: 'SQL trả lời' }]" :lanes="[{ label: 'Thread #7', segments: [{ from: 0, to: 3, text: 'pipeline', kind: 'busy' }] }]" caption="..." />
//
// kind: busy (thread bị chiếm, cam) | wait (thread bị giữ nhưng chỉ ngồi chờ, khung cam nét đứt)
//       | free (thread rảnh / về pool, xanh) | io (chờ I/O, không chiếm thread, khung nét đứt)
//       | cpu (core chạy việc A, màu brand) | other (việc khác, xám)
// group (tuỳ chọn) trên lane: các lane liền nhau cùng group được gom dưới một tiêu đề nhỏ.
// plain: bỏ khung .fig (dùng khi đã nằm trong một khung khác, ví dụ trong <Compare>).
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'

type Kind = 'busy' | 'wait' | 'free' | 'cpu' | 'io' | 'other'
interface Segment { from: number; to: number; text?: string; kind: Kind }
interface Lane { label: string; sub?: string; group?: string; segments: Segment[] }

const props = defineProps<{
  lanes: Lane[]
  duration: number
  caption?: string
  markers?: { at: number; text: string }[]
  plain?: boolean
}>()

// Kích thước trong hệ toạ độ viewBox (SVG tự co giãn theo bề rộng trang).
const W = 720
const X0 = 132          // bắt đầu vùng vẽ (bên trái là nhãn lane)
const X1 = 704          // kết thúc vùng vẽ
const TOP = 26          // chừa chỗ cho chữ của marker
const LANE_H = 34
const BAR_H = 22
const GROUP_H = 24
const AXIS_H = 30
const CHAR_W = 6.1      // ước lượng bề rộng một ký tự cỡ 11px, để biết chữ có vừa thanh không

const id = useId()
const clipId = `tl-clip-${id}`
const x = (t: number) => X0 + (t / props.duration) * (X1 - X0)

// Tính vị trí y cho từng lane và tiêu đề group.
const layout = computed(() => {
  let y = TOP
  const groups: { text: string; y: number }[] = []
  const rows = props.lanes.map((lane, i) => {
    if (lane.group && lane.group !== props.lanes[i - 1]?.group) {
      groups.push({ text: lane.group, y: y + 16 })
      y += GROUP_H
    }
    const row = { lane, y }
    y += LANE_H
    return row
  })
  return { rows, groups, axisY: y + 6, height: y + AXIS_H }
})

// Cắt chữ cho vừa thanh; quá ngắn thì không hiện (chữ đầy đủ vẫn có trong tooltip <title>).
function fit(text: string | undefined, from: number, to: number) {
  if (!text) return ''
  const max = Math.floor((x(to) - x(from) - 10) / CHAR_W)
  if (max < 2) return ''
  return text.length <= max ? text : text.slice(0, Math.max(1, max - 1)) + '…'
}

// ---- Hoạt hình ----
// progress: 0 → 1 trong một lượt quét. SSR và chế độ giảm chuyển động: luôn = 1 (hình vẽ đủ, không đầu đọc).
const SWEEP_MS = 7000
const HOLD_MS = 1300    // dừng ở hình đầy đủ một chút trước khi quét lại
const progress = ref(1)
const animated = ref(false)   // false = hình tĩnh, ẩn nút và đầu đọc
const playing = ref(false)
const root = ref<HTMLElement | null>(null)

let raf = 0
let visible = true
let start = 0           // mốc thời gian (ms) ứng với progress = 0
let observer: IntersectionObserver | null = null

function tick(now: number) {
  const elapsed = (now - start) % (SWEEP_MS + HOLD_MS)
  progress.value = Math.min(1, elapsed / SWEEP_MS)
  raf = requestAnimationFrame(tick)
}
function run() {
  if (raf || !playing.value || !visible) return
  start = performance.now() - progress.value * SWEEP_MS   // chạy tiếp từ chỗ đang dừng
  raf = requestAnimationFrame(tick)
}
function halt() { cancelAnimationFrame(raf); raf = 0 }
function toggle() {
  playing.value = !playing.value
  playing.value ? run() : halt()
}

onMounted(() => {
  // Chỉ chạy trên client: window không tồn tại lúc VitePress build SSR.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  animated.value = true
  playing.value = true
  progress.value = 0
  // Chỉ chạy rAF khi hình đang hiện trên màn hình (đỡ tốn CPU khi trang có nhiều hình, hoặc hình trong tab ẩn).
  if ('IntersectionObserver' in window && root.value) {
    observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      visible ? run() : halt()
    })
    observer.observe(root.value)
  }
  run()
})
onBeforeUnmount(() => { halt(); observer?.disconnect() })

const headX = computed(() => x(progress.value * props.duration))
const nowT = computed(() => progress.value * props.duration)
const isOn = (s: Segment) => animated.value && progress.value < 1 && nowT.value >= s.from && nowT.value < s.to
</script>

<template>
  <div ref="root" class="tl" :class="{ fig: !plain }">
    <button v-if="animated" type="button" class="tl-btn" :aria-label="playing ? 'Tạm dừng' : 'Chạy'" @click="toggle">
      {{ playing ? '❚❚' : '▶' }}
    </button>
    <svg :viewBox="`0 0 ${W} ${layout.height}`" role="img" :aria-label="caption || 'Dòng thời gian'">
      <defs>
        <clipPath :id="clipId">
          <rect x="0" y="0" :width="animated ? headX : W" :height="layout.height" />
        </clipPath>
      </defs>

      <!-- Tiêu đề group -->
      <text v-for="g in layout.groups" :key="g.text" class="tl-group" :x="8" :y="g.y">{{ g.text }}</text>

      <!-- Nhãn lane + đường kẻ nền -->
      <g v-for="r in layout.rows" :key="`l-${r.y}`">
        <line class="tl-track" :x1="X0" :x2="X1" :y1="r.y + LANE_H / 2" :y2="r.y + LANE_H / 2" />
        <text class="tl-label" :x="X0 - 10" :y="r.lane.sub ? r.y + LANE_H / 2 - 2 : r.y + LANE_H / 2 + 4">{{ r.lane.label }}</text>
        <text v-if="r.lane.sub" class="tl-sub" :x="X0 - 10" :y="r.y + LANE_H / 2 + 11">{{ r.lane.sub }}</text>
      </g>

      <!-- Lớp mờ: toàn bộ hình, để người xem thấy trước sẽ có gì -->
      <g v-if="animated" class="tl-ghost">
        <template v-for="r in layout.rows" :key="`g-${r.y}`">
          <rect v-for="(s, j) in r.lane.segments" :key="j" :class="['tl-bar', `k-${s.kind}`]"
            :x="x(s.from) + 1" :y="r.y + (LANE_H - BAR_H) / 2" :width="Math.max(2, x(s.to) - x(s.from) - 2)" :height="BAR_H" rx="5" />
        </template>
      </g>

      <!-- Lớp chính: bị cắt tới vị trí đầu đọc nên được "tô dần" -->
      <g :clip-path="`url(#${clipId})`">
        <template v-for="r in layout.rows" :key="`b-${r.y}`">
          <g v-for="(s, j) in r.lane.segments" :key="j" :class="[`k-${s.kind}`, { on: isOn(s) }]">
            <title>{{ r.lane.label }}: {{ s.text || s.kind }}</title>
            <rect class="tl-bar" :x="x(s.from) + 1" :y="r.y + (LANE_H - BAR_H) / 2" :width="Math.max(2, x(s.to) - x(s.from) - 2)" :height="BAR_H" rx="5" />
            <text class="tl-text" :x="(x(s.from) + x(s.to)) / 2" :y="r.y + LANE_H / 2 + 4">{{ fit(s.text, s.from, s.to) }}</text>
          </g>
        </template>
      </g>

      <!-- Marker: đường dọc nét đứt cho một sự kiện -->
      <g v-for="m in markers || []" :key="m.text" class="tl-marker">
        <line :x1="x(m.at)" :x2="x(m.at)" :y1="TOP - 6" :y2="layout.axisY" />
        <text :x="Math.min(Math.max(x(m.at), X0 + 40), X1 - 40)" :y="TOP - 10">{{ m.text }}</text>
      </g>

      <!-- Trục thời gian -->
      <line class="tl-axis" :x1="X0" :x2="X1 - 4" :y1="layout.axisY" :y2="layout.axisY" />
      <path class="tl-arrow" :d="`M${X1} ${layout.axisY} l-8 -4 v8 z`" />
      <text class="tl-axis-text" :x="X1" :y="layout.axisY + 18">thời gian →</text>

      <!-- Đầu đọc -->
      <g v-if="animated && progress < 1" class="tl-head">
        <line :x1="headX" :x2="headX" :y1="TOP - 4" :y2="layout.axisY" />
        <circle :cx="headX" :cy="layout.axisY" r="4" />
      </g>
    </svg>
    <p v-if="caption" class="fig-caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.tl { position: relative; }
.tl:not(.fig) { margin: 4px 0; }

.tl-btn {
  position: absolute; top: 8px; right: 8px; z-index: 1;
  width: 28px; height: 28px; border-radius: 50%;
  font-size: 11px; line-height: 1; cursor: pointer;
  color: var(--vp-c-text-2); background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: color .15s, border-color .15s;
}
.tl-btn:hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
.tl-btn:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }

.tl-group { font-size: 12px; font-weight: 600; fill: var(--vp-c-text-2); }
.tl-label { font-size: 13px; font-weight: 600; text-anchor: end; font-family: var(--vp-font-family-mono); }
.tl-sub { font-size: 10.5px; text-anchor: end; fill: var(--vp-c-text-3); }
.tl-track { stroke: var(--vp-c-divider); stroke-width: 1; stroke-dasharray: 2 4; }

/* Màu theo kind: đặt color rồi dùng currentColor cho viền và ánh sáng */
.k-busy  { color: var(--vp-c-warning-1); --tl-fill: var(--vp-c-warning-soft); }
.k-wait  { color: var(--vp-c-warning-1); --tl-fill: transparent; }
.k-free  { color: var(--vp-c-green-1);   --tl-fill: var(--vp-c-green-soft); }
.k-cpu   { color: var(--vp-c-brand-1);   --tl-fill: var(--vp-c-brand-soft); }
.k-io    { color: var(--vp-c-indigo-1);  --tl-fill: transparent; }
.k-other { color: var(--vp-c-text-2);    --tl-fill: var(--vp-c-default-soft); }

.tl-bar { fill: var(--tl-fill); stroke: currentColor; stroke-width: 1.5; }
.k-wait .tl-bar, .k-wait.tl-bar, .k-io .tl-bar, .k-io.tl-bar { stroke-dasharray: 5 4; }
.k-cpu .tl-bar, .k-busy .tl-bar { stroke-width: 1.8; }
.tl-text { font-size: 11px; text-anchor: middle; fill: var(--vp-c-text-1); pointer-events: none; }
.k-io .tl-text, .k-wait .tl-text { fill: currentColor; font-style: italic; }

.tl-ghost { opacity: .22; }
.tl-ghost .tl-text { display: none; }

/* Thanh đang bị đầu đọc chạm: sáng lên */
.on .tl-bar { stroke-width: 2.4; filter: drop-shadow(0 0 4px currentColor); }
.on { transition: opacity .2s; }

.tl-marker line { stroke: var(--vp-c-red-1); stroke-width: 1.3; stroke-dasharray: 4 3; }
.tl-marker text { font-size: 11px; font-weight: 600; text-anchor: middle; fill: var(--vp-c-red-1); }

.tl-axis { stroke: var(--vp-c-text-3); stroke-width: 1.2; }
.tl-arrow { fill: var(--vp-c-text-3); }
.tl-axis-text { font-size: 11px; text-anchor: end; fill: var(--vp-c-text-2); }

.tl-head line { stroke: var(--vp-c-brand-1); stroke-width: 2; }
.tl-head circle { fill: var(--vp-c-brand-1); }

@media (prefers-reduced-motion: reduce) {
  .tl-btn, .tl-head { display: none; }
}
</style>
