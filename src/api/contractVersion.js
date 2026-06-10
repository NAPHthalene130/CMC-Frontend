import request from '@/utils/request'

export const getVersions = (contractId) => request.get(`/contract-versions/${contractId}`)

export const getVersionDetail = (versionId) => request.get(`/contract-versions/detail/${versionId}`)
