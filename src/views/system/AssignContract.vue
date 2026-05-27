<template>
  <div class="page">
    <section class="page-hero">
      <h1 class="page-title">分配合同</h1>
      <p class="page-desc">管理员为起草完成的合同配置会签、审批、签订人员，推动合同进入正式流程。</p>
    </section>

    <el-card class="page-panel table-card">
      <template #header>
        <div class="panel-header">
          <span class="section-title">待分配合同</span>
          <el-button type="primary" @click="fetchData">刷新</el-button>
        </div>
      </template>
      <div class="page-toolbar">
        <el-form :inline="true" :model="query" class="toolbar-form">
          <el-form-item label="查找合同">
            <el-input v-model="query.keyword" placeholder="输入合同编号或名称" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button></el-form-item>
        </el-form>
      </div>
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无待分配合同">
        <el-table-column prop="num" label="合同编号" />
        <el-table-column prop="name" label="合同名称" />
        <el-table-column prop="beginTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column label="状态" width="120">
          <template #default><span class="status-pill status-draft">起草</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleAssign(row)">分配</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar">
        <el-pagination v-model:current-page="query.page" :total="total" :page-size="query.pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="`流程配置：${currentContract?.name || ''}`" width="680px">
      <el-alert title="会签、审批、签订人员均为必填；同一用户可承担多个流程角色。" type="info" :closable="false" class="dialog-tip" />
      <el-form :model="assignForm" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="分配会签人" prop="countersignUserIds">
          <el-select v-model="assignForm.countersignUserIds" multiple filterable placeholder="选择会签人员">
            <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分配审批人" prop="approveUserIds">
          <el-select v-model="assignForm.approveUserIds" multiple filterable placeholder="选择审批人员">
            <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分配签订人" prop="signUserIds">
          <el-select v-model="assignForm.signUserIds" multiple filterable placeholder="选择签订人员">
            <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitAssign">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getContracts } from '@/api/contract'
import { getUsers } from '@/api/user'
import { assignContract } from '@/api/process'
import { ElMessage } from 'element-plus'

const list = ref([]); const loading = ref(false); const users = ref([]); const total = ref(0)
const dialogVisible = ref(false); const currentContract = ref(null)
const submitting = ref(false); const formRef = ref(null)
const query = reactive({ keyword: '', page: 1, pageSize: 10 })
const assignForm = reactive({ contractId: null, countersignUserIds: [], approveUserIds: [], signUserIds: [] })
const requiredUserList = (message) => ({
  validator: (rule, value, callback) => {
    if (!Array.isArray(value) || value.length === 0) callback(new Error(message))
    else callback()
  },
  trigger: 'change'
})
const rules = {
  countersignUserIds: [requiredUserList('请至少选择一名会签人员')],
  approveUserIds: [requiredUserList('请至少选择一名审批人员')],
  signUserIds: [requiredUserList('请至少选择一名签订人员')]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getContracts({ keyword: query.keyword, page: query.page, pageSize: query.pageSize, stateType: 1 })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  }
  catch { /* handled */ }
  loading.value = false
}
onMounted(async () => {
  fetchData()
  const ur = await getUsers({ pageSize: 100 }); users.value = ur.data?.records || []
})

const handleSearch = () => {
  query.page = 1
  fetchData()
}

const handleAssign = (row) => {
  currentContract.value = row
  Object.assign(assignForm, { contractId: row.id, countersignUserIds: [], approveUserIds: [], signUserIds: [] })
  dialogVisible.value = true
}
const submitAssign = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await assignContract(assignForm)
    ElMessage.success('分配成功')
    dialogVisible.value = false
    await fetchData()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.dialog-tip {
  margin-bottom: var(--sp-lg);
}

:deep(.el-select) {
  width: 100%;
}
</style>
