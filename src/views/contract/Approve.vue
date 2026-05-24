<template>
  <div class="page">
    <el-card>
      <template #header><span>待审批合同</span></template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="contractName" label="合同名称" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleApprove(row)">审批</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="审批合同" width="500px">
      <el-form>
        <el-form-item label="合同名称">{{ currentRow?.contractName }}</el-form-item>
        <el-form-item label="审批结果">
          <el-radio-group v-model="approved">
            <el-radio :value="true">通过</el-radio>
            <el-radio :value="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="opinion" type="textarea" :rows="4" placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove" :disabled="!opinion">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPending, approve } from '@/api/process'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref(null)
const opinion = ref('')
const approved = ref(true)

onMounted(async () => {
  loading.value = true
  try { const res = await getPending(2); list.value = res.data || [] }
  catch { /* handled */ }
  loading.value = false
})

const handleApprove = (row) => { currentRow.value = row; dialogVisible.value = true }
const submitApprove = async () => {
  await approve({ contractId: currentRow.value.contractId, content: opinion.value, approved: approved.value })
  ElMessage.success('审批完成')
  dialogVisible.value = false
}
</script>
