<template>
  <div class="countersign-page">
    <PageHeader title="待会签合同" description="审阅合同内容并填写会签意见" />

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="contractNum" label="合同编号" min-width="140" />
        <el-table-column prop="contractName" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="起草时间" width="180">
          <template #default="{ row }">{{ row.createTime || row.time }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default>
            <StatusTag type="countresigning" text="待会签" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleCountersign(row)">会签</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无待会签合同" />

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="会签合同" width="720px" :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">合同名称</span>
            <span class="info-value">{{ currentRow?.contractName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">客户</span>
            <span class="info-value">{{ currentRow?.customerName || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">合同编号</span>
            <span class="info-value">{{ currentRow?.contractNum }}</span>
          </div>
        </div>

        <!-- 合同内容预览 -->
        <div class="content-preview">
          <div class="preview-label">
            <el-icon><Reading /></el-icon>
            合同内容预览
          </div>
          <div class="preview-text">{{ currentRow?.content || currentRow?.contractContent || '暂无内容' }}</div>
        </div>

        <!-- 合同附件预览 -->
        <AttachmentPreview :contract-id="contractId" />

        <!-- 流程意见历史 -->
        <ProcessOpinions :contract-id="contractId" title="历史意见" empty-text="暂无历史意见" />

        <el-form :model="countersignForm" :rules="countersignRules" ref="countersignFormRef" label-width="90px" class="opinion-form">
          <el-form-item label="会签意见" prop="opinion">
            <el-input v-model="countersignForm.opinion" type="textarea" :rows="4" placeholder="请输入会签意见" maxlength="500" show-word-limit />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCountersign" :loading="submitting" :disabled="!countersignForm.opinion">
          提交会签
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Reading } from '@element-plus/icons-vue'
import { getPending, countersign } from '@/api/process'
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
const countersignFormRef = ref(null)

const contractId = computed(() => currentRow.value?.contractId || currentRow.value?.id)

const countersignForm = reactive({
  opinion: ''
})

const countersignRules = {
  opinion: [{ required: true, message: '会签意见不能为空', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPending(1)
    list.value = res.data?.records || res.data || []
    total.value = res.data?.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleCountersign = (row) => {
  currentRow.value = row
  countersignForm.opinion = ''
  dialogVisible.value = true
}

const submitCountersign = async () => {
  const valid = await countersignFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await countersign({
      contractId: currentRow.value.contractId || currentRow.value.id,
      content: countersignForm.opinion
    })
    ElMessage.success('会签成功')
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('会签失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.countersign-page {
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
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.opinion-form {
  margin-top: 8px;
}
</style>
