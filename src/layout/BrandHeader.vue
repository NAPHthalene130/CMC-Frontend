<template>
  <div class="brand-header">
    <div class="brand-logo">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="4" y="3" width="24" height="26" rx="2" />
        <line x1="10" y1="10" x2="22" y2="10" />
        <line x1="10" y1="15" x2="18" y2="15" />
        <circle cx="22" cy="22" r="4" />
        <path d="M20 22 l1.5 1.5 l2.5 -2.5" />
      </svg>
    </div>
    <span class="brand-title">合同管理系统</span>
  </div>
</template>

<script setup>
</script>

<style scoped>
.brand-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 20px;
  flex-shrink: 0;
  background: transparent;
  border-bottom: 1px solid var(--c-border-light);
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--c-pri);
}

.brand-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  letter-spacing: 1px;
  white-space: nowrap;
}
</style>
