<template>
  <div class="register-page">
    <div class="register-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="24" cy="14" r="8" />
            <path d="M8 40 c0 -8.84 7.16 -16 16 -16 s16 7.16 16 16" />
            <line x1="24" y1="28" x2="24" y2="38" />
            <line x1="20" y1="34" x2="28" y2="34" />
          </svg>
        </div>
        <h1>创建账号</h1>
        <p class="hero-sub">注册成为合同管理系统用户</p>
      </div>
      <div class="hero-pattern"></div>
    </div>

    <div class="register-form">
      <div class="form-card">
        <h2>用户注册</h2>
        <p class="form-sub">填写以下信息完成注册</p>

        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
          <!-- 用户名 -->
          <el-form-item prop="username" label="用户名">
            <el-input
              v-model="form.username"
              placeholder="以字母开头，至少4位（可用字母、数字、下划线）"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password" label="密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="至少6位，建议使用数字、字母混合"
              :prefix-icon="Lock"
              show-password
              size="large"
            />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item prop="confirmPassword" label="确认密码">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
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
              @click="handleRegister"
              size="large"
            >
              {{ loading ? '注册中...' : '提 交' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          已有账号？
          <router-link to="/login" class="link">返回登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]{3,}$/, message: '须以字母开头，至少4位（可用字母、数字、下划线）', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.register({
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword
    })
    ElMessage.success('注册成功，即将跳转到登录页')
    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (err) {
    ElMessage.error(err?.response?.data?.msg || err?.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  background: var(--c-bg);
}

/* ===== 左侧品牌区 ===== */
.register-hero {
  flex: 1;
  background: linear-gradient(160deg, #1e3a2f 0%, #2d6a4f 50%, #40916c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-width: 380px;
}
.hero-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 70%, rgba(82, 183, 136, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgba(45, 106, 79, 0.2) 0%, transparent 50%),
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
  letter-spacing: 3px;
}

/* ===== 右侧表单区 ===== */
.register-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 40px;
  min-width: 440px;
  background: var(--c-surface);
  overflow-y: auto;
}
.form-card {
  width: 420px;
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
  margin-bottom: 28px;
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
  margin-top: 8px;
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
  .register-page { flex-direction: column; }
  .register-hero { min-width: unset; padding: 40px 24px; }
  .register-hero h1 { font-size: 22px; letter-spacing: 4px; }
  .register-form { min-width: unset; padding: 24px; }
  .form-card { width: 100%; }
}
</style>
