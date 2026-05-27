import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const readView = (name) => readFileSync(resolve(process.cwd(), `src/views/contract/${name}.vue`), 'utf-8')

describe('合同流程页面', () => {
  it('起草合同提交 yyyy-MM-dd 日期并校验客户和结束时间', () => {
    const source = readView('Draft')

    expect(source).toContain('value-format="YYYY-MM-DD"')
    expect(source).toContain('客户不能为空')
    expect(source).toContain('结束时间不能早于开始时间')
  })

  it('会签、审批、签订完成后刷新待办列表', () => {
    expect(readView('Countersign')).toContain('await fetchData()')
    expect(readView('Approve')).toContain('await fetchData()')
    expect(readView('Sign')).toContain('await fetchData()')
  })

  it('会签、审批、签订提交前必须填写流程意见', () => {
    expect(readView('Countersign')).toContain('会签意见不能为空')
    expect(readView('Approve')).toContain('审批意见不能为空')
    expect(readView('Sign')).toContain('签订信息不能为空')
  })

  it('定稿合同仅查询会签完成状态并校验内容', () => {
    const source = readView('Finalize')

    expect(source).toContain('stateType: 2')
    expect(source).toContain('getContractProcesses(row.id, 1)')
    expect(source).toContain('合同内容不能为空')
    expect(source).toContain('定稿成功')
  })
})
