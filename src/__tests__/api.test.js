import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

const mockInstance = {
  defaults: { baseURL: '', timeout: 0 },
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn((config) => {
      mockInstance.defaults.baseURL = config.baseURL
      mockInstance.defaults.timeout = config.timeout
      return mockInstance
    })
  }
}))

describe('API Request Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockInstance.defaults.baseURL = ''
    mockInstance.defaults.timeout = 0
  })

  it('should have correct base URL', async () => {
    const request = (await import('@/utils/request')).default
    expect(request.defaults.baseURL).toBe('/api')
  })

  it('should have timeout set', async () => {
    const request = (await import('@/utils/request')).default
    expect(request.defaults.timeout).toBe(15000)
  })

  it('should register request interceptor', async () => {
    const request = (await import('@/utils/request')).default
    expect(request.interceptors.request.use).toHaveBeenCalled()
  })
})
