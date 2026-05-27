<template>
  <div class="home-page">
    <section class="page-hero home-hero">
      <h1 class="page-title">合同管理系统</h1>
      <p class="page-desc">您好，{{ username }}，这里是你的合同流程工作台。</p>
    </section>

    <el-alert
      v-if="isNewUser"
      title="您是新用户，暂无合同操作权限，请等待管理员为您配置角色权限。"
      type="warning"
      :closable="false"
      show-icon
      class="notice"
    />

    <div class="metric-grid">
      <article class="metric-card">
        <div class="metric-label">当前角色</div>
        <div class="metric-value">{{ roleText }}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">权限数量</div>
        <div class="metric-value">{{ permissionCount }}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">合同总数</div>
        <div class="metric-value">{{ stats.total }}</div>
      </article>
      <article class="metric-card">
        <div class="metric-label">待办任务</div>
        <div class="metric-value">{{ pendingTotal }}</div>
      </article>
    </div>

    <el-card class="page-panel table-card">
      <template #header>
        <div class="panel-header">
          <span class="section-title">合同状态看板</span>
          <el-button type="primary" @click="loadDashboard">刷新</el-button>
        </div>
      </template>
      <div class="status-board" v-loading="loading">
        <div v-for="item in statusCards" :key="item.label" class="status-card">
          <span :class="['status-pill', item.className]">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </el-card>

    <el-card class="page-panel table-card">
      <template #header><span class="section-title">我的待办中心</span></template>
      <div class="todo-grid" v-loading="loading">
        <button class="todo-card" type="button" :disabled="!can('P_COUNTER')" @click="goTodo('/contract/pending-countersign', 'P_COUNTER')">
          <span>待会签</span><strong>{{ pending.countersign }}</strong>
        </button>
        <button class="todo-card" type="button" :disabled="!can('P_APPROVE')" @click="goTodo('/contract/pending-approve', 'P_APPROVE')">
          <span>待审批</span><strong>{{ pending.approve }}</strong>
        </button>
        <button class="todo-card" type="button" :disabled="!can('P_SIGN')" @click="goTodo('/contract/pending-sign', 'P_SIGN')">
          <span>待签订</span><strong>{{ pending.sign }}</strong>
        </button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index'
import { getContractStats } from '@/api/contract'
import { getPending } from '@/api/process'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const username = computed(() => userStore.userInfo?.username || '用户')
const isNewUser = computed(() => userStore.role === 'NEW_USER')
const permissionCount = computed(() => userStore.permissions?.length || 0)
const roleText = computed(() => {
  const roleMap = { ADMIN: '合同管理员', OPERATOR: '合同操作员', NEW_USER: '新用户' }
  return userStore.userInfo?.roleName || roleMap[userStore.role] || userStore.role || '未授权'
})
const loading = ref(false)
const stats = reactive({ total: 0, draft: 0, countersigned: 0, finalized: 0, approved: 0, signed: 0 })
const pending = reactive({ countersign: 0, approve: 0, sign: 0 })
const pendingTotal = computed(() => pending.countersign + pending.approve + pending.sign)
const statusCards = computed(() => [
  { label: '起草', value: stats.draft, className: 'status-draft' },
  { label: '会签完成', value: stats.countersigned, className: 'status-counter' },
  { label: '定稿完成', value: stats.finalized, className: 'status-final' },
  { label: '审批完成', value: stats.approved, className: 'status-approved' },
  { label: '签订完成', value: stats.signed, className: 'status-signed' }
])

const loadDashboard = async () => {
  if (isNewUser.value) return
  loading.value = true
  try {
    const [statsRes, countersignRes, approveRes, signRes] = await Promise.all([
      getContractStats(),
      getPending(1),
      getPending(2),
      getPending(3)
    ])
    Object.assign(stats, statsRes.data || {})
    pending.countersign = countersignRes.data?.length || 0
    pending.approve = approveRes.data?.length || 0
    pending.sign = signRes.data?.length || 0
  } catch { /* handled by interceptor */ }
  loading.value = false
}

const can = (permission) => userStore.role === 'ADMIN' || userStore.permissions.includes(permission)
const goTodo = (path, permission) => {
  if (!can(permission)) {
    ElMessage.warning('当前角色暂无该待办权限')
    return
  }
  router.push(path)
}

onMounted(loadDashboard)
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xl);
}

.notice {
  border-radius: var(--radius-md);
}

.status-board,
.todo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--sp-lg);
}

.status-card,
.todo-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
  padding: var(--sp-lg);
}

.todo-card {
  cursor: pointer;
  font: inherit;
  color: var(--c-text2);
  transition: transform .2s, box-shadow .2s;
}

.todo-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.todo-card:disabled {
  cursor: not-allowed;
  opacity: .55;
  transform: none;
}

.status-card strong,
.todo-card strong {
  color: var(--c-text);
  font-size: 22px;
}
</style>
