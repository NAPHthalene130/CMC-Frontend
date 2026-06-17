import request from '@/utils/request'

export function getFunctions(params) {
  return request.get('/functions', { params })
}

export function getFunctionList() {
  return request.get('/functions/list')
}

export function addFunction(data) {
  return request.post('/functions', data)
}

export function updateFunction(id, data) {
  return request.put(`/functions/${id}`, data)
}

export function deleteFunction(id) {
  return request.delete(`/functions/${id}`)
}
