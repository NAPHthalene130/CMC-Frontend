<template>
  <div class="my-contracts-page">
    <PageHeader title="我的合同" description="跟踪您起草的合同及其当前流转状态" />

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="num" label="合同编号" min-width="140" />
        <el-table-column prop="name" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="客户" min-width="140">
          <template #default="{ row }">{{ row.customerName || '-' }}</template>
        </el-table-column>
        <el-table-column label="当前状态" width="120">
          <template #default="{ row }">
            <StatusTag :type="statusType(row.state)" :text="statusText(row.state)" />
          </template>
        </el-table-column>
        <el-table-column prop="beginTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleView(row)">查看</el-button>
            <el-button v-if="row.rejected" size="small" link type="warning" @click="handleRedraft(row)">
              重新提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无合同，请先起草合同" />

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="合同详情" width="650px">
      <div v-if="currentRow" class="detail-content">
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">合同名称</span>
            <span class="detail-value">{{ currentRow.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">合同编号</span>
            <span class="detail-value">{{ currentRow.num }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">客户</span>
            <span class="detail-value">{{ currentRow.customerName || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">状态</span>
            <span class="detail-value">
              <StatusTag :type="statusType(currentRow.state)" :text="statusText(currentRow.state)" />
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">合同期限</span>
            <span class="detail-value">{{ currentRow.beginTime }} ~ {{ currentRow.endTime }}</span>
          </div>
        </div>
        <div class="detail-section">
          <div class="detail-label-text">合同内容</div>
          <div class="detail-content-text">{{ currentRow.content || '暂无内容' }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button v-if="currentRow && currentRow.rejected" type="warning" @click="handleRedraft(currentRow); dialogVisible = false">
          重新提交
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="processDialogVisible" title="流程记录" width="600px">
      <div v-if="processes.length" class="process-list">
        <div v-for="p in processes" :key="p.id" class="process-item">
          <div class="process-header">
            <span class="process-type" :class="'type-' + p.type">{{ typeName(p.type) }}</span>
            <span class="process-user">{{ p.username || '未知用户' }}</span>
            <span class="process-time">{{ p.time }}</span>
          </div>
          <div class="process-body" v-if="p.content">{{ p.content }}</div>
        </div>
      </div>
      <EmptyState v-else description="暂无流程记录" />
      <template #footer>
        <el-button @click="processDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getContracts, redraftContract } from '@/api/contract'
import { getProcesses } from '@/api/process'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const dialogVisible = ref(false)
const currentRow = ref(null)
const processDialogVisible = ref(false)
const processes = ref([])

const statusMap = { 1: 'draft', 2: 'countresigning', 3: 'approving', 4: 'warning', 5: 'success' }
const statusTextMap = { 1: '起草', 2: '会签中', 3: '审批中', 4: '待签订', 5: '已签订' }

const statusType = (state) => statusMap[state] || 'info'
const statusText = (state) => statusTextMap[state] || '未知'
const typeName = (t) => (t === 1 ? '会签' : t === 2 ? '审批' : '签订')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getContracts({ page: page.value, pageSize })
    const records = res.data?.records || []
    for (const r of records) {
      try {
        const pres = await getProcesses(r.id)
        const procData = pres.data || []
        r.rejected = procData.some(p => p.type === 2 && p.state === 2)
      } catch {
        r.rejected = false
      }
    }
    list.value = records
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleView = async (row) => {
  currentRow.value = row
  dialogVisible.value = true
  try {
    const res = await getProcesses(row.id)
    processes.value = res.data || []
  } catch {
    processes.value = []
  }
}

const handleRedraft = async (row) => {
  try {
    await ElMessageBox.confirm('确认重新提交该合同？审批记录将被清除，需重新分配审批。', '确认操作', { type: 'warning' })
  } catch {
    return
  }
  try {
    await redraftContract(row.id)
    ElMessage.success('合同已重新提交，请等待管理员分配')
    fetchData()
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.my-contracts-page {
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

.detail-content {
  max-height: 450px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--c-border-light);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 90px;
  font-size: 13px;
  color: var(--c-text2);
  flex-shrink: 0;
}

.detail-value {
  font-size: 13px;
  color: var(--c-text);
}

.detail-label-text {
  font-size: 13px;
  color: var(--c-text2);
  margin-bottom: 8px;
}

.detail-content-text {
  font-size: 13px;
  color: var(--c-text);
  line-height: 1.8;
  padding: 16px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
  word-break: break-all;
}

.process-list {
  max-height: 350px;
  overflow-y: auto;
}

.process-item {
  padding: 12px 14px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}

.process-item:last-child {
  margin-bottom: 0;
}

.process-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.process-type {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 4px;
  color: #fff;
}

.type-1 { background: #0c4a6e; }
.type-2 { background: #7c3aed; }
.type-3 { background: #059669; }

.process-user {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-pri);
}

.process-time {
  font-size: 12px;
  color: var(--c-text2);
  margin-left: auto;
}

.process-body {
  font-size: 13px;
  color: var(--c-text);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
