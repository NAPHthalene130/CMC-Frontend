<template>
  <div class="page">
    <section class="page-hero">
      <h1 class="page-title">待会签合同</h1>
      <p class="page-desc">查看分配给当前用户的会签任务，审阅合同摘要后填写会签意见。</p>
    </section>

    <el-card class="page-panel table-card">
      <template #header>
        <div class="panel-header">
          <span class="section-title">会签任务</span>
          <el-button type="primary" @click="fetchData">刷新</el-button>
        </div>
      </template>
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无待会签合同">
        <el-table-column prop="contractNum" label="合同编号" />
        <el-table-column prop="contractName" label="合同名称" />
        <el-table-column label="起草时间" width="180">
          <template #default="{ row }">{{ formatTime(row.time) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleCountersign(row)">会签</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="会签合同" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="88px">
        <el-form-item label="合同名称">{{ currentRow?.contractName }}</el-form-item>
        <el-form-item v-if="contractDetail" label="合同内容">
          <div class="contract-content">{{ contractDetail.content }}</div>
        </el-form-item>
        <el-form-item label="会签意见" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入会签意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCountersign">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPending, countersign } from '@/api/process'
import { getContract } from '@/api/contract'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref(null)
const contractDetail = ref(null)
const formRef = ref(null)
const form = ref({ content: '' })
const rules = { content: [{ required: true, message: '会签意见不能为空', trigger: 'blur' }] }

const fetchData = async () => {
  loading.value = true
  try { const res = await getPending(1); list.value = res.data || [] }
  catch { /* handled */ }
  loading.value = false
}

onMounted(fetchData)

const formatTime = (time) => time ? String(time).replace('T', ' ').slice(0, 16) : '-'
const handleCountersign = async (row) => {
  currentRow.value = row
  form.value.content = ''
  contractDetail.value = null
  dialogVisible.value = true
  const res = await getContract(row.contractId)
  contractDetail.value = res.data
}
const submitCountersign = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  await countersign({ contractId: currentRow.value.contractId, content: form.value.content.trim() })
  ElMessage.success('会签成功')
  dialogVisible.value = false
  await fetchData()
}
</script>

<style scoped>
.contract-content {
  max-height: 160px;
  overflow-y: auto;
  width: 100%;
  padding: var(--sp-md);
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-md);
  background: var(--c-bg);
  color: var(--c-text2);
  line-height: 1.7;
}
</style>
