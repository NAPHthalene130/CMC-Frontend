<template>
  <div class="page">
    <el-card>
      <template #header><span>合同流程查询</span></template>
      <el-form :inline="true" :model="query">
        <el-form-item label="合同状态">
          <el-select v-model="query.state" placeholder="选择状态" clearable @change="fetchData">
            <el-option label="起草" :value="1" />
            <el-option label="会签完成" :value="2" />
            <el-option label="定稿完成" :value="3" />
            <el-option label="审批完成" :value="4" />
            <el-option label="签订完成" :value="5" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="num" label="合同编号" />
        <el-table-column prop="name" label="合同名称" />
        <el-table-column label="当前状态">
          <template #default="{ row }">{{ stateLabel(row.stateType) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getContracts } from '@/api/contract'

const list = ref([])
const loading = ref(false)
const query = reactive({ state: null })

const stateLabel = (type) => ({ 1: '起草', 2: '会签完成', 3: '定稿完成', 4: '审批完成', 5: '签订完成' }[type] || '未知')

const fetchData = async () => {
  loading.value = true
  try { const res = await getContracts(query); list.value = res.data?.records || [] }
  catch { /* handled */ }
  loading.value = false
}
onMounted(fetchData)
</script>
