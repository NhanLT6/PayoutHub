<script setup lang="ts">
// Hai nút mở / đóng mọi FlowStep collapsible trên trang (xem FlowStep.vue).
const toggle = (open: boolean) => window.dispatchEvent(new CustomEvent('flowstep:all', { detail: open }))
</script>

<template>
  <div class="fta">
    <button type="button" @click="toggle(true)">Mở tất cả</button>
    <button type="button" @click="toggle(false)">Thu gọn tất cả</button>
  </div>
</template>

<style scoped>
.fta {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin: 8px 0;
  font-size: 13px;
}

.fta button {
  color: var(--vp-c-brand-1);
}
</style>
