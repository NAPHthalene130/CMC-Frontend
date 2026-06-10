import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, register as apiRegister, getMe } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    role: localStorage.getItem('role') || '',
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username || ''
  },
  actions: {
    async login(credentials) {
      const res = await apiLogin(credentials)
      const data = res.data || res
      this.token = data.token
      this.userInfo = data.user || data.userInfo
      this.role = data.role || data.user?.role || ''
      this.permissions = data.permissions || []
      localStorage.setItem('token', this.token)
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      localStorage.setItem('role', this.role)
      localStorage.setItem('permissions', JSON.stringify(this.permissions))
    },

    async register(credentials) {
      await apiRegister(credentials)
    },

    async fetchUserInfo() {
      try {
        const res = await getMe()
        const { userInfo, role, permissions } = res.data || res
        if (userInfo) this.userInfo = userInfo
        if (role) this.role = role
        if (permissions) this.permissions = permissions
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        localStorage.setItem('role', this.role)
        localStorage.setItem('permissions', JSON.stringify(this.permissions))
      } catch {
        // token may have expired; logout handled by interceptor
      }
    },

    async logout() {
      try { await apiLogout() } catch { /* ignore */ }
      this.token = ''
      this.userInfo = null
      this.role = ''
      this.permissions = []
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('role')
      localStorage.removeItem('permissions')
    }
  }
})
