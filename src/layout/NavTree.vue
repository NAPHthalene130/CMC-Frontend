<template>
  <div class="nav-tree-wrapper">
    <div class="nav-section" v-for="(group, gIdx) in navGroups" :key="gIdx">
      <div class="nav-group-title" v-if="group.title">{{ group.title }}</div>
      <div
        v-for="item in group.items"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="handleClick(item)"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge" :class="item.badgeType">
          {{ item.badge }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/index'
import { useTabsStore } from '@/stores/tabs'
import {
  Document, Edit, Clock, Checked, List, View, Search, Connection,
  UserFilled, Setting, Opera, Files
} from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()
const tabsStore = useTabsStore()

const isAdmin = computed(() => userStore.role === 'ADMIN')
const isOperator = computed(() => userStore.role === 'OPERATOR' || userStore.role === 'ADMIN')

const navGroups = computed(() => {
  const groups = []

  groups.push({
    title: '',
    items: [
      { path: '/home', label: '工作台', icon: Opera }
    ]
  })

  if (isOperator.value) {
    groups.push({
      title: '合同管理',
      items: [
        { path: '/contract/draft', label: '起草合同', icon: Edit },
        { path: '/contract/pending-countersign', label: '待会签合同', icon: Clock },
        { path: '/contract/pending-finalize', label: '待定稿合同', icon: Files },
        { path: '/contract/pending-approve', label: '待审批合同', icon: Checked },
        { path: '/contract/pending-sign', label: '待签订合同', icon: Document }
      ]
    })
  }

  if (isAdmin.value) {
    groups.push({
      title: '查询统计',
      items: [
        { path: '/query/contract', label: '合同信息查询', icon: Search },
        { path: '/query/process', label: '合同流程查询', icon: View }
      ]
    })

    groups.push({
      title: '基础数据',
      items: [
        { path: '/customer', label: '客户管理', icon: UserFilled }
      ]
    })

    groups.push({
      title: '系统管理',
      items: [
        { path: '/system/assign', label: '分配合同', icon: Connection },
        { path: '/system/users', label: '用户管理', icon: UserFilled },
        { path: '/system/roles', label: '角色管理', icon: Setting },
        { path: '/system/permissions', label: '分配权限', icon: Checked },
        { path: '/system/logs', label: '日志管理', icon: List }
      ]
    })
  }

  return groups
})

const isActive = (path) => route.path === path

const handleClick = (item) => {
  tabsStore.openTab({
    path: item.path,
    meta: { title: item.label, icon: '' }
  })
}
</script>

<style scoped>
.nav-tree-wrapper {
  padding: 8px 0;
  overflow-y: auto;
  flex: 1;
}

.nav-section {
  margin-bottom: 4px;
}

.nav-group-title {
  padding: 8px 20px 4px;
  font-size: 10px;
  font-weight: 600;
  color: var(--c-text2);
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  margin: 2px 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--c-text2);
  font-size: 13px;
  transition: all 0.15s;
  position: relative;
}

.nav-item:hover {
  background: var(--c-hover);
  color: var(--c-pri);
}

.nav-item.active {
  background: var(--c-pri-light);
  color: var(--c-pri);
  font-weight: 600;
}

.nav-icon { font-size: 16px; flex-shrink: 0; }
.nav-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.nav-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  color: #fff;
  min-width: 18px;
  text-align: center;
  line-height: 16px;
}

.nav-badge.warning { background: #d97706; }
.nav-badge.danger { background: #dc2626; }
.nav-badge.info { background: #0c4a6e; }
</style>
