<template>
  <div class="draft-page">
    <PageHeader title="起草合同" description="创建新的合同草稿并提交审批流程" />

    <div class="draft-content">
      <div class="contract-num-preview">
        <span class="num-label">合同编号预览</span>
        <span class="num-value">{{ contractNumPreview }}</span>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="draft-form">
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
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入合同详细内容" maxlength="5000" show-word-limit />
        </el-form-item>

        <el-form-item label="附件">
          <el-upload ref="uploadRef" :auto-upload="false" :limit="1" :on-change="handleFileChange" :on-remove="handleFileRemove"
            accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.bmp,.gif" drag>
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">将文件拖到此处或<em>点击上传</em></div>
            <template #tip>
              <div class="upload-tip">支持 doc、docx、pdf、jpg、png、bmp、gif 格式，单个文件</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交草稿</el-button>
          <el-button @click="handleReset">重置表单</el-button>
        </el-form-item>
      </el-form>

      <el-collapse class="template-section" v-if="templates.length > 0">
        <el-collapse-item title="从模板创建（智能填充）" name="template">
          <div class="template-grid">
            <div
              v-for="tpl in templates"
              :key="tpl.id"
              class="template-card"
              @click="applyTemplate(tpl)"
            >
              <div class="tpl-name">{{ tpl.name }}</div>
              <div class="tpl-category" v-if="tpl.category">
                <StatusTag :text="tpl.category" type="info" />
              </div>
              <div class="tpl-desc" v-if="tpl.description">{{ tpl.description }}</div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { draftContract } from '@/api/contract'
import { getCustomers } from '@/api/customer'
import { getTemplateList } from '@/api/template'
import { uploadFile } from '@/api/file'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const formRef = ref(null)
const uploadRef = ref(null)
const submitting = ref(false)
const customers = ref([])
const templates = ref([])
const uploadedFile = ref(null)

const form = reactive({
  name: '',
  customerId: null,
  beginTime: '',
  endTime: '',
  content: ''
})

const contractNumPreview = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `HT-${y}${m}${d}-XXX`
})

const validateEndTime = (_rule, value, callback) => {
  if (value && form.beginTime && new Date(value) <= new Date(form.beginTime)) {
    callback(new Error('结束时间必须晚于开始时间'))
  } else {
    callback()
  }
}

const rules = {
  name: [{ required: true, message: '合同名称不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  beginTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [
    { required: true, message: '结束时间不能为空', trigger: 'change' },
    { validator: validateEndTime, trigger: 'change' }
  ],
  content: [{ required: true, message: '合同内容不能为空', trigger: 'blur' }]
}

const loadCustomers = async () => {
  try {
    const res = await getCustomers({ pageSize: 1000 })
    customers.value = res.data?.records || []
  } catch { /* handled by interceptor */ }
}

const loadTemplates = async () => {
  try {
    const res = await getTemplateList()
    templates.value = res.data || []
  } catch { /* handled */ }
}

const applyTemplate = (tpl) => {
  form.name = tpl.name
  form.content = tpl.content || ''
  const selectedCustomer = customers.value.find(c => c.id === form.customerId)
  if (selectedCustomer && form.content) {
    form.content = form.content
      .replace(/\{\{客户名称\}\}/g, selectedCustomer.name || '')
      .replace(/\{\{客户地址\}\}/g, selectedCustomer.address || '')
      .replace(/\{\{客户电话\}\}/g, selectedCustomer.tel || '')
      .replace(/\{\{银行名称\}\}/g, selectedCustomer.bank || '')
      .replace(/\{\{银行账号\}\}/g, selectedCustomer.account || '')
      .replace(/\{\{签订日期\}\}/g, new Date().toLocaleDateString('zh-CN'))
  }
  ElMessage.success('模板已应用，请确认并调整内容后提交')
}

const handleFileChange = (file) => {
  uploadedFile.value = file.raw
}

const handleFileRemove = () => {
  uploadedFile.value = null
}

const handleReset = () => {
  formRef.value?.resetFields()
  uploadRef.value?.clearFiles()
  uploadedFile.value = null
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const contractData = {
      name: form.name,
      customerId: form.customerId,
      beginTime: form.beginTime,
      endTime: form.endTime,
      content: form.content
    }
    const res = await draftContract(contractData)
    if (uploadedFile.value && res.data?.id) {
      const fileFormData = new FormData()
      fileFormData.append('file', uploadedFile.value)
      fileFormData.append('contractId', res.data.id)
      await uploadFile(fileFormData)
    }
    ElMessage.success('合同草稿创建成功！')
    handleReset()
  } catch {
    ElMessage.error('创建失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCustomers()
  loadTemplates()
})
</script>

<style scoped>
.draft-page {
  max-width: 900px;
  margin: 0 auto;
}

.draft-content {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.contract-num-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--c-pri-light);
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
}

.num-label {
  font-size: 13px;
  color: var(--c-text2);
}

.num-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-pri);
  letter-spacing: 1px;
}

.draft-form {
  max-width: 640px;
}

.full-width {
  width: 100%;
}

.upload-icon {
  font-size: 36px;
  color: var(--c-border);
}

.upload-text {
  font-size: 13px;
  color: var(--c-text2);
  margin-top: 8px;
}

.upload-text em {
  color: var(--c-pri);
  font-style: normal;
}

.upload-tip {
  font-size: 12px;
  color: var(--c-text2);
  margin-top: 4px;
}

.template-section {
  margin-top: 24px;
  border-top: 1px solid var(--c-border-light);
  padding-top: 8px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.template-card {
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-sm);
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: var(--c-pri2);
  background: var(--c-pri-light);
  box-shadow: var(--shadow-sm);
}

.tpl-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 8px;
}

.tpl-category {
  margin-bottom: 6px;
}

.tpl-desc {
  font-size: 12px;
  color: var(--c-text2);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
