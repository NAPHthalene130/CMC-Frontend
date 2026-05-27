<template>
  <div class="home-page">
    <section class="page-head">
      <h1>合同管理系统</h1>
      <p>您好，{{ username }}，欢迎使用合同管理系统。</p>
    </section>

    <el-alert
      v-if="isNewUser"
      title="您是新用户，暂无合同操作权限，请等待管理员为您配置角色权限。"
      type="warning"
      :closable="false"
      show-icon
      class="notice"
    />

    <div class="cards">
      <el-card class="summary-card">
        <span class="label">当前角色</span>
        <strong>{{ roleText }}</strong>
      </el-card>
      <el-card class="summary-card">
        <span class="label">权限数量</span>
        <strong>{{ permissionCount }}</strong>
      </el-card>
      <el-card class="summary-card">
        <span class="label">系统状态</span>
        <strong>运行中</strong>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/index'

const userStore = useUserStore()
const username = computed(() => userStore.userInfo?.username || '用户')
const isNewUser = computed(() => userStore.role === 'NEW_USER')
const permissionCount = computed(() => userStore.permissions?.length || 0)
const roleText = computed(() => {
  const roleMap = { ADMIN: '合同管理员', OPERATOR: '合同操作员', NEW_USER: '新用户' }
  return roleMap[userStore.role] || userStore.role || '未授权'
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xl);
}

.page-head {
  background: var(--c-surface);
  border: 1px solid var(--c-border-light);
  border-radius: var(--radius-lg);
  padding: var(--sp-xl);
  box-shadow: var(--shadow-sm);
}

.page-head h1 {
  margin: 0 0 var(--sp-sm);
  color: var(--c-text);
  font-size: 20px;
}

.page-head p {
  margin: 0;
  color: var(--c-text2);
}

.notice {
  border-radius: var(--radius-md);
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-lg);
}

.summary-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.label {
  color: var(--c-text2);
  font-size: 12px;
}

strong {
  color: var(--c-text);
  font-size: 18px;
}
</style>
