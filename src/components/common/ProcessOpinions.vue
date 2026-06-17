<template>
  <div class="process-opinions">
    <div class="section-label">
      <el-icon><ChatLineSquare /></el-icon>
      {{ title }}
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="opinions.length === 0" class="empty-wrap">
      <span class="empty-text">{{ emptyText }}</span>
    </div>

    <div v-else class="opinions-list">
      <div v-for="(op, idx) in opinions" :key="idx" class="opinion-item">
        <div class="opinion-header">
          <div class="opinion-left">
            <el-tag :type="tagType(op)" size="small">{{ typeLabel(op) }}</el-tag>
            <span class="opinion-user">{{ op.username || op.counterSignUser || op.draftUser || '未知用户' }}</span>
          </div>
          <span class="opinion-time">{{ op.time || op.createTime }}</span>
        </div>
        <div class="opinion-body">{{ op.content || op.opinion || '无内容' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ChatLineSquare, Loading } from '@element-plus/icons-vue'
import { getProcesses } from '@/api/process'

const props = defineProps({
  contractId: { type: [Number, String], default: null },
  /** Filter by process type. null = all, 1 = countersign, 2 = approve, 3 = sign */
  filterType: { type: Number, default: null },
  /** Section title */
  title: { type: String, default: '流程意见' },
  /** Empty state text */
  emptyText: { type: String, default: '暂无意见记录' }
})

const opinions = ref([])
const loading = ref(false)

const typeLabelMap = { 1: '会签', 2: '审批', 3: '签订' }
const tagTypeMap = { 1: 'warning', 2: 'primary', 3: 'success' }

const typeLabel = (op) => typeLabelMap[op.type] || '未知'
const tagType = (op) => tagTypeMap[op.type] || 'info'

const fetchOpinions = async () => {
  if (!props.contractId) {
    opinions.value = []
    return
  }
  loading.value = true
  try {
    const res = await getProcesses(props.contractId)
    let all = res.data || []
    if (props.filterType != null) {
      all = all.filter(p => p.type === props.filterType)
    }
    opinions.value = all
  } catch {
    opinions.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.contractId, () => {
  fetchOpinions()
}, { immediate: true })
</script>

<style scoped>
.process-opinions {
  margin-bottom: 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 10px;
}

.loading-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--c-text2);
  padding: 12px;
}

.empty-wrap {
  padding: 12px;
}

.empty-text {
  font-size: 12px;
  color: var(--c-text2);
}

.opinions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.opinion-item {
  padding: 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
}

.opinion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 4px;
}

.opinion-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.opinion-user {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-pri);
}

.opinion-time {
  font-size: 12px;
  color: var(--c-text2);
}

.opinion-body {
  font-size: 13px;
  color: var(--c-text);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
