import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import { ElMessage } from 'element-plus'

const normalizeRole = (role) => {
  const roleMap = {
    ADMIN: 'ADMIN',
    管理员: 'ADMIN',
    合同管理员: 'ADMIN',
    OPERATOR: 'OPERATOR',
    操作员: 'OPERATOR',
    合同操作员: 'OPERATOR',
    NEW_USER: 'NEW_USER',
    新用户: 'NEW_USER'
  }
  return roleMap[role] || role || 'NEW_USER'
}

const roleDisplayName = (role) => {
  const roleMap = { ADMIN: '合同管理员', OPERATOR: '合同操作员', NEW_USER: '新用户' }
  return roleMap[normalizeRole(role)] || role || '未授权'
}

export const useUserStore = defineStore('user', {
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
      const { token, userInfo, role, roleName, permissions } = res.data || res
      this.token = token
      this.role = normalizeRole(role || userInfo?.role)
      this.userInfo = { ...(userInfo || {}), role: this.role, roleName: roleName || userInfo?.roleName || roleDisplayName(this.role) }
      this.permissions = permissions || []
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      localStorage.setItem('role', this.role)
      localStorage.setItem('permissions', JSON.stringify(this.permissions))
    },

    async fetchUserInfo() {
      try {
        const res = await getMe()
        const { userInfo, role, roleName, permissions } = res.data || res
        if (role || userInfo?.role) this.role = normalizeRole(role || userInfo?.role)
        if (userInfo) this.userInfo = { ...userInfo, role: this.role, roleName: roleName || userInfo.roleName || roleDisplayName(this.role) }
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
