import request from '@/utils/request'

export function draftContract(data) {
  return request.post('/contracts/draft', data)
}

export function finalizeContract(id, data) {
  return request.put(`/contracts/${id}/finalize`, data)
}

export function redraftContract(id) {
  return request.post(`/contracts/${id}/redraft`)
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
