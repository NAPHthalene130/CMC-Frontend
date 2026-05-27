import request from '@/utils/request'

export function assignContract(data) {
  return request.post('/process/assign', data)
}

export function getPending(type) {
  return request.get('/process/pending', { params: { type } })
}

export function getContractProcesses(contractId, type) {
  return request.get(`/process/contracts/${contractId}`, { params: { type } })
}

export function countersign(data) {
  return request.post('/process/countersign', data)
}

export function approve(data) {
  return request.post('/process/approve', data)
}

export function sign(data) {
  return request.post('/process/sign', data)
}
