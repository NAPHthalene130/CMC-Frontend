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

        <div class="user-search-bar">
          <el-input v-model="searchKeyword" placeholder="搜索用户名..." clearable size="small" class="user-search-input">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-tabs v-model="activeTab" class="assign-tabs">
          <el-tab-pane label="会签人员" name="countersign">
            <div class="transfer-layout">
              <div class="transfer-panel-wrap">
                <div class="panel-header panel-header-left">
                  <el-icon><User /></el-icon>
                  <span>未选人员</span>
                </div>
                <div class="panel-body">
                  <el-checkbox-group v-model="assignForm.countersignUserIds">
                    <el-checkbox v-for="u in availableUsers('countersignUserIds')" :key="u.id" :value="u.id" class="user-checkbox">
                      {{ u.username }}
                    </el-checkbox>
                  </el-checkbox-group>
                  <div v-if="availableUsers('countersignUserIds').length === 0" class="panel-empty">暂无可选人员</div>
                </div>
              </div>
              <div class="transfer-arrows">
                <el-icon :size="20"><DArrowRight /></el-icon>
                <el-icon :size="20"><DArrowLeft /></el-icon>
              </div>
              <div class="transfer-panel-wrap">
                <div class="panel-header panel-header-right">
                  <span>已选会签人员</span>
                  <el-icon><Select /></el-icon>
                  <span class="panel-count">{{ assignForm.countersignUserIds.length }}</span>
                </div>
                <div class="panel-body">
                  <el-tag v-for="uid in assignForm.countersignUserIds" :key="uid" closable class="user-tag"
                    @close="removeUser('countersignUserIds', uid)">
                    {{ getUserName(uid) }}
                  </el-tag>
                  <div v-if="assignForm.countersignUserIds.length === 0" class="panel-empty">暂未选择人员</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="审批人员" name="approve">
            <div class="transfer-layout">
              <div class="transfer-panel-wrap">
                <div class="panel-header panel-header-left">
                  <el-icon><User /></el-icon>
                  <span>未选人员</span>
                </div>
                <div class="panel-body">
                  <el-checkbox-group v-model="assignForm.approveUserIds">
                    <el-checkbox v-for="u in availableUsers('approveUserIds')" :key="u.id" :value="u.id" class="user-checkbox">
                      {{ u.username }}
                    </el-checkbox>
                  </el-checkbox-group>
                  <div v-if="availableUsers('approveUserIds').length === 0" class="panel-empty">暂无可选人员</div>
                </div>
              </div>
              <div class="transfer-arrows">
                <el-icon :size="20"><DArrowRight /></el-icon>
                <el-icon :size="20"><DArrowLeft /></el-icon>
              </div>
              <div class="transfer-panel-wrap">
                <div class="panel-header panel-header-right">
                  <span>已选审批人员</span>
                  <el-icon><Select /></el-icon>
                  <span class="panel-count">{{ assignForm.approveUserIds.length }}</span>
                </div>
                <div class="panel-body">
                  <el-tag v-for="uid in assignForm.approveUserIds" :key="uid" closable class="user-tag"
                    @close="removeUser('approveUserIds', uid)">
                    {{ getUserName(uid) }}
                  </el-tag>
                  <div v-if="assignForm.approveUserIds.length === 0" class="panel-empty">暂未选择人员</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="签订人员" name="sign">
            <div class="transfer-layout">
              <div class="transfer-panel-wrap">
                <div class="panel-header panel-header-left">
                  <el-icon><User /></el-icon>
                  <span>未选人员</span>
                </div>
                <div class="panel-body">
                  <el-checkbox-group v-model="assignForm.signUserIds">
                    <el-checkbox v-for="u in availableUsers('signUserIds')" :key="u.id" :value="u.id" class="user-checkbox">
                      {{ u.username }}
                    </el-checkbox>
                  </el-checkbox-group>
                  <div v-if="availableUsers('signUserIds').length === 0" class="panel-empty">暂无可选人员</div>
                </div>
              </div>
              <div class="transfer-arrows">
                <el-icon :size="20"><DArrowRight /></el-icon>
                <el-icon :size="20"><DArrowLeft /></el-icon>
              </div>
              <div class="transfer-panel-wrap">
                <div class="panel-header panel-header-right">
                  <span>已选签订人员</span>
                  <el-icon><Select /></el-icon>
                  <span class="panel-count">{{ assignForm.signUserIds.length }}</span>
                </div>
                <div class="panel-body">
                  <el-tag v-for="uid in assignForm.signUserIds" :key="uid" closable class="user-tag"
                    @close="removeUser('signUserIds', uid)">
                    {{ getUserName(uid) }}
                  </el-tag>
                  <div v-if="assignForm.signUserIds.length === 0" class="panel-empty">暂未选择人员</div>
                </div>
              </div>
            </div>
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
import { User, Select, DArrowRight, DArrowLeft, Search } from '@element-plus/icons-vue'
import { getContracts } from '@/api/contract'
import { getUsers } from '@/api/user'
import { assignContract, getProcesses } from '@/api/process'
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
const searchKeyword = ref('')

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

const availableUsers = (field) => {
  const selected = assignForm[field] || []
  const kw = searchKeyword.value.trim().toLowerCase()
  return users.value.filter(u => {
    if (selected.includes(u.id)) return false
    if (kw && !(u.username || '').toLowerCase().includes(kw)) return false
    return true
  })
}

const getUserName = (uid) => {
  const u = users.value.find(x => x.id === uid)
  return u ? u.username : '未知'
}

const removeUser = (field, uid) => {
  const arr = assignForm[field]
  if (arr) {
    const idx = arr.indexOf(uid)
    if (idx >= 0) arr.splice(idx, 1)
  }
}

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

const handleAssign = async (row) => {
  currentContract.value = row
  // 先重置
  Object.assign(assignForm, {
    contractId: row.id,
    countersignUserIds: [],
    approveUserIds: [],
    signUserIds: []
  })
  activeTab.value = 'countersign'
  searchKeyword.value = ''
  dialogVisible.value = true

  // 加载已有分配，预填到右侧
  try {
    const res = await getProcesses(row.id)
    const processes = res.data || []
    // 只取待处理（state=0）的记录
    const pending = processes.filter(p => p.state === 0)
    assignForm.countersignUserIds = pending.filter(p => p.type === 1).map(p => p.userId).filter(Boolean)
    assignForm.approveUserIds = pending.filter(p => p.type === 2).map(p => p.userId).filter(Boolean)
    assignForm.signUserIds = pending.filter(p => p.type === 3).map(p => p.userId).filter(Boolean)
  } catch {
    // 加载失败则保持空
  }
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

.user-search-bar {
  margin-bottom: 12px;
}

.user-search-input {
  max-width: 300px;
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

/* 自定义左右选择面板 */
.transfer-layout {
  display: flex;
  align-items: stretch;
  gap: 16px;
  min-height: 300px;
}

.transfer-arrows {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  color: var(--c-text2);
}

.transfer-panel-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--c-surface);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--c-border);
}

.panel-header-left {
  color: var(--c-text2);
  background: var(--c-bg);
}

.panel-header-right {
  color: var(--c-pri);
  background: var(--c-pri-light, #eef2ff);
}

.panel-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--c-text2);
  background: var(--c-bg);
  padding: 1px 8px;
  border-radius: 10px;
}

.panel-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  max-height: 280px;
}

.panel-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 80px;
  font-size: 12px;
  color: var(--c-text2);
}

.user-checkbox {
  display: flex;
  margin-bottom: 4px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  width: 100%;
}

.user-checkbox:hover {
  background: var(--c-bg);
}

.user-tag {
  margin: 3px 4px;
  cursor: pointer;
}
</style>
