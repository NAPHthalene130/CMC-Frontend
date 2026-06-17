<template>
  <div class="page-header">
    <div class="header-left">
      <h1 class="header-title">{{ title }}</h1>
      <p v-if="description" class="header-desc">{{ description }}</p>
    </div>
    <div v-if="$slots.extra" class="header-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.header-desc {
  font-size: 13px;
  color: var(--c-text2);
  margin: 4px 0 0;
}

.header-extra {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
