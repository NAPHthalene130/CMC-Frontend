<template>
  <span class="status-tag" :class="`tag-${type}`">
    <span class="tag-dot"></span>
    {{ text }}
  </span>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'info' },
  text: { type: String, required: true }
})
</script>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.tag-draft { background: var(--c-pri-light); color: var(--c-pri); }
.tag-draft .tag-dot { background: var(--c-pri); }

.tag-countresigning { background: #fef3c7; color: #92400e; }
.tag-countresigning .tag-dot { background: #d97706; }

.tag-approving { background: #e0f2fe; color: #0c4a6e; }
.tag-approving .tag-dot { background: #0ea5e9; }

.tag-success { background: var(--c-pri-light); color: var(--c-success); }
.tag-success .tag-dot { background: var(--c-success); }

.tag-danger { background: #fee2e2; color: #991b1b; }
.tag-danger .tag-dot { background: var(--c-danger); }

.tag-warning { background: #fef3c7; color: #92400e; }
.tag-warning .tag-dot { background: var(--c-warn); }

.tag-info { background: #e0f2fe; color: #0c4a6e; }
.tag-info .tag-dot { background: var(--c-info); }
</style>
