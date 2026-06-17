<template>
  <div class="sign-page">
    <PageHeader title="待签订合同" description="对审批通过的合同进行最终签订确认" />

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="contractNum" label="合同编号" min-width="140" />
        <el-table-column prop="contractName" label="合同名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="客户" min-width="140">
          <template #default="{ row }">{{ row.customerName || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default>
            <StatusTag type="warning" text="待签订" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleSign(row)">签订</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无待签订合同" />

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="签订合同" width="720px" :close-on-click-modal="false">
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
            <span class="info-label">客户</span>
            <span class="info-value">{{ currentRow?.customerName || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">合同期限</span>
            <span class="info-value">{{ currentRow?.beginTime }} ~ {{ currentRow?.endTime }}</span>
          </div>
        </div>

        <!-- 合同定稿内容 -->
        <div class="content-preview">
          <div class="preview-label">
            <el-icon><Reading /></el-icon>
            合同定稿内容
          </div>
          <div class="preview-text">{{ currentRow?.content || '暂无内容' }}</div>
        </div>

        <!-- 合同附件预览 -->
        <AttachmentPreview :contract-id="contractId" />

        <!-- 流程意见（会签 + 审批意见） -->
        <ProcessOpinions :contract-id="contractId" title="历史意见" empty-text="暂无历史意见" />

        <el-form :model="signForm" :rules="signRules" ref="signFormRef" label-width="90px">
          <el-form-item label="签订信息" prop="opinion">
            <el-input v-model="signForm.opinion" type="textarea" :rows="4" placeholder="请输入签订信息（签订地点、签订人等）" maxlength="500" show-word-limit />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSign" :loading="submitting" :disabled="!signForm.opinion">
          确认签订
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Reading } from '@element-plus/icons-vue'
import { getPending, sign } from '@/api/process'
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
const signFormRef = ref(null)

const contractId = computed(() => currentRow.value?.contractId || currentRow.value?.id)

const signForm = reactive({
  opinion: ''
})

const signRules = {
  opinion: [{ required: true, message: '签订信息不能为空', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPending(3)
    list.value = res.data?.records || res.data || []
    total.value = res.data?.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleSign = (row) => {
  currentRow.value = row
  signForm.opinion = ''
  dialogVisible.value = true
}

const submitSign = async () => {
  const valid = await signFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await sign({
      contractId: currentRow.value.contractId || currentRow.value.id,
      content: signForm.opinion
    })
    ElMessage.success('合同签订成功！')
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('签订失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.sign-page {
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
</style>
