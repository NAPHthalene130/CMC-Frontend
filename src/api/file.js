import request from '@/utils/request'

export const uploadFile = (formData) =>
  request.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const downloadFile = (id) =>
  request.get(`/files/download/${id}`, { responseType: 'blob' })

export const getAttachments = (contractId) =>
  request.get(`/files/contract/${contractId}`)

export const deleteAttachment = (id) =>
  request.delete(`/files/${id}`)
