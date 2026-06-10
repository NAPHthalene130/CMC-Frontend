<template>
  <div class="login-page">
    <div class="login-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="8" y="6" width="32" height="36" rx="3" />
            <line x1="16" y1="16" x2="32" y2="16" />
            <line x1="16" y1="22" x2="28" y2="22" />
            <line x1="16" y1="28" x2="24" y2="28" />
            <circle cx="34" cy="32" r="6" />
            <path d="M32 32 l1.5 1.5 l3 -3" />
          </svg>
        </div>
        <h1>合同管理系统</h1>
        <p class="hero-sub">Contract Management System</p>
        <div class="hero-features">
          <span>起草 · 会签 · 定稿</span>
          <span>审批 · 签订 · 归档</span>
        </div>
      </div>
      <div class="hero-pattern"></div>
    </div>

    <div class="login-form">
      <div class="form-card">
        <h2>欢迎登录</h2>
        <p class="form-sub">请输入您的账户信息</p>

        <el-form :model="form" :rules="rules" ref="formRef" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              size="large"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="loading"
              @click="handleLogin"
              size="large"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          还没有账号？
          <router-link to="/register" class="link">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTabsStore } from '@/stores/tabs'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const tabsStore = useTabsStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

const roleRoute = {
  ADMIN: '/home',
  OPERATOR: '/home'
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login({
      username: form.username,
      password: form.password
    })
    ElMessage.success('登录成功')
    try { await authStore.fetchUserInfo() } catch { /* ignore */ }
    tabsStore.closeAllTabs()
    const role = authStore.role || ''
    const path = roleRoute[role] || '/home'
    router.push(path)
  } catch (err) {
    ElMessage.error(err?.response?.data?.msg || err?.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: var(--c-bg);
}

/* ===== 左侧品牌区 ===== */
.login-hero {
  flex: 1;
  background: linear-gradient(160deg, #1e3a2f 0%, #2d6a4f 50%, #40916c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-width: 420px;
}
.hero-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(82, 183, 136, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(45, 106, 79, 0.2) 0%, transparent 50%),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.015) 10px,
      rgba(255, 255, 255, 0.015) 20px
    );
}
.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
}
.hero-icon {
  margin-bottom: 24px;
  opacity: 0.9;
}
.hero-content h1 {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 8px;
  margin-bottom: 8px;
}
.hero-sub {
  font-size: 13px;
  opacity: 0.55;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 32px;
}
.hero-features {
  display: flex;
  gap: 24px;
  justify-content: center;
  font-size: 12px;
  opacity: 0.45;
  letter-spacing: 2px;
}

/* ===== 右侧表单区 ===== */
.login-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-width: 380px;
  background: var(--c-surface);
}
.form-card {
  width: 360px;
}
.form-card h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 4px;
}
.form-sub {
  font-size: 13px;
  color: var(--c-text2);
  margin-bottom: 32px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 4px;
  border-radius: var(--radius-md);
}

.form-footer {
  text-align: center;
  font-size: 13px;
  color: var(--c-text2);
  margin-top: 16px;
}
.link {
  color: var(--c-pri2);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.link:hover {
  color: var(--c-pri);
}

@media (max-width: 860px) {
  .login-page { flex-direction: column; }
  .login-hero { min-width: unset; padding: 48px 24px; }
  .login-hero h1 { font-size: 22px; letter-spacing: 4px; }
  .login-form { min-width: unset; padding: 24px; }
}
</style>
