import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const registerSource = readFileSync(
  resolve(process.cwd(), 'src/views/Register.vue'),
  'utf-8'
)

describe('Register.vue', () => {
  it('注册页不允许用户自选业务角色', () => {
    expect(registerSource).toContain('注册后默认为新用户')
    expect(registerSource).not.toContain("form.role")
    expect(registerSource).not.toContain("role: 'OPERATOR'")
    expect(registerSource).not.toContain("role: 'ADMIN'")
  })

  it('注册请求提交确认密码用于后端一致性校验', () => {
    expect(registerSource).toContain('confirmPassword: form.confirmPassword')
  })
})
