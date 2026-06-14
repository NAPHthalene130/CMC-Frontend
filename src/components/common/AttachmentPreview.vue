<template>
  <div class="attachment-preview">
    <div class="section-label">
      <el-icon><Paperclip /></el-icon>
      合同附件 ({{ attachments.length }})
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="attachments.length === 0" class="empty-wrap">
      <span class="empty-text">暂无附件</span>
    </div>

    <div v-else class="attachments-list">
      <div v-for="file in attachments" :key="file.id" class="attachment-item">
        <div class="file-info">
          <el-icon :size="18" class="file-icon">
            <PictureFilled v-if="isImage(file)" />
            <Document v-else />
          </el-icon>
          <span class="file-name" :title="file.fileName">{{ file.fileName }}</span>
          <span class="file-size">{{ formatSize(file.fileSize) }}</span>
        </div>
        <div class="file-actions">
          <el-button size="small" link type="primary" @click="handlePreview(file)" :loading="previewingFileId === file.id">
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-button size="small" link type="primary" @click="handleDownload(file)">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="80%" :close-on-click-modal="true" center>
      <div class="image-preview-body">
        <img :src="currentPreviewUrl" :alt="currentPreviewName" class="preview-image" />
      </div>
    </el-dialog>

    <!-- PDF预览弹窗 -->
    <el-dialog v-model="pdfPreviewVisible" title="PDF预览" width="85%" :close-on-click-modal="true" top="3vh">
      <div class="pdf-preview-body">
        <iframe :src="currentPreviewUrl" class="pdf-iframe" frameborder="0" />
      </div>
    </el-dialog>

    <!-- Word文档预览弹窗 -->
    <el-dialog v-model="wordPreviewVisible" :title="'文档预览 - ' + currentPreviewName" width="80%" :close-on-click-modal="true" top="3vh">
      <div v-if="wordLoading" class="word-loading">
        <el-icon class="is-loading" :size="28"><Loading /></el-icon>
        <span>正在解析文档...</span>
      </div>
      <div v-else class="word-preview-body">
        <div class="word-content" v-html="wordHtml"></div>
      </div>
    </el-dialog>

    <!-- 文本预览弹窗 -->
    <el-dialog v-model="textPreviewVisible" title="文本预览" width="70%" :close-on-click-modal="true" top="5vh">
      <div class="text-preview-body">
        <pre class="preview-text-content">{{ textContent }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Paperclip, Loading, PictureFilled, Document, View, Download } from '@element-plus/icons-vue'
import { getAttachments } from '@/api/file'
import { getPreviewUrl, getDownloadUrl } from '@/api/file'
import mammoth from 'mammoth'

const props = defineProps({
  contractId: { type: [Number, String], default: null }
})

const attachments = ref([])
const loading = ref(false)
const imagePreviewVisible = ref(false)
const pdfPreviewVisible = ref(false)
const wordPreviewVisible = ref(false)
const textPreviewVisible = ref(false)
const currentPreviewUrl = ref('')
const currentPreviewName = ref('')
const textContent = ref('')
const wordHtml = ref('')
const wordLoading = ref(false)
const previewingFileId = ref(null)

const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
const pdfExts = ['.pdf']
const docxExts = ['.docx']
const textExts = ['.txt', '.md', '.csv', '.json', '.xml', '.log', '.sql', '.yaml', '.yml', '.ini', '.cfg', '.properties', '.html', '.htm', '.css', '.js', '.ts', '.java', '.py', '.sh', '.bat', '.cmd']

const isImage = (file) => imageExts.includes(getExt(file))
const isPdf = (file) => pdfExts.includes(getExt(file))
const isDocx = (file) => docxExts.includes(getExt(file))
const isText = (file) => textExts.includes(getExt(file))

const getExt = (file) => {
  const name = (file.fileName || '').toLowerCase()
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.substring(dot) : ''
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const fetchAttachments = async () => {
  if (!props.contractId) {
    attachments.value = []
    return
  }
  loading.value = true
  try {
    const res = await getAttachments(props.contractId)
    attachments.value = res.data || []
  } catch {
    attachments.value = []
  } finally {
    loading.value = false
  }
}

/** 通过 fetch 获取预览文件内容，绕过 axios JSON 拦截器 */
const fetchPreviewRaw = async (fileId, responseType) => {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers['Authorization'] = token
  }
  const resp = await fetch(`/api/files/preview/${fileId}`, { headers })
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`)
  }
  if (responseType === 'arraybuffer') {
    return resp.arrayBuffer()
  }
  if (responseType === 'text') {
    return resp.text()
  }
  return resp.blob()
}

const handlePreview = async (file) => {
  const url = getPreviewUrl(file.id)
  currentPreviewUrl.value = url
  currentPreviewName.value = file.fileName

  if (isImage(file)) {
    imagePreviewVisible.value = true
  } else if (isPdf(file)) {
    pdfPreviewVisible.value = true
  } else if (isDocx(file)) {
    // Word .docx → mammoth.js 转为 HTML 在线预览
    previewingFileId.value = file.id
    wordPreviewVisible.value = true
    wordLoading.value = true
    wordHtml.value = ''
    try {
      const arrayBuffer = await fetchPreviewRaw(file.id, 'arraybuffer')
      const result = await mammoth.convertToHtml({ arrayBuffer })
      wordHtml.value = result.value
    } catch {
      wordHtml.value = '<p style="color:#999;">文档解析失败，请点击"下载"查看</p>'
    } finally {
      wordLoading.value = false
      previewingFileId.value = null
    }
  } else if (isText(file)) {
    try {
      const text = await fetchPreviewRaw(file.id, 'text')
      textContent.value = text
      textPreviewVisible.value = true
    } catch {
      ElMessage.warning('文本文件加载失败')
    }
  } else {
    ElMessage.info(`「${file.fileName}」暂不支持在线预览，请点击"下载"保存到本地查看`)
  }
}

const handleDownload = (file) => {
  const url = getDownloadUrl(file.id)
  const a = document.createElement('a')
  a.href = url
  a.download = file.fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

watch(() => props.contractId, () => {
  fetchAttachments()
}, { immediate: true })
</script>

<style scoped>
.attachment-preview {
  margin-bottom: 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 10px;
}

.loading-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--c-text2);
  padding: 12px;
}

.empty-wrap {
  padding: 12px;
}

.empty-text {
  font-size: 12px;
  color: var(--c-text2);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 160px;
  overflow-y: auto;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.attachment-item:hover {
  background: var(--c-bg-hover, #f0f2f5);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.file-icon {
  color: var(--c-pri);
  flex-shrink: 0;
}

.file-name {
  font-size: 12px;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.file-size {
  font-size: 11px;
  color: var(--c-text2);
  flex-shrink: 0;
}

.file-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

.image-preview-body {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 70vh;
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.pdf-preview-body {
  height: 80vh;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
}

.word-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--c-text2);
  font-size: 14px;
}

.word-preview-body {
  max-height: 75vh;
  overflow: auto;
}

.word-content {
  padding: 24px 32px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

/* mammoth 转换后的样式修正 */
.word-content :deep(h1) { font-size: 22px; margin: 16px 0 8px; }
.word-content :deep(h2) { font-size: 18px; margin: 14px 0 6px; }
.word-content :deep(h3) { font-size: 15px; margin: 12px 0 4px; }
.word-content :deep(p) { margin: 8px 0; }
.word-content :deep(table) { border-collapse: collapse; width: 100%; margin: 12px 0; }
.word-content :deep(td), .word-content :deep(th) { border: 1px solid #ccc; padding: 6px 10px; }
.word-content :deep(img) { max-width: 100%; }
.word-content :deep(ul), .word-content :deep(ol) { padding-left: 24px; }

.text-preview-body {
  max-height: 65vh;
  overflow: auto;
}

.preview-text-content {
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>
