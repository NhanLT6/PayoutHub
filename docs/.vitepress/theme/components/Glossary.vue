<script setup lang="ts">
// Trang Glossary: liệt kê mọi thuật ngữ trong docs/.vitepress/terms/, theo nhóm, xếp ABC.
// Mỗi dòng có id="term-<key>" để link tới, vd /reference/glossary#term-tls.
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { terms, type TermGroup } from '../../terms'
import { formatTerm, termId } from '../../terms/format'

const groups: TermGroup[] = [
  'Runtime & build',
  'Thiết kế & nguyên tắc',
  'Web & API',
  'Bảo mật',
  'Dữ liệu',
  'Quy trình & khác',
]

const query = ref('')

const matches = (text: string | undefined) => text?.toLowerCase().includes(query.value.trim().toLowerCase())

const sections = computed(() =>
  groups
    .map((group) => ({
      group,
      items: Object.entries(terms)
        .filter(([, t]) => t.group === group)
        .filter(([, t]) => !query.value || matches(t.title) || matches(t.full) || matches(t.def))
        .sort(([, a], [, b]) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })),
    }))
    .filter((s) => s.items.length),
)
</script>

<template>
  <input v-model="query" class="glossary-search" type="search" placeholder="Lọc: TLS, DI, closure...">

  <section v-for="s in sections" :key="s.group" class="glossary-group">
    <h2 :id="termId(s.group)">{{ s.group }}</h2>

    <dl>
      <template v-for="[ key, t ] in s.items" :key="key">
        <dt :id="termId(key)">
          <strong>{{ t.title }}</strong>
          <span v-if="t.full" class="glossary-full">{{ t.full }}</span>
        </dt>

        <dd>
          <span v-html="formatTerm(t.def, 'anchor')" />
          <span v-if="t.blocks" class="glossary-blocks"> chặn: <span v-html="formatTerm(t.blocks, 'anchor')" /> </span>
          <a v-if="t.link" class="glossary-link" :href="withBase(t.link)">Đọc kỹ →</a>
        </dd>
      </template>
    </dl>
  </section>
</template>
