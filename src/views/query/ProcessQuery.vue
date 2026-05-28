<template>
  <div class="process-query-page">
    <PageHeader title="合同流程查询" description="查看合同的流转状态和处理进度" />

    <div class="content-card">
      <div class="toolbar">
        <el-select v-model="filterState" placeholder="选择合同状态" clearable @change="handleFilterChange" class="status-filter">
          <el-option label="全部" :value="null" />
          <el-option label="待会签" :value="1" />
          <el-option label="待定稿" :value="2" />
          <el-option label="待审批" :value="3" />
          <el-option label="待签订" :value="4" />
          <el-option label="已签订" :value="5" />
        </el-select>
      </div>

      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="num" label="合同编号" min-width="140" />
        <el-table-column prop="name" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="当前状态" width="120">
          <template #default="{ row }">
            <StatusTag :type="statusType(row.state || row.stateType)" :text="statusText(row.state || row.stateType)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleViewTimeline(row)">流程追踪</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无流程数据" />

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="流程追踪" width="550px">
      <div v-if="currentTimeline && currentTimeline.length" class="timeline-wrap">
        <el-timeline>
          <el-timeline-item
            v-for="(item, idx) in currentTimeline"
            :key="idx"
            :timestamp="item.time || item.createTime"
            :color="item.done ? '#2d6a4f' : '#dde5db'"
            :type="item.done ? 'primary' : 'info'"
          >
            <div class="timeline-title">{{ item.title || item.stepName }}</div>
            <div class="timeline-user" v-if="item.username || item.operator">{{ item.username || item.operator }}</div>
            <div class="timeline-opinion" v-if="item.content || item.opinion">{{ item.content || item.opinion }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <EmptyState v-else description="暂无流程记录" />
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getContracts } from '@/api/contract'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const filterState = ref(null)
const dialogVisible = ref(false)
const currentTimeline = ref([])

const statusMap = { 1: 'draft', 2: 'countresigning', 3: 'approving', 4: 'warning', 5: 'success' }
const statusTextMap = { 1: '待会签', 2: '待定稿', 3: '待审批', 4: '待签订', 5: '已签订' }

const statusType = (state) => statusMap[state] || 'info'
const statusText = (state) => statusTextMap[state] || '未知'

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    if (filterState.value) {
      params.state = filterState.value
    }
    const res = await getContracts(params)
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  page.value = 1
  fetchData()
}

const buildTimeline = (row) => {
  const steps = []
  const state = row.state || row.stateType || 1

  const allSteps = [
    { key: 1, title: '合同起草', done: state >= 1 },
    { key: 2, title: '会签完成', done: state >= 2 },
    { key: 3, title: '定稿完成', done: state >= 3 },
    { key: 4, title: '审批完成', done: state >= 4 },
    { key: 5, title: '签订完成', done: state >= 5 }
  ]

  allSteps.forEach((s) => {
    const step = { ...s }
    if (row.timeline && row.timeline[s.key]) {
      Object.assign(step, row.timeline[s.key])
    }
    steps.push(step)
  })

  return steps
}

const handleViewTimeline = (row) => {
  currentTimeline.value = row.processTimeline || row.timelineList || buildTimeline(row)
  dialogVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.process-query-page {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.toolbar {
  margin-bottom: 16px;
}

.status-filter {
  width: 180px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.timeline-wrap {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 4px;
}

.timeline-user {
  font-size: 12px;
  color: var(--c-pri);
  margin-bottom: 4px;
}

.timeline-opinion {
  font-size: 12px;
  color: var(--c-text2);
  line-height: 1.5;
  word-break: break-all;
}
</style>
