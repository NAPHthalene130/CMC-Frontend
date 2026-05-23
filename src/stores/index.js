import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
    permissions: []
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    setToken(token) {
      this.token = token
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    setPermissions(permissions) {
      this.permissions = permissions
    },
    logout() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
    }
  },
  persist: {
    enabled: true
  }
})
