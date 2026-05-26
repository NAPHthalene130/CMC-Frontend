<template>
  <div class="dashboard">
    <div class="stats-row">
      <StatCard icon="Document" color="#2d6a4f" :value="stats.totalContracts" label="合同总数" />
      <StatCard icon="Clock" color="#d97706" :value="stats.pendingTasks" label="待处理任务" />
      <StatCard icon="Check" color="#16a34a" :value="stats.completedToday" label="今日完成" />
      <StatCard icon="WarningFilled" color="#dc2626" :value="stats.expiringSoon" label="即将到期" />
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-title">合同状态分布</div>
        <div ref="pieChartRef" class="chart-body"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">月度合同趋势</div>
        <div ref="lineChartRef" class="chart-body"></div>
      </div>
    </div>

    <div class="bottom-row">
      <div class="card">
        <div class="card-header">
          <span class="card-title">最近合同</span>
          <el-button text type="primary" size="small" @click="goContractQuery">查看全部</el-button>
        </div>
        <el-table :data="recentContracts" size="small" v-loading="loading">
          <el-table-column prop="num" label="合同编号" width="140" />
          <el-table-column prop="name" label="合同名称" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <StatusTag :type="statusType(row)" :text="statusText(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" />
        </el-table>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">到期预警</span>
        </div>
        <div v-if="expiringContracts.length" class="expire-list">
          <div v-for="item in expiringContracts" :key="item.id" class="expire-item">
            <div class="expire-name">{{ item.name }}</div>
            <StatusTag :type="expireLevel(item.daysLeft)" :text="`${item.endTime} (${item.daysLeft}天后)`" />
          </div>
        </div>
        <EmptyState v-else description="暂无即将到期的合同" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { getContracts } from '@/api/contract'
import { getDashboardStats } from '@/api/statistics'
import StatCard from '@/components/common/StatCard.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import * as echarts from 'echarts'

const router = useRouter()
const tabsStore = useTabsStore()
const loading = ref(false)
const pieChartRef = ref(null)
const lineChartRef = ref(null)
let pieChart = null
let lineChart = null

const stats = ref({
  totalContracts: 0,
  pendingTasks: 0,
  completedToday: 0,
  expiringSoon: 0
})

const recentContracts = ref([])
const expiringContracts = ref([])

const statusType = (row) => {
  const map = { 1: 'draft', 2: 'countersigning', 3: 'success', 4: 'approving', 5: 'success' }
  return map[row.state] || 'info'
}

const statusText = (row) => {
  const map = { 1: '起草中', 2: '会签完成', 3: '定稿完成', 4: '审批完成', 5: '已完成' }
  return map[row.state] || '未知'
}

const expireLevel = (days) => {
  if (days <= 7) return 'danger'
  if (days <= 15) return 'warning'
  return 'info'
}

const goContractQuery = () => {
  tabsStore.openTab({ path: '/query/contract', meta: { title: '合同信息查询' } })
}

const loadData = async () => {
  loading.value = true
  try {
    const [contractRes, statsRes] = await Promise.all([
      getContracts({ page: 1, pageSize: 5 }),
      getDashboardStats()
    ])
    if (contractRes.data?.records) {
      recentContracts.value = contractRes.data.records
    }
    if (statsRes.data) {
      stats.value = {
        totalContracts: statsRes.data.totalContracts || 0,
        pendingTasks: statsRes.data.pendingTasks || 0,
        completedToday: statsRes.data.completedToday || 0,
        expiringSoon: statsRes.data.expiringSoon || 0
      }
    }
  } catch {
    /* handled */
  }
  loading.value = false
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  if (pieChart) pieChart.dispose()
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { fontSize: 11, color: '#6b7c6e' } },
    color: ['#2d6a4f', '#40916c', '#52b788', '#95d5b2', '#e8f5e9'],
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['50%', '45%'],
      label: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: 3, name: '起草中' },
        { value: 2, name: '会签中' },
        { value: 1, name: '待定稿' },
        { value: 2, name: '审批中' },
        { value: 5, name: '已完成' }
      ]
    }]
  })
}

const initLineChart = () => {
  if (!lineChartRef.value) return
  if (lineChart) lineChart.dispose()
  lineChart = echarts.init(lineChartRef.value)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: '#e8ede5' } },
      axisLabel: { color: '#6b7c6e', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f0f5f0' } },
      axisLabel: { color: '#6b7c6e', fontSize: 11 }
    },
    color: ['#2d6a4f'],
    series: [{
      type: 'line',
      smooth: true,
      data: [2, 4, 3, 5, 4, 6],
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: 'rgba(45,106,79,0.15)' }, { offset: 1, color: 'rgba(45,106,79,0)' }] } },
      lineStyle: { width: 2 },
      itemStyle: { color: '#2d6a4f' }
    }]
  })
}

onMounted(async () => {
  await loadData()
  await nextTick()
  initPieChart()
  initLineChart()
})

onBeforeUnmount(() => {
  if (pieChart) { pieChart.dispose(); pieChart = null }
  if (lineChart) { lineChart.dispose(); lineChart = null }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 12px;
}

.chart-body {
  height: 240px;
}

.bottom-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
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

.expire-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expire-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expire-name {
  font-size: 13px;
  color: var(--c-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1000px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .charts-row, .bottom-row { grid-template-columns: 1fr; }
}
</style>
