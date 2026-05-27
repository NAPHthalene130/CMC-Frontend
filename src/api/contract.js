import request from '@/utils/request'

export function draftContract(data) {
  return request.post('/contracts/draft', data)
}

export function uploadContractAttachment(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/contracts/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getContractAttachments(id) {
  return request.get(`/contracts/${id}/attachments`)
}

export function finalizeContract(id, data) {
  return request.put(`/contracts/${id}/finalize`, data)
}

export function getContracts(params) {
  return request.get('/contracts', { params })
}

export function getContract(id) {
  return request.get(`/contracts/${id}`)
}

export function deleteContract(id) {
  return request.delete(`/contracts/${id}`)
}
