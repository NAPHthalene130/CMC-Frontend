<template>
  <div class="page">
    <section class="page-hero">
      <h1 class="page-title">合同流程查询</h1>
      <p class="page-desc">按合同最新流程状态筛选，快速定位起草、会签、定稿、审批、签订各阶段合同。</p>
    </section>

    <el-card class="page-panel table-card">
      <template #header><span class="section-title">流程状态</span></template>
      <el-form :inline="true" :model="query" class="toolbar-form">
        <el-form-item label="合同状态">
          <el-select v-model="query.stateType" placeholder="选择状态" clearable @change="fetchData">
            <el-option label="起草" :value="1" />
            <el-option label="会签完成" :value="2" />
            <el-option label="定稿完成" :value="3" />
            <el-option label="审批完成" :value="4" />
            <el-option label="签订完成" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同名称/编号">
          <el-input v-model="query.keyword" placeholder="输入查询条件" clearable @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="fetchData">搜索</el-button></el-form-item>
      </el-form>
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无合同流程数据">
        <el-table-column prop="num" label="合同编号" />
        <el-table-column prop="name" label="合同名称" />
        <el-table-column prop="beginTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column label="当前状态">
          <template #default="{ row }"><span :class="['status-pill', stateClass(query.stateType)]">{{ stateLabel(query.stateType) }}</span></template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar">
        <el-pagination v-model:current-page="query.page" :total="total" :page-size="query.pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getContracts } from '@/api/contract'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, stateType: null, keyword: '' })

const stateLabel = (type) => ({ 1: '起草', 2: '会签完成', 3: '定稿完成', 4: '审批完成', 5: '签订完成' }[type] || '全部状态')
const stateClass = (type) => ({ 1: 'status-draft', 2: 'status-counter', 3: 'status-final', 4: 'status-approved', 5: 'status-signed' }[type] || 'status-draft')

const fetchData = async () => {
  loading.value = true
  try { const res = await getContracts(query); list.value = res.data?.records || []; total.value = res.data?.total || 0 }
  catch { /* handled */ }
  loading.value = false
}
onMounted(fetchData)
</script>
