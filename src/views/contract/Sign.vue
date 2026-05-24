<template>
  <div class="page">
    <el-card>
      <template #header><span>待签订合同</span></template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="contractName" label="合同名称" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleSign(row)">签订</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="签订合同" width="500px">
      <el-form>
        <el-form-item label="合同名称">{{ currentRow?.contractName }}</el-form-item>
        <el-form-item label="签订信息">
          <el-input v-model="opinion" type="textarea" :rows="4" placeholder="请输入签订信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSign" :disabled="!opinion">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPending, sign } from '@/api/process'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref(null)
const opinion = ref('')

onMounted(async () => {
  loading.value = true
  try { const res = await getPending(3); list.value = res.data || [] }
  catch { /* handled */ }
  loading.value = false
})

const handleSign = (row) => { currentRow.value = row; dialogVisible.value = true }
const submitSign = async () => {
  await sign({ contractId: currentRow.value.contractId, content: opinion.value })
  ElMessage.success('签订成功')
  dialogVisible.value = false
}
</script>
