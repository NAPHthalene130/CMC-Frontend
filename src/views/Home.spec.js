import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(resolve(process.cwd(), 'src/views/Home.vue'), 'utf-8')

describe('Home.vue', () => {
  it('首页展示合同统计看板和待办中心', () => {
    expect(source).toContain('合同状态看板')
    expect(source).toContain('我的待办中心')
    expect(source).toContain('getContractStats()')
  })

  it('首页聚合会签、审批、签订待办数量', () => {
    expect(source).toContain('getPending(1)')
    expect(source).toContain('getPending(2)')
    expect(source).toContain('getPending(3)')
    expect(source).toContain('pendingTotal')
  })
})
