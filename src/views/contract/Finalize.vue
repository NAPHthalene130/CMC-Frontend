<template>
  <div class="page">
    <el-card>
      <template #header><span>待定稿合同</span></template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="num" label="合同编号" />
        <el-table-column prop="name" label="合同名称" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="$router.push(`/contract/finalize/${row.id}`)">查看会签意见</el-button>
            <el-button type="success" size="small" @click="handleFinalize(row)">定稿</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="定稿合同" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="合同名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="合同内容"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFinalize">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getContracts, finalizeContract } from '@/api/contract'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = reactive({ name: '', content: '', id: null, customerId: null, beginTime: '', endTime: '' })

onMounted(async () => {
  loading.value = true
  try { const res = await getContracts(); list.value = res.data?.records || [] }
  catch { /* handled */ }
  loading.value = false
})

const handleFinalize = (row) => {
  form.name = row.name
  form.content = row.content
  form.id = row.id
  form.customerId = row.customerId
  form.beginTime = row.beginTime
  form.endTime = row.endTime
  dialogVisible.value = true
}
const submitFinalize = async () => {
  await finalizeContract(form.id, {
    name: form.name,
    content: form.content,
    customerId: form.customerId,
    beginTime: form.beginTime,
    endTime: form.endTime
  })
  ElMessage.success('定稿成功')
  dialogVisible.value = false
}
</script>
