<script setup lang="ts">
// Một bước trong luồng dọc: bên trái là "đường ray" (số bước, tiêu đề, tầng, thread), bên phải là giải thích.
// Nhiều FlowStep đặt liền nhau sẽ nối thành một đường ray liên tục. Mỗi bước có id="step-<n>" để link tới.
// Markdown trong slot chỉ được render khi có dòng trống giữa thẻ và nội dung:
// <FlowStep :n="7" title="await" layer="Your code" thread="Thread #7" tone="busy">
//
// nội dung markdown
//
// </FlowStep>
// tone: busy (thread đang bị chiếm) | free (không chiếm thread nào). Bỏ trống = màu trung tính.
// icon: tên hình trong StepIcon.vue. Có icon thì hình + nhãn "Bước n" thay cho chấm tròn số.
//
// collapsible: bước thu gọn thành một dòng (số, hình nhỏ, tiêu đề, where, asks); bấm dòng để mở nội dung ngay bên dưới.
// Link tới #step-n (vd từ bản đồ) tự mở bước đó. Nội dung đóng dùng hidden="until-found",
// nên Ctrl+F vẫn tìm thấy chữ bên trong và browser tự mở bước có chữ đó.
// Nút mở/đóng tất cả: <FlowToggleAll /> (phát sự kiện 'flowstep:all' trên window).
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import StepIcon from './StepIcon.vue'

const props = defineProps<{
  n: number
  title: string
  layer: string
  thread?: string
  tone?: 'busy' | 'free'
  icon?: string
  collapsible?: boolean
  where?: string // trạm này nằm ở đâu (chỉ hiện ở dòng thu gọn)
  asks?: string // trạm này hỏi câu gì (chỉ hiện ở dòng thu gọn)
}>()

// Mỗi tầng một màu, chỉ dùng biến màu của theme để tự đổi theo light/dark.
const layerColors: Record<string, string> = {
  Browser: 'indigo',
  Network: 'gray',
  'OS kernel': 'gray',
  Kestrel: 'purple',
  'ASP.NET Core': 'purple',
  '.NET runtime': 'purple',
  'Your code': 'green',
  'EF Core': 'yellow',
  SqlClient: 'yellow',
  'SQL Server': 'red',
  // aspnet-core/api-security
  Edge: 'indigo',
  Gateway: 'purple',
  Monitoring: 'gray',
  // runtime/async
  CPU: 'indigo',
}
const color = computed(() => layerColors[props.layer] ?? 'gray')

// --- Thu gọn / mở ---

const open = ref(!props.collapsible)
const root = ref<HTMLElement>()
const panel = ref<HTMLElement>()

// Trượt mở / đóng bằng cách animate chiều cao từ 0 tới chiều cao thật (và ngược lại).
// Đóng xong mới gắn lại hidden="until-found", để Ctrl+F vẫn tìm được chữ bên trong.
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function slide(from: number, to: number) {
  return panel.value!.animate(
    [
      { height: `${from}px`, opacity: from ? 1 : 0 },
      { height: `${to}px`, opacity: to ? 1 : 0 },
    ],
    { duration: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  ).finished
}

async function expand() {
  if (open.value) return

  open.value = true
  if (reduceMotion()) return

  await nextTick()
  await slide(0, panel.value!.scrollHeight)
}

async function shrink() {
  if (!open.value) return

  if (!reduceMotion()) await slide(panel.value!.scrollHeight, 0)
  open.value = false
}

const toggle = () => (open.value ? shrink() : expand())

function openFromHash() {
  if (!props.collapsible || location.hash !== `#step-${props.n}`) return

  root.value?.scrollIntoView({ block: 'start' })
  expand()
}

function onAll(e: Event) {
  if (props.collapsible) open.value = (e as CustomEvent<boolean>).detail
}

async function collapse() {
  await shrink()
  root.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

onMounted(() => {
  openFromHash()
  window.addEventListener('hashchange', openFromHash)
  window.addEventListener('flowstep:all', onAll)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', openFromHash)
  window.removeEventListener('flowstep:all', onAll)
})
</script>

<template>
  <section :id="`step-${n}`" ref="root" class="flow-step" :class="{ 'has-icon': icon, collapsible, open }">
    <span v-if="!icon && !collapsible" class="flow-node" aria-hidden="true">{{ n }}</span>

    <!-- Dòng thu gọn: bấm để mở / đóng -->
    <button v-if="collapsible" type="button" class="flow-row" :aria-expanded="open" @click="toggle">
      <span class="flow-row-num">{{ n }}</span>
      <StepIcon v-if="icon" class="flow-row-icon" :name="icon" />

      <span class="flow-row-text">
        <span class="flow-row-title">{{ title }}</span>
        <span v-if="where || asks" class="flow-row-meta">
          <span v-if="where" class="flow-row-where">{{ where }}</span>
          <span v-if="asks" class="flow-row-asks">{{ asks }}</span>
        </span>
      </span>

      <span class="flow-row-chev" aria-hidden="true">›</span>
    </button>

    <div
      ref="panel"
      class="flow-grid"
      :hidden="collapsible && !open ? 'until-found' : undefined"
      @beforematch="open = true"
    >
      <div class="flow-rail">
        <div v-if="icon" class="flow-pic">
          <span class="flow-num">Bước {{ n }}</span>
          <StepIcon :name="icon" />
        </div>
        <div v-if="!collapsible" class="flow-title">{{ title }}</div>
        <div class="flow-chips">
          <span
            class="flow-layer"
            :style="{
              color: color === 'gray' ? 'var(--vp-c-text-2)' : `var(--vp-c-${color}-1)`,
              background: `var(--vp-c-${color}-soft)`,
            }"
            >{{
              layer
            }}</span
          >
          <span v-if="thread" class="flow-thread" :class="tone">{{ thread }}</span>
        </div>
      </div>

      <div class="flow-body">
        <slot />

        <div v-if="collapsible" class="flow-foot">
          <a href="#overview">↑ Bản đồ</a>
          <button type="button" @click="collapse">Thu gọn bước {{ n }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.flow-step {
  position: relative;
  padding: 0 0 20px 44px;
  scroll-margin-top: calc(var(--vp-nav-height) + 16px);
}
/* Đường ray: kéo hết chiều cao của bước, nên các bước liền nhau nối thành một đường. */
.flow-step::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--vp-c-divider);
}
.flow-step:not(.flow-step + .flow-step) {
  margin-top: 24px;
}
.flow-step:not(.flow-step + .flow-step)::before {
  top: 16px;
}
.flow-step:not(:has(+ .flow-step)) {
  margin-bottom: 24px;
}
.flow-step:not(:has(+ .flow-step))::before {
  bottom: auto;
  height: 16px;
}

.flow-node {
  position: absolute;
  left: 0;
  top: 2px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-brand-1);
}

.flow-grid {
  display: grid;
  grid-template-columns: 28% 1fr;
  gap: 20px;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 8px;
}
.flow-step:not(.flow-step + .flow-step) .flow-grid {
  border-top: none;
}

.flow-title {
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}
.flow-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.flow-layer,
.flow-thread {
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.flow-thread {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}
.flow-thread.busy {
  color: var(--vp-c-warning-1);
  border-color: var(--vp-c-warning-1);
  background: var(--vp-c-warning-soft);
}
.flow-thread.free {
  color: var(--vp-c-green-1);
  border-color: var(--vp-c-green-1);
  background: var(--vp-c-green-soft);
}

/* Bỏ margin thừa của đoạn đầu/cuối trong nội dung markdown */
.flow-body {
  min-width: 0;
}
.flow-body > :deep(:first-child) {
  margin-top: 0;
}
.flow-body > :deep(:last-child) {
  margin-bottom: 0;
}

/* Có hình: bỏ đường ray + chấm số bên trái, hình nằm đầu cột trái kèm nhãn "Bước n" */
.flow-step.has-icon {
  padding-left: 0;
}
.flow-step.has-icon::before {
  display: none;
}
.flow-pic {
  position: relative;
  width: fit-content;
  padding: 18px 8px 6px;
  margin-bottom: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.flow-num {
  position: absolute;
  top: -1px;
  left: -1px;
  font-size: 12px;
  font-weight: 700;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 10px 0 10px 0;
  color: var(--vp-c-white);
  background: var(--vp-c-brand-1);
}

/* Màn hình ≥1024px: hình to gấp ~1,5 (198×132), cột trái giãn theo cho vừa hình */
@media (min-width: 1024px) {
  .flow-pic {
    --si-w: 198px;
  }
  .flow-grid {
    grid-template-columns: minmax(230px, 28%) 1fr;
  }
}
@media (min-width: 1440px) {
  .flow-grid {
    grid-template-columns: minmax(230px, 24%) 1fr;
  }
}

/* --- Chế độ thu gọn (collapsible) --- */

.flow-step.collapsible {
  padding: 0;
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}

.flow-step.collapsible + .flow-step.collapsible {
  margin-top: 8px;
}

.flow-step.collapsible::before {
  display: none;
}

.flow-step.collapsible.open {
  border-color: var(--vp-c-brand-1);
}

.flow-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border-radius: 10px;
}

.flow-row:hover {
  background: var(--vp-c-default-soft);
}

.flow-row-num {
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 700;
  line-height: 26px;
  text-align: center;
  color: var(--vp-c-white);
  background: var(--vp-c-brand-3);
}

.flow-row-icon {
  flex: none;
  --si-w: 66px;
}

.flow-row-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.flow-row-title {
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.flow-row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
  font-size: 13px;
  line-height: 1.5;
}

.flow-row-where {
  color: var(--vp-c-text-2);
}

.flow-row-where::after {
  content: " ·";
}

.flow-row-asks {
  color: var(--vp-c-brand-1);
}

.flow-row-chev {
  flex: none;
  font-size: 22px;
  color: var(--vp-c-text-3);
  transition: transform 0.15s;
}

.flow-step.open .flow-row-chev {
  transform: rotate(90deg);
}

.flow-step.collapsible .flow-grid {
  overflow: hidden;
  box-sizing: border-box;
  border-top: 1px dashed var(--vp-c-divider);
  padding: 12px 14px 14px;
}

.flow-step.collapsible .flow-grid[hidden] {
  /* hidden="until-found" giữ lại box: bỏ padding và viền để dòng đóng không bị hở */
  padding: 0;
  border: 0;
}

.flow-foot {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  font-size: 13px;
}

.flow-foot a,
.flow-foot button {
  color: var(--vp-c-brand-1);
}

@media (max-width: 639px) {
  .flow-row-icon {
    display: none;
  }

  .flow-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  /* Điện thoại: hình nằm trên nội dung, rộng theo màn hình, căn giữa */
  .flow-pic {
    width: auto;
    --si-w: min(100%, 240px);
  }
  .flow-pic :deep(.si) {
    margin: 0 auto;
  }
}
</style>
