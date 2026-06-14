<template>
  <div class="contract-query-page">
    <PageHeader title="合同信息查询" description="查看和管理系统中的所有合同信息" />

    <div class="content-card">
      <div class="toolbar">
        <SearchBar v-model="keyword" placeholder="搜索合同名称或编号" @search="handleSearch" />
      </div>

      <el-table :data="list" stripe v-loading="loading" @row-click="handleRowClick" empty-text="">
        <el-table-column prop="num" label="合同编号" min-width="140" />
        <el-table-column prop="name" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="客户" min-width="140">
          <template #default="{ row }">{{ row.customerName || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :type="statusType(row.state)" :text="statusText(row.state)" />
          </template>
        </el-table-column>
        <el-table-column prop="beginTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click.stop="handleView(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无合同数据" />

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="合同详情" width="750px">
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

        <!-- 合同附件 -->
        <AttachmentPreview :contract-id="currentRow.id" />

        <!-- 流程意见 -->
        <ProcessOpinions :contract-id="currentRow.id" title="流程记录" empty-text="暂无流程记录" />
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getContracts } from '@/api/contract'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AttachmentPreview from '@/components/common/AttachmentPreview.vue'
import ProcessOpinions from '@/components/common/ProcessOpinions.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const keyword = ref('')
const dialogVisible = ref(false)
const currentRow = ref(null)

const statusMap = { 1: 'draft', 2: 'countresigning', 3: 'approving', 4: 'warning', 5: 'success' }
const statusTextMap = { 1: '起草', 2: '会签中', 3: '审批中', 4: '待签订', 5: '已签订' }

const statusType = (state) => statusMap[state] || 'info'
const statusText = (state) => statusTextMap[state] || '未知'

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getContracts({ page: page.value, pageSize, keyword: keyword.value })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = (val) => {
  keyword.value = val
  page.value = 1
  fetchData()
}

const handleRowClick = (row) => {
  handleView(row)
}

const handleView = (row) => {
  currentRow.value = row
  dialogVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.contract-query-page {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.toolbar {
  margin-bottom: 16px;
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
</style>
