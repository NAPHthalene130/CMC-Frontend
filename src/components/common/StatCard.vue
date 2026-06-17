<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: iconBg || `${color}20`, color: color }">
      <el-icon :size="20"><component :is="icon" /></el-icon>
    </div>
    <div class="stat-info">
      <span class="stat-value">{{ value }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'

defineProps({
  icon: { type: Object, default: Document },
  color: { type: String, default: 'var(--c-pri)' },
  iconBg: { type: String, default: '' },
  value: { type: [String, Number], default: 0 },
  label: { type: String, default: '' }
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}

.stat-card:hover { box-shadow: var(--shadow-md); }

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--c-text);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--c-text2);
  margin-top: 2px;
}
</style>
