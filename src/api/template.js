import request from '@/utils/request'

export const getTemplates = (params) => request.get('/templates', { params })

export const getTemplateList = () => request.get('/templates/list')

export const getTemplate = (id) => request.get(`/templates/${id}`)

export const addTemplate = (data) => request.post('/templates', data)

export const updateTemplate = (id, data) => request.put(`/templates/${id}`, data)

export const deleteTemplate = (id) => request.delete(`/templates/${id}`)
