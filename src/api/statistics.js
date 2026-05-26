import request from '@/utils/request'

export const getDashboardStats = () => request.get('/statistics/dashboard')

export const getContractStatusDist = () => request.get('/statistics/contract-status')

export const getMonthlyTrend = () => request.get('/statistics/monthly-trend')

export const getExpiringContracts = () => request.get('/statistics/expiring')

export const getPendingCount = () => request.get('/statistics/pending-count')
