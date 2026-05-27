<template>
  <div class="page">
    <section class="page-hero">
      <h1 class="page-title">待定稿合同</h1>
      <p class="page-desc">仅展示会签完成的合同，起草人可结合会签意见修订内容并提交审批。</p>
    </section>

    <el-card class="page-panel table-card">
      <template #header>
        <div class="panel-header">
          <span class="section-title">定稿任务</span>
          <el-button type="primary" @click="fetchData">刷新</el-button>
        </div>
      </template>
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无待定稿合同">
        <el-table-column prop="num" label="合同编号" />
        <el-table-column prop="name" label="合同名称" />
        <el-table-column prop="beginTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleShowOpinions(row)">会签意见</el-button>
            <el-button type="success" size="small" @click="handleFinalize(row)">定稿</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="opinionVisible" title="会签意见" width="640px">
      <el-table :data="opinions" stripe empty-text="暂无会签意见">
        <el-table-column label="会签时间" width="180">
          <template #default="{ row }">{{ formatTime(row.time) }}</template>
        </el-table-column>
        <el-table-column prop="content" label="意见内容" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="定稿合同" width="680px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="合同名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="开始时间" prop="beginTime">
          <el-date-picker v-model="form.beginTime" type="date" value-format="YYYY-MM-DD" placeholder="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="date" value-format="YYYY-MM-DD" placeholder="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="合同内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
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
import { getContractProcesses } from '@/api/process'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const opinionVisible = ref(false)
const opinions = ref([])
const formRef = ref(null)
const form = reactive({ name: '', content: '', id: null, customerId: null, beginTime: '', endTime: '' })
const rules = {
  name: [{ required: true, message: '合同名称不能为空', trigger: 'blur' }],
  beginTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [
    { required: true, message: '结束时间不能为空', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (form.beginTime && value && value < form.beginTime) callback(new Error('结束时间不能早于开始时间'))
        else callback()
      },
      trigger: 'change'
    }
  ],
  content: [{ required: true, message: '合同内容不能为空', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try { const res = await getContracts({ stateType: 2, pageSize: 100 }); list.value = res.data?.records || [] }
  catch { /* handled */ }
  loading.value = false
}

onMounted(fetchData)

const formatTime = (time) => time ? String(time).replace('T', ' ').slice(0, 16) : '-'

const handleShowOpinions = async (row) => {
  const res = await getContractProcesses(row.id, 1)
  opinions.value = (res.data || []).filter((item) => item.content)
  opinionVisible.value = true
}

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
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  await finalizeContract(form.id, {
    name: form.name,
    content: form.content,
    customerId: form.customerId,
    beginTime: form.beginTime,
    endTime: form.endTime
  })
  ElMessage.success('定稿成功')
  dialogVisible.value = false
  await fetchData()
}
</script>
