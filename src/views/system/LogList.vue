<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>日志管理</span>
        <el-button style="float:right" @click="handleExport">导出Excel</el-button>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="username" label="操作人" />
        <el-table-column prop="content" label="操作内容" />
        <el-table-column prop="time" label="操作时间" />
      </el-table>
      <el-pagination v-model:current-page="page" :total="total" :page-size="10"
        layout="total, prev, pager, next" @current-change="fetchData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLogs, exportLogs } from '@/api/log'
import { ElMessage } from 'element-plus'

const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1)

const fetchData = async () => {
  loading.value = true
  try { const res = await getLogs({ page: page.value, pageSize: 10 }); list.value = res.data?.records || []; total.value = res.data?.total || 0 }
  catch { /* handled */ }
  loading.value = false
}
onMounted(fetchData)

const handleExport = async () => {
  try {
    const res = await exportLogs({})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([res.data]))
    link.download = '操作日志.xlsx'; link.click()
    ElMessage.success('导出成功')
  } catch { ElMessage.error('导出失败') }
}
</script>
