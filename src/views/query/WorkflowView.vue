<template>
  <div class="workflow-page">
    <PageHeader title="合同流程可视化" description="查看所有合同的流程进度概览" />

    <div class="stats-bar">
      <div class="stat-item" v-for="s in stageStats" :key="s.name">
        <span class="stat-dot" :style="{ background: s.color }"></span>
        <span class="stat-name">{{ s.name }}</span>
        <span class="stat-count">{{ s.count }}</span>
      </div>
    </div>

    <div class="content-card">
      <div ref="chartRef" class="chart-container"></div>
    </div>

    <div class="content-card pipeline-cards" v-loading="loading">
      <div class="card-header">
        <span class="card-title">合同流程详情</span>
        <el-select v-model="filterState" placeholder="按状态筛选" clearable size="small" @change="loadData" style="width: 160px">
          <el-option label="起草中" :value="1" />
          <el-option label="会签完成" :value="2" />
          <el-option label="定稿完成" :value="3" />
          <el-option label="审批完成" :value="4" />
          <el-option label="签订完成" :value="5" />
        </el-select>
      </div>

      <el-table :data="tableData" size="small">
        <el-table-column prop="num" label="合同编号" width="140" />
        <el-table-column prop="name" label="合同名称" show-overflow-tooltip />
        <el-table-column label="当前状态" width="110">
          <template #default="{ row }">
            <StatusTag :type="getStatusType(row.state)" :text="getStatusText(row.state)" />
          </template>
        </el-table-column>
        <el-table-column label="进度" width="260">
          <template #default="{ row }">
            <div class="progress-bar-wrap">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgress(row.state) + '%' }"></div>
              </div>
              <span class="progress-text">{{ getProgress(row.state) }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
      </el-table>

      <EmptyState v-if="!loading && tableData.length === 0" description="暂无合同数据" />

      <div v-if="total > 0" class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20]"
          layout="total, prev, pager, next"
          small
          @change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { getContracts } from '@/api/contract'
import { getContractStatusDist } from '@/api/statistics'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import * as echarts from 'echarts'

const loading = ref(false)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filterState = ref(null)
const chartRef = ref(null)
let chart = null

const stageStats = ref([
  { name: '起草中', count: 0, color: '#2d6a4f' },
  { name: '会签完成', count: 0, color: '#40916c' },
  { name: '定稿完成', count: 0, color: '#52b788' },
  { name: '审批完成', count: 0, color: '#95d5b2' },
  { name: '签订完成', count: 0, color: '#52b788' }
])

const statusNames = { 1: '起草中', 2: '会签完成', 3: '定稿完成', 4: '审批完成', 5: '签订完成' }

const getStatusType = (state) => {
  const map = { 1: 'draft', 2: 'countersigning', 3: 'success', 4: 'approving', 5: 'success' }
  return map[state] || 'info'
}

const getStatusText = (state) => statusNames[state] || '未知'

const getProgress = (state) => (state || 0) * 20

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: pageNum.value, pageSize: pageSize.value }
    if (filterState.value) params.state = filterState.value
    const res = await getContracts(params)
    if (res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }

    const statusRes = await getContractStatusDist()
    if (statusRes.data) {
      const countMap = {}
      statusRes.data.forEach(item => { countMap[item.type] = item.value || 0 })
      stageStats.value = [
        { name: '起草中', count: countMap[1] || 0, color: '#2d6a4f' },
        { name: '会签完成', count: countMap[2] || 0, color: '#40916c' },
        { name: '定稿完成', count: countMap[3] || 0, color: '#52b788' },
        { name: '审批完成', count: countMap[4] || 0, color: '#95d5b2' },
        { name: '签订完成', count: countMap[5] || 0, color: '#52b788' }
      ]
      nextTick(() => initChart())
    }
  } catch {
    /* handled */
  }
  loading.value = false
}

const initChart = () => {
  if (!chartRef.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const stages = ['起草', '会签', '定稿', '审批', '签订']
  const values = stageStats.value.map(s => s.count)
  const maxVal = Math.max(...values, 1)

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: stages,
      axisLabel: { color: '#6b7c6e', fontSize: 12 },
      axisLine: { lineStyle: { color: '#e8ede5' } }
    },
    yAxis: {
      type: 'value',
      max: maxVal + 2,
      splitLine: { lineStyle: { color: '#f0f5f0' } },
      axisLabel: { color: '#6b7c6e', fontSize: 11 }
    },
    color: ['#2d6a4f', '#40916c', '#52b788', '#95d5b2', '#52b788'],
    series: [{
      type: 'bar',
      barWidth: 40,
      data: values.map((v, i) => ({
        value: v,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: ['#2d6a4f', '#40916c', '#52b788', '#95d5b2', '#52b788'][i]
        }
      })),
      label: { show: true, position: 'top', color: '#6b7c6e', fontSize: 12 }
    }]
  })
}

onMounted(() => {
  loadData().then(() => nextTick(() => initChart()))
})

onBeforeUnmount(() => {
  if (chart) { chart.dispose(); chart = null }
})
</script>

<style scoped>
.workflow-page {
  max-width: 1100px;
  margin: 0 auto;
}

.stats-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--c-surface);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.stat-name {
  font-size: 12px;
  color: var(--c-text2);
}

.stat-count {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
}

.chart-container {
  height: 300px;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 160px;
  height: 6px;
  background: var(--c-border-light);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #40916c, #52b788);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: var(--c-text2);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
