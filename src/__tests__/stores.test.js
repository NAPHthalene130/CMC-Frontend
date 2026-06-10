import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(() => Promise.resolve()),
  register: vi.fn(),
  getMe: vi.fn()
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

import { useAuthStore } from '@/stores/auth'
import { useTabsStore } from '@/stores/tabs'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockPush.mockClear()
  })

  it('should initialize with no token', () => {
    const store = useAuthStore()
    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })

  it('should set token after login', async () => {
    const store = useAuthStore()
    store.token = 'test-token-123'
    store.userInfo = { id: 1, username: 'admin' }
    store.role = 'ADMIN'
    expect(store.isLoggedIn).toBe(true)
    expect(store.username).toBe('admin')
  })

  it('should clear state on logout', async () => {
    const store = useAuthStore()
    store.token = 'test-token'
    store.userInfo = { id: 1, username: 'admin' }
    store.role = 'ADMIN'
    store.permissions = ['起草合同']

    await store.logout()
    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.role).toBe('')
    expect(store.permissions).toEqual([])
  })
})

describe('Tabs Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

  it('should start with no opened tabs', () => {
    const store = useTabsStore()
    expect(store.openedTabs).toEqual([])
  })

  it('should open a new tab', () => {
    const store = useTabsStore()
    store.openTab({ path: '/home', meta: { title: '首页' } })
    expect(store.openedTabs).toHaveLength(1)
    expect(store.openedTabs[0].title).toBe('首页')
    expect(store.activeTab).toBe('/home')
  })

  it('should not duplicate tabs', () => {
    const store = useTabsStore()
    store.openTab({ path: '/home', meta: { title: '首页' } })
    store.openTab({ path: '/home', meta: { title: '首页' } })
    expect(store.openedTabs).toHaveLength(1)
  })

  it('should close a tab and navigate to adjacent tab', () => {
    const store = useTabsStore()
    store.openTab({ path: '/home', meta: { title: '首页' } })
    store.openTab({ path: '/query', meta: { title: '查询' } })
    store.openTab({ path: '/customer', meta: { title: '客户' } })
    store.activeTab = '/query'
    mockPush.mockClear()
    store.closeTab('/query')
    expect(store.openedTabs).toHaveLength(2)
    expect(store.activeTab).toBe('/customer')
  })

  it('should close other tabs', () => {
    const store = useTabsStore()
    store.openTab({ path: '/home', meta: { title: '首页' } })
    store.openTab({ path: '/query', meta: { title: '查询' } })
    store.openTab({ path: '/customer', meta: { title: '客户' } })
    store.closeOtherTabs('/query')
    expect(store.openedTabs).toHaveLength(1)
    expect(store.openedTabs[0].path).toBe('/query')
  })
})
