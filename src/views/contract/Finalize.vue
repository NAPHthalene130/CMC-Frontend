<template>
  <div class="finalize-page">
    <PageHeader title="待定稿合同" description="确认会签意见后完成合同定稿" />

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="num" label="合同编号" min-width="140" />
        <el-table-column prop="name" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="会签状态" width="120">
          <template #default="{ row }">
            <StatusTag type="success" text="会签完成" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewOpinions(row)">查看会签意见</el-button>
            <el-button size="small" type="primary" @click="handleFinalize(row)">定稿</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无待定稿合同" />

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="opinionDialogVisible" title="会签意见汇总" width="600px">
      <div v-if="currentOpinions && currentOpinions.length" class="opinions-list">
        <div v-for="(op, idx) in currentOpinions" :key="idx" class="opinion-item">
          <div class="opinion-header">
            <span class="opinion-user">{{ op.username || op.counterSignUser }}</span>
            <span class="opinion-time">{{ op.time || op.createTime }}</span>
          </div>
          <div class="opinion-body">{{ op.content || op.opinion }}</div>
        </div>
      </div>
      <EmptyState v-else description="暂无会签意见" />
      <template #footer>
        <el-button @click="opinionDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="定稿合同" width="650px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="合同名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入合同名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable clearable class="full-width">
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime">
          <el-date-picker v-model="form.beginTime" type="date" placeholder="选择开始时间" class="full-width" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="date" placeholder="选择结束时间" class="full-width" />
        </el-form-item>
        <el-form-item label="合同内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入合同内容" maxlength="5000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFinalize" :loading="submitting">确认定稿</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getContracts, finalizeContract } from '@/api/contract'
import { getProcesses } from '@/api/process'
import { getCustomers } from '@/api/customer'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const dialogVisible = ref(false)
const opinionDialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const customers = ref([])
const currentOpinions = ref([])

const form = reactive({
  id: null,
  name: '',
  customerId: null,
  beginTime: '',
  endTime: '',
  content: ''
})

const rules = {
  name: [{ required: true, message: '合同名称不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  beginTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
  content: [{ required: true, message: '合同内容不能为空', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getContracts({ page: page.value, pageSize, state: 2 })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const loadCustomers = async () => {
  try {
    const res = await getCustomers({ pageSize: 1000 })
    customers.value = res.data?.records || []
  } catch { /* handled */ }
}

const handleViewOpinions = async (row) => {
  try {
    const res = await getProcesses(row.id)
    const processes = res.data || []
    const countersignProcesses = processes.filter(p => p.type === 1)
    currentOpinions.value = countersignProcesses.map(p => ({
      username: p.username || '未知用户',
      time: p.time,
      content: p.content || '无意见'
    }))
  } catch {
    currentOpinions.value = []
  }
  opinionDialogVisible.value = true
}

const handleFinalize = (row) => {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    customerId: row.customerId,
    beginTime: row.beginTime,
    endTime: row.endTime,
    content: row.content
  })
  dialogVisible.value = true
}

const submitFinalize = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    await ElMessageBox.confirm('确认定稿该合同？定稿后将进入审批流程。', '确认定稿', { type: 'warning' })
  } catch {
    return
  }

  submitting.value = true
  try {
    await finalizeContract(form.id, {
      name: form.name,
      content: form.content,
      customerId: form.customerId,
      beginTime: form.beginTime,
      endTime: form.endTime
    })
    ElMessage.success('合同定稿成功！')
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('定稿失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
  loadCustomers()
})
</script>

<style scoped>
.finalize-page {
  max-width: 1100px;
  margin: 0 auto;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.full-width {
  width: 100%;
}

.opinions-list {
  max-height: 350px;
  overflow-y: auto;
}

.opinion-item {
  padding: 14px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}

.opinion-item:last-child {
  margin-bottom: 0;
}

.opinion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.opinion-user {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-pri);
}

.opinion-time {
  font-size: 12px;
  color: var(--c-text2);
}

.opinion-body {
  font-size: 13px;
  color: var(--c-text);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
