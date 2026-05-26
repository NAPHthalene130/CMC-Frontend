import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

let authErrorShown = false

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      if (res.code === 401) {
        if (!authErrorShown) {
          authErrorShown = true
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          localStorage.removeItem('role')
          localStorage.removeItem('permissions')
          ElMessage.error('登录已过期，请重新登录')
          setTimeout(() => { window.location.href = '/login' }, 1000)
        }
        return Promise.reject(new Error(res.msg || '请先登录'))
      }
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    authErrorShown = false
    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      if (!authErrorShown) {
        authErrorShown = true
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('role')
        localStorage.removeItem('permissions')
        ElMessage.error('登录已过期，请重新登录')
        setTimeout(() => { window.location.href = '/login' }, 1000)
      }
    } else {
      ElMessage.error(error.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

export default request
