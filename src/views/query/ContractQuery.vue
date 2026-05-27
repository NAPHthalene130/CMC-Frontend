<template>
  <div class="page">
    <section class="page-hero">
      <h1 class="page-title">合同信息查询</h1>
      <p class="page-desc">支持合同名称、编号模糊查询，管理员可快速检索合同基础信息。</p>
    </section>

    <el-card class="page-panel table-card">
      <template #header>
        <el-form :inline="true" :model="query" class="toolbar-form">
          <el-form-item label="合同名称/编号">
            <el-input v-model="query.keyword" placeholder="输入查询条件" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">搜索</el-button>
          </el-form-item>
        </el-form>
      </template>
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无合同数据">
        <el-table-column prop="num" label="合同编号" />
        <el-table-column prop="name" label="合同名称" />
        <el-table-column prop="customerId" label="客户" />
        <el-table-column prop="beginTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
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
const query = reactive({ page: 1, pageSize: 10, keyword: '' })

const fetchData = async () => {
  loading.value = true
  try { const res = await getContracts(query); list.value = res.data?.records || []; total.value = res.data?.total || 0 }
  catch { /* handled */ }
  loading.value = false
}
onMounted(fetchData)
</script>
