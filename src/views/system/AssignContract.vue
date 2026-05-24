<template>
  <div class="page">
    <el-card>
      <template #header>
        <el-form :inline="true" :model="query">
          <el-form-item label="查找合同">
            <el-input v-model="query.keyword" placeholder="输入查找条件" clearable />
          </el-form-item>
          <el-form-item><el-button type="primary" @click="fetchData">搜索</el-button></el-form-item>
        </el-form>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="num" label="合同编号" />
        <el-table-column prop="name" label="合同名称" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleAssign(row)">分配</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="流程配置" width="600px">
      <el-form label-width="100px">
        <el-form-item label="分配会签人">
          <el-select v-model="assignForm.countersignUserIds" multiple placeholder="选择会签人员">
            <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分配审批人">
          <el-select v-model="assignForm.approveUserIds" multiple placeholder="选择审批人员">
            <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分配签订人">
          <el-select v-model="assignForm.signUserIds" multiple placeholder="选择签订人员">
            <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">提交</el-button>
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

const list = ref([]); const loading = ref(false); const users = ref([])
const dialogVisible = ref(false); const currentContract = ref(null)
const query = reactive({ keyword: '' })
const assignForm = reactive({ contractId: null, countersignUserIds: [], approveUserIds: [], signUserIds: [] })

const fetchData = async () => {
  loading.value = true
  try { const res = await getContracts({ keyword: query.keyword, pageSize: 100 }); list.value = res.data?.records || [] }
  catch { /* handled */ }
  loading.value = false
}
onMounted(async () => {
  fetchData()
  const ur = await getUsers({ pageSize: 100 }); users.value = ur.data?.records || []
})

const handleAssign = (row) => {
  currentContract.value = row
  Object.assign(assignForm, { contractId: row.id, countersignUserIds: [], approveUserIds: [], signUserIds: [] })
  dialogVisible.value = true
}
const submitAssign = async () => {
  await assignContract(assignForm); ElMessage.success('分配成功'); dialogVisible.value = false
}
</script>
