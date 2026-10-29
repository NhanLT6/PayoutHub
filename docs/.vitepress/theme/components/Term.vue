<script setup lang="ts">
// Từ có gạch chấm; hover (chuột) hoặc bấm để mở card định nghĩa lấy từ docs/.vitepress/terms/.
// Hover mở tạm, rời chuột thì đóng. Bấm thì ghim: chỉ đóng bằng Esc, nút ✕ hoặc bấm ra ngoài.
// Trong card, [[key]] là link sang thuật ngữ khác, mở ngay trong card (có nút ← quay lại).
// Định vị, Esc, bấm ra ngoài do Reka UI Popover lo.
import { computed, ref, useSlots } from 'vue'
import { withBase } from 'vitepress'
import { PopoverAnchor, PopoverArrow, PopoverClose, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'
import { findTerm } from '../../terms'
import { formatTerm as format } from '../../terms/format'

const props = defineProps<{ k?: string }>()
const slots = useSlots()
const key = computed(() => props.k ?? String(slots.default?.()[0]?.children ?? ''))

const open = ref(false)
const pinned = ref(false)
const trail = ref<string[]>([]) // các thuật ngữ đã nhảy sang trong card
const current = computed(() => findTerm(trail.value.at(-1) ?? key.value))
const anchor = ref<HTMLElement>()

let timer: ReturnType<typeof setTimeout> | undefined

const later = (fn: () => void, ms: number) => {
  clearTimeout(timer)
  timer = setTimeout(fn, ms)
}

function show() {
  trail.value = []
  open.value = true
}

function close() {
  clearTimeout(timer)
  open.value = false
  pinned.value = false
}

// --- Chuột và bàn phím ---

function onEnter(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return

  if (open.value) clearTimeout(timer)
  else later(show, 180)
}

function onLeave(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || pinned.value) return

  later(close, 250)
}

function onClick() {
  clearTimeout(timer)

  if (open.value && pinned.value) return close()

  if (!open.value) show()
  pinned.value = true
}

function onOutside(e: Event) {
  // Bấm vào chính chữ thì để onClick xử lý, không đóng rồi mở lại.
  if (anchor.value?.contains(e.target as Node)) e.preventDefault()
}

function onCardClick(e: MouseEvent) {
  const link = (e.target as HTMLElement).closest<HTMLElement>('[data-term]')
  if (!link) return

  pinned.value = true
  trail.value.push(link.dataset.term!)
}
</script>

<template>
  <PopoverRoot :open="open" @update:open="(v) => !v && close()">
    <!--
      Neo là <span> inline chứ không phải <button>: <button> cao bằng cả dòng (line-height),
      nên đáy của nó cách gạch chân một khoảng tuỳ font. Span inline thì đáy sát chân chữ.
    -->
    <PopoverAnchor as-child>
      <span
        ref="anchor"
        role="button"
        tabindex="0"
        class="term"
        :class="{ missing: !findTerm(key), active: open }"
        :aria-expanded="open"
        @pointerenter="onEnter"
        @pointerleave="onLeave"
        @click="onClick"
        @keydown.enter.space.prevent="onClick"
      >
        <slot />
      </span>
    </PopoverAnchor>

    <PopoverPortal>
      <PopoverContent
        v-if="current"
        class="term-card"
        side="bottom"
        align="center"
        :side-offset="2"
        :collision-padding="12"
        @open-auto-focus.prevent
        @close-auto-focus.prevent
        @pointer-down-outside="onOutside"
        @pointerenter="onEnter"
        @pointerleave="onLeave"
        @click="onCardClick"
      >
        <div class="term-card-head">
          <button
            v-if="trail.length"
            type="button"
            class="term-card-btn"
            aria-label="Quay lại"
            @click.stop="trail.pop()"
          >
            ←
          </button>

          <div class="term-card-title">
            <strong>{{ current.title }}</strong>
            <span v-if="current.full" class="term-card-full">{{ current.full }}</span>
          </div>

          <PopoverClose class="term-card-btn" aria-label="Đóng">✕</PopoverClose>
        </div>

        <p class="term-card-def" v-html="format(current.def)" />

        <p v-if="current.blocks" class="term-card-blocks">
          <span>chặn</span>
          <span v-html="format(current.blocks)" />
        </p>

        <a v-if="current.link" class="term-card-link" :href="withBase(current.link)">Đọc kỹ →</a>

        <PopoverArrow as-child>
          <span class="term-card-pin" />
        </PopoverArrow>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
