import request from '@/utils/request'

export const uploadFile = (formData) =>
  request.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const checkChunks = (fileId) =>
  request.get('/files/chunk/check', { params: { fileId } })

export const uploadChunk = (formData) =>
  request.post('/files/chunk/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const downloadFile = (id) =>
  request.get(`/files/download/${id}`, { responseType: 'blob' })

export const getAttachments = (contractId) =>
  request.get(`/files/contract/${contractId}`)

export const deleteAttachment = (id) =>
  request.delete(`/files/${id}`)

/** Get preview URL for a file (for img src / iframe src) */
export const getPreviewUrl = (id) =>
  `/api/files/preview/${id}`

/** Get download URL for a file */
export const getDownloadUrl = (id) =>
  `/api/files/download/${id}`
