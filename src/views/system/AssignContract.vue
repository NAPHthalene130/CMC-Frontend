<template>
  <div class="assign-page">
    <PageHeader title="分配合同" description="将已起草的合同分配给会签、审批、签订人员" />

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="name" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="num" label="合同编号" min-width="140" />
        <el-table-column label="起草人" width="120">
          <template #default="{ row }">{{ row.draftUser || row.username || '-' }}</template>
        </el-table-column>
        <el-table-column label="起草时间" width="180">
          <template #default="{ row }">{{ row.createTime || row.draftTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleAssign(row)">分配</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无待分配合同" />

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="流程配置" width="700px" :close-on-click-modal="false">
      <div class="assign-dialog">
        <div class="contract-info">
          <span class="info-badge">合同：{{ currentContract?.name || currentContract?.contractName }}</span>
          <span class="info-badge">编号：{{ currentContract?.num || currentContract?.contractNum }}</span>
        </div>

        <el-tabs v-model="activeTab" class="assign-tabs">
          <el-tab-pane label="会签人员" name="countersign">
            <el-transfer v-model="assignForm.countersignUserIds" :data="userOptions"
              :titles="['可选人员', '已选会签人员']" filterable
              :props="{ key: 'id', label: 'username' }" class="assign-transfer" />
          </el-tab-pane>
          <el-tab-pane label="审批人员" name="approve">
            <el-transfer v-model="assignForm.approveUserIds" :data="userOptions"
              :titles="['可选人员', '已选审批人员']" filterable
              :props="{ key: 'id', label: 'username' }" class="assign-transfer" />
          </el-tab-pane>
          <el-tab-pane label="签订人员" name="sign">
            <el-transfer v-model="assignForm.signUserIds" :data="userOptions"
              :titles="['可选人员', '已选签订人员']" filterable
              :props="{ key: 'id', label: 'username' }" class="assign-transfer" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign" :loading="submitting">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getContracts } from '@/api/contract'
import { getUsers } from '@/api/user'
import { assignContract } from '@/api/process'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const users = ref([])
const dialogVisible = ref(false)
const currentContract = ref(null)
const submitting = ref(false)
const activeTab = ref('countersign')

const assignForm = reactive({
  contractId: null,
  countersignUserIds: [],
  approveUserIds: [],
  signUserIds: []
})

const userOptions = computed(() => {
  return users.value.map(u => ({
    id: u.id,
    username: u.username,
    key: u.id,
    label: u.username
  }))
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getContracts({ page: page.value, pageSize, state: 1 })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const res = await getUsers({ pageSize: 1000 })
    users.value = res.data?.records || []
  } catch {
    users.value = []
  }
}

const handleAssign = (row) => {
  currentContract.value = row
  Object.assign(assignForm, {
    contractId: row.id,
    countersignUserIds: [],
    approveUserIds: [],
    signUserIds: []
  })
  activeTab.value = 'countersign'
  dialogVisible.value = true
}

const submitAssign = async () => {
  submitting.value = true
  try {
    await assignContract({
      contractId: assignForm.contractId,
      countersignUserIds: assignForm.countersignUserIds,
      approveUserIds: assignForm.approveUserIds,
      signUserIds: assignForm.signUserIds
    })
    ElMessage.success('合同分配成功！')
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('分配失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchUsers()
})
</script>

<style scoped>
.assign-page {
  max-width: 1200px;
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

.assign-dialog {
  min-height: 320px;
}

.contract-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--c-pri-light);
  border-radius: var(--radius-sm);
}

.info-badge {
  font-size: 13px;
  color: var(--c-pri);
  font-weight: 600;
}

.assign-tabs {
  margin-top: 8px;
}

.assign-transfer {
  width: 100%;
}

.assign-transfer :deep(.el-transfer-panel) {
  width: 240px;
}

.assign-transfer :deep(.el-transfer-panel__body) {
  height: 260px;
}
</style>
