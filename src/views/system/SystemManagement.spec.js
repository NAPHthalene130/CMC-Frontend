import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const readView = (name) => readFileSync(resolve(process.cwd(), `src/views/system/${name}.vue`), 'utf-8')

describe('系统管理页面', () => {
  it('分配合同仅查询起草状态并要求三类流程人员必填', () => {
    const source = readView('AssignContract')

    expect(source).toContain('stateType: 1')
    expect(source).toContain('请至少选择一名会签人员')
    expect(source).toContain('请至少选择一名审批人员')
    expect(source).toContain('请至少选择一名签订人员')
  })

  it('分配合同提交成功后刷新待分配列表', () => {
    const source = readView('AssignContract')

    expect(source).toContain('await assignContract(assignForm)')
    expect(source).toContain('await fetchData()')
  })

  it('权限分配必须选择角色并提交 roleId', () => {
    const source = readView('PermissionAssign')

    expect(source).toContain('请选择角色')
    expect(source).toContain('roleId: permissionForm.roleId')
    expect(source).toContain('授权成功')
  })

  it('权限分配具备分页、角色胶囊展示和提交 loading', () => {
    const source = readView('PermissionAssign')

    expect(source).toContain('v-model:current-page="query.page"')
    expect(source).toContain('status-pill')
    expect(source).toContain(':loading="submitting"')
  })
})
