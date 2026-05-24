import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    roles: [],
    permissions: []
  }),
  actions: {
    setRoles(roles) {
      this.roles = roles
    },
    setPermissions(permissions) {
      this.permissions = permissions
    },
    hasRole(role) {
      return this.roles.includes(role)
    },
    hasPermission(perm) {
      return this.permissions.includes(perm)
    }
  }
})
