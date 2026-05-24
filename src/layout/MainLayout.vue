<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo" @click="$router.push('/home')">
        <span v-if="!isCollapse">合同管理系统</span>
        <span v-else>CMS</span>
      </div>
      <el-menu :default-active="activeMenu" :collapse="isCollapse" router
               background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-sub-menu v-if="isOperator" index="contract">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>合同管理</span>
          </template>
          <el-menu-item index="/contract/draft">起草合同</el-menu-item>
          <el-menu-item index="/contract/pending-countersign">待会签合同</el-menu-item>
          <el-menu-item index="/contract/pending-finalize">待定稿合同</el-menu-item>
          <el-menu-item index="/contract/pending-approve">待审批合同</el-menu-item>
          <el-menu-item index="/contract/pending-sign">待签订合同</el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="isAdmin" index="query">
          <template #title>
            <el-icon><Search /></el-icon>
            <span>查询统计</span>
          </template>
          <el-menu-item index="/query/contract">合同信息查询</el-menu-item>
          <el-menu-item index="/query/process">合同流程查询</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="customer" v-if="isAdmin">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/customer">客户列表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="isAdmin" index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/users">用户管理</el-menu-item>
          <el-menu-item index="/system/roles">角色管理</el-menu-item>
          <el-menu-item index="/system/permissions">分配权限</el-menu-item>
          <el-menu-item index="/system/assign">分配合同</el-menu-item>
          <el-menu-item index="/system/logs">日志管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <div class="left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" /><Expand v-else />
          </el-icon>
        </div>
        <div class="right">
          <span class="greeting">您好，{{ username }}</span>
          <el-button type="danger" text @click="handleLogout">注销登录</el-button>
        </div>
      </el-header>
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/index'
import { logout as apiLogout } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapse = ref(false)

const username = computed(() => userStore.userInfo?.username || '用户')
const isAdmin = computed(() => userStore.role === 'ADMIN')
const isOperator = computed(() => userStore.role === 'OPERATOR' || userStore.role === 'ADMIN')
const activeMenu = computed(() => route.path)

const handleLogout = async () => {
  await apiLogout()
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style scoped>
.main-layout { height: 100vh; }
.sidebar { background: #304156; overflow-y: auto; transition: width 0.3s; }
.logo { height: 60px; line-height: 60px; text-align: center; color: #fff; font-size: 18px; font-weight: bold; cursor: pointer; }
.logo span { white-space: nowrap; }
.topbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #e6e6e6; height: 60px; }
.collapse-btn { font-size: 20px; cursor: pointer; }
.greeting { margin-right: 16px; color: #666; }
.content { background: #f5f5f5; padding: 20px; }
</style>
