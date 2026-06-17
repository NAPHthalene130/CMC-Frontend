<template>
  <div class="approve-page">
    <PageHeader title="待审批合同" description="审核定稿后的合同并做出审批决定" />

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="contractNum" label="合同编号" min-width="140" />
        <el-table-column prop="contractName" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="起草人" width="120">
          <template #default="{ row }">{{ row.draftUser || row.username || '-' }}</template>
        </el-table-column>
        <el-table-column label="起草时间" width="180">
          <template #default="{ row }">{{ row.createTime || row.draftTime }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default>
            <StatusTag type="approving" text="待审批" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleApprove(row)">审批</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无待审批合同" />

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="审批合同" width="720px" :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">合同名称</span>
            <span class="info-value">{{ currentRow?.contractName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">合同编号</span>
            <span class="info-value">{{ currentRow?.contractNum }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">起草人</span>
            <span class="info-value">{{ currentRow?.draftUser || currentRow?.username || '-' }}</span>
          </div>
        </div>

        <!-- 合同内容预览 -->
        <div class="content-preview">
          <div class="preview-label">
            <el-icon><Reading /></el-icon>
            合同内容
          </div>
          <div class="preview-text">{{ currentRow?.contractContent || '暂无内容' }}</div>
        </div>

        <!-- 合同附件预览 -->
        <AttachmentPreview :contract-id="contractId" />

        <!-- 流程意见（会签意见 + 历史审批） -->
        <ProcessOpinions :contract-id="contractId" title="历史意见" empty-text="暂无历史意见" />

        <el-form :model="approveForm" :rules="approveRules" ref="approveFormRef" label-width="90px">
          <el-form-item label="审批结果" prop="approved">
            <el-radio-group v-model="approveForm.approved">
              <el-radio :value="true" class="approve-radio-pass">通过</el-radio>
              <el-radio :value="false" class="approve-radio-reject">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审批意见" prop="opinion">
            <el-input v-model="approveForm.opinion" type="textarea" :rows="4"
              :placeholder="approveForm.approved ? '请输入审批通过意见' : '请输入拒绝原因'" maxlength="500" show-word-limit />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove" :loading="submitting" :disabled="!approveForm.opinion">
          提交审批
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Reading } from '@element-plus/icons-vue'
import { getPending, approve } from '@/api/process'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AttachmentPreview from '@/components/common/AttachmentPreview.vue'
import ProcessOpinions from '@/components/common/ProcessOpinions.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const dialogVisible = ref(false)
const currentRow = ref(null)
const submitting = ref(false)
const approveFormRef = ref(null)

const contractId = computed(() => currentRow.value?.contractId || currentRow.value?.id)

const approveForm = reactive({
  approved: true,
  opinion: ''
})

const approveRules = {
  opinion: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPending(2)
    list.value = res.data?.records || res.data || []
    total.value = res.data?.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleApprove = (row) => {
  currentRow.value = row
  approveForm.approved = true
  approveForm.opinion = ''
  dialogVisible.value = true
}

const submitApprove = async () => {
  const valid = await approveFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await approve({
      contractId: currentRow.value.contractId || currentRow.value.id,
      content: approveForm.opinion,
      approved: approveForm.approved
    })
    const msg = approveForm.approved ? '审批通过！合同已进入下一阶段' : '合同已拒绝'
    ElMessage.success(msg)
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('审批提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.approve-page {
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

.dialog-content {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.info-section {
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 80px;
  font-size: 13px;
  color: var(--c-text2);
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: var(--c-text);
}

.content-preview {
  margin-bottom: 16px;
}

.preview-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 8px;
}

.preview-text {
  font-size: 13px;
  color: var(--c-text);
  line-height: 1.6;
  padding: 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.approve-radio-pass :deep(.el-radio__label) {
  color: var(--c-success);
  font-weight: 600;
}

.approve-radio-reject :deep(.el-radio__label) {
  color: var(--c-danger);
  font-weight: 600;
}
</style>
