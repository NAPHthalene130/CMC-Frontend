<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="8" y="12" width="48" height="40" rx="3" stroke-dasharray="4 3" />
        <line x1="20" y1="28" x2="44" y2="28" />
        <line x1="20" y1="36" x2="36" y2="36" />
      </svg>
    </div>
    <p class="empty-text">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-icon {
  color: var(--c-border);
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 13px;
  color: var(--c-text2);
  margin: 0 0 16px;
}
</style>
