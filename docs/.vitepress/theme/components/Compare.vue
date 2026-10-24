<script setup lang="ts">
// Hai (hoặc nhiều) hình cùng chỗ, bấm nút để đổi. Dùng cho so sánh trước/sau.
// <Compare :labels="['Trước', 'Sau']"><template #a>...</template><template #b>...</template></Compare>
import { ref } from 'vue'

const props = defineProps<{ labels: string[]; caption?: string }>()
const slots = ['a', 'b', 'c', 'd']
const active = ref(0)
</script>

<template>
  <div class="compare">
    <div class="compare-tabs" role="group">
      <button
        v-for="(label, i) in props.labels"
        :key="label"
        type="button"
        :aria-pressed="active === i"
        @click="active = i"
      >{{ label }}</button>
    </div>
    <div class="fig">
      <div v-for="(label, i) in props.labels" v-show="active === i" :key="label">
        <slot :name="slots[i]" />
      </div>
      <p v-if="caption" class="fig-caption">{{ caption }}</p>
    </div>
  </div>
</template>

<style scoped>
.compare-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin: 16px 0 0; }
.compare-tabs button {
  font-size: 14px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  color: var(--vp-c-text-1); border-radius: 999px; padding: 3px 14px; cursor: pointer;
  transition: background .15s, border-color .15s;
}
.compare-tabs button[aria-pressed="true"] {
  background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: var(--vp-c-white);
}
.compare-tabs button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.compare .fig { margin-top: 8px; }
</style>
