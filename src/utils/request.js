import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

/** 自定义 API 异常，携带后端返回的响应数据 */
export class ApiError extends Error {
  constructor(message, code, response) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.response = response
  }
}

let authRedirecting = false

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
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
        if (!authRedirecting) {
          authRedirecting = true
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          localStorage.removeItem('role')
          localStorage.removeItem('permissions')
          ElMessage.error('登录已过期，请重新登录')
          setTimeout(() => {
            authRedirecting = false
            window.location.href = '/login'
          }, 1000)
        }
        return Promise.reject(new ApiError(res.msg || '请先登录', res.code, res))
      }
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new ApiError(res.msg || '请求失败', res.code, res))
    }
    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      if (!authRedirecting) {
        authRedirecting = true
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('role')
        localStorage.removeItem('permissions')
        ElMessage.error('登录已过期，请重新登录')
        setTimeout(() => {
          authRedirecting = false
          window.location.href = '/login'
        }, 1000)
      }
      return Promise.reject(
        new ApiError('登录已过期，请重新登录', 401, error.response?.data)
      )
    }
    ElMessage.error(error.message || '网络异常')
    return Promise.reject(
      new ApiError(error.message || '网络异常', error.response?.status, error.response?.data)
    )
  }
)

export default request
