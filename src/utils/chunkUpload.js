import { checkChunks, uploadChunk } from '@/api/file'

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024

function generateFileId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
}

function sliceFile(file, chunkSize = DEFAULT_CHUNK_SIZE) {
  const chunks = []
  let start = 0
  let index = 0
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size)
    chunks.push({ index, blob: file.slice(start, end) })
    start = end
    index++
  }
  return chunks
}

/**
 * 分块上传文件，支持断点续传
 * @param {File} file 文件对象
 * @param {Object} options
 * @param {number} [options.contractId] 合同ID
 * @param {number} [options.chunkSize] 分块大小（字节），默认5MB
 * @param {function} [options.onProgress] 进度回调 (percent: number)
 * @param {function} [options.onError] 错误回调 (error: Error)
 * @returns {Promise<Object>} 上传结果 attachment
 */
export async function uploadFileChunked(file, options = {}) {
  const { contractId, chunkSize = DEFAULT_CHUNK_SIZE, onProgress, onError } = options

  const fileId = file.fileId || generateFileId()

  const chunks = sliceFile(file, chunkSize)
  const totalChunks = chunks.length

  try {
    const checkRes = await checkChunks(fileId)
    const meta = checkRes.data || {}

    let uploadedSet = new Set()
    if (meta.exists) {
      uploadedSet = new Set(meta.uploadedChunks || [])
    }

    const pendingChunks = chunks.filter(c => !uploadedSet.has(c.index))
    const totalPending = pendingChunks.length

    if (totalPending === 0) {
      if (meta.exists) {
        return { alreadyDone: true, fileId }
      }
    }

    let completedCount = uploadedSet.size

    for (const chunk of pendingChunks) {
      const formData = new FormData()
      formData.append('file', chunk.blob, `${fileId}-chunk-${chunk.index}`)
      formData.append('fileId', fileId)
      formData.append('chunkIndex', chunk.index)
      formData.append('totalChunks', totalChunks)
      formData.append('fileName', file.name)
      formData.append('fileSize', file.size)
      if (contractId != null) {
        formData.append('contractId', contractId)
      }

      const res = await uploadChunk(formData)
      const chunkResult = res.data || {}

      completedCount++
      if (onProgress) {
        onProgress(Math.round((completedCount / totalChunks) * 100))
      }

      if (chunkResult.completed) {
        return { attachment: chunkResult.attachment, fileId }
      }
    }

    return { alreadyDone: true, fileId }
  } catch (err) {
    if (onError) {
      onError(err)
    }
    throw err
  }
}

export { generateFileId, DEFAULT_CHUNK_SIZE }
