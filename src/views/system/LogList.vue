<template>
  <div class="log-page">
    <PageHeader title="日志管理" description="查看系统操作日志记录">
      <template #extra>
        <el-button @click="handleExport" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <SearchBar v-model="keyword" placeholder="搜索操作内容" @search="handleSearch" />
        </div>
        <div class="toolbar-right">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" @change="handleDateChange" />
        </div>
      </div>

      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="ip" label="IP地址" width="140" />
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无日志记录" />

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getLogs, exportLogs } from '@/api/log'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const keyword = ref('')
const dateRange = ref([])
const exporting = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize, keyword: keyword.value }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const res = await getLogs(params)
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = (val) => {
  keyword.value = val
  page.value = 1
  fetchData()
}

const handleDateChange = () => {
  page.value = 1
  fetchData()
}

const handleExport = async () => {
  exporting.value = true
  try {
    const params = { keyword: keyword.value }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const res = await exportLogs(params)
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '操作日志.xlsx'
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.log-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
