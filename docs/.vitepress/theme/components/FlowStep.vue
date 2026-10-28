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
import { computed } from 'vue'

const props = defineProps<{ n: number; title: string; layer: string; thread?: string; tone?: 'busy' | 'free' }>()

// Mỗi tầng một màu, chỉ dùng biến màu của theme để tự đổi theo light/dark.
const layerColors: Record<string, string> = {
  'Browser': 'indigo',
  'Network': 'gray',
  'OS kernel': 'gray',
  'Kestrel': 'purple',
  'ASP.NET Core': 'purple',
  '.NET runtime': 'purple',
  'Your code': 'green',
  'EF Core': 'yellow',
  'SqlClient': 'yellow',
  'SQL Server': 'red',
}
const color = computed(() => layerColors[props.layer] ?? 'gray')
</script>

<template>
  <section :id="`step-${n}`" class="flow-step">
    <span class="flow-node" aria-hidden="true">{{ n }}</span>
    <div class="flow-grid">
      <div class="flow-rail">
        <div class="flow-title">{{ title }}</div>
        <div class="flow-chips">
          <span class="flow-layer" :style="{ color: color === 'gray' ? 'var(--vp-c-text-2)' : `var(--vp-c-${color}-1)`, background: `var(--vp-c-${color}-soft)` }">{{ layer }}</span>
          <span v-if="thread" class="flow-thread" :class="tone">{{ thread }}</span>
        </div>
      </div>
      <div class="flow-body"><slot /></div>
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
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--vp-c-divider);
}
.flow-step:not(.flow-step + .flow-step) { margin-top: 24px; }
.flow-step:not(.flow-step + .flow-step)::before { top: 16px; }
.flow-step:not(:has(+ .flow-step)) { margin-bottom: 24px; }
.flow-step:not(:has(+ .flow-step))::before { bottom: auto; height: 16px; }

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
.flow-step:not(.flow-step + .flow-step) .flow-grid { border-top: none; }

.flow-title { font-weight: 600; line-height: 1.4; color: var(--vp-c-text-1); }
.flow-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.flow-layer, .flow-thread {
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
.flow-thread.busy { color: var(--vp-c-warning-1); border-color: var(--vp-c-warning-1); background: var(--vp-c-warning-soft); }
.flow-thread.free { color: var(--vp-c-green-1); border-color: var(--vp-c-green-1); background: var(--vp-c-green-soft); }

/* Bỏ margin thừa của đoạn đầu/cuối trong nội dung markdown */
.flow-body { min-width: 0; }
.flow-body > :deep(:first-child) { margin-top: 0; }
.flow-body > :deep(:last-child) { margin-bottom: 0; }

@media (max-width: 639px) {
  .flow-grid { grid-template-columns: 1fr; gap: 8px; }
}
</style>
