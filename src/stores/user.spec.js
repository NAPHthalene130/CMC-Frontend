import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './index'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn()
}))

describe('useUserStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('登录成功后保存 token、用户、角色和权限', async () => {
    apiLogin.mockResolvedValue({
      data: {
        token: 'token-1',
        userInfo: { id: 1, username: 'admin', role: 'ADMIN' },
        role: 'ADMIN',
        permissions: ['C_QUERY']
      }
    })

    const store = useUserStore()
    await store.login({ username: 'admin', password: '123456' })

    expect(store.token).toBe('token-1')
    expect(store.role).toBe('ADMIN')
    expect(store.permissions).toEqual(['C_QUERY'])
    expect(localStorage.getItem('token')).toBe('token-1')
  })

  it('登出后清理本地登录状态', async () => {
    apiLogout.mockResolvedValue({})
    const store = useUserStore()
    store.token = 'token-1'
    store.userInfo = { username: 'admin' }
    store.role = 'ADMIN'
    store.permissions = ['C_QUERY']
    localStorage.setItem('token', 'token-1')

    await store.logout()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.role).toBe('')
    expect(store.permissions).toEqual([])
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('获取当前用户信息时同步后端授权结果', async () => {
    getMe.mockResolvedValue({
      data: {
        userInfo: { id: 2, username: 'new_user' },
        role: 'NEW_USER',
        permissions: []
      }
    })

    const store = useUserStore()
    await store.fetchUserInfo()

    expect(store.userInfo.username).toBe('new_user')
    expect(store.role).toBe('NEW_USER')
    expect(store.permissions).toEqual([])
  })

  it('兼容后端返回中文角色名称并保存标准角色编码', async () => {
    apiLogin.mockResolvedValue({
      data: {
        token: 'token-2',
        userInfo: { id: 3, username: 'manager', role: '合同管理员' },
        permissions: ['P_COUNTER']
      }
    })

    const store = useUserStore()
    await store.login({ username: 'manager', password: '123456' })

    expect(store.role).toBe('ADMIN')
    expect(store.userInfo.roleName).toBe('合同管理员')
    expect(localStorage.getItem('role')).toBe('ADMIN')
  })
})
