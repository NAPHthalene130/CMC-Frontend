<template>
  <div class="workspace-layout">
    <Watermark />
    <div class="top-bar">
      <div class="top-left">
        <BrandHeader />
        <TabBar />
      </div>
      <div class="top-right">
        <NotificationBell />
        <div class="user-area" @click="showMenu = !showMenu" ref="userRef">
          <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
          <span class="user-name">{{ username }}</span>
          <el-icon class="user-arrow" :class="{ rotated: showMenu }"><ArrowDown /></el-icon>
        </div>
        <div v-if="showMenu" class="user-dropdown" @click.stop>
          <div class="dropdown-item" @click="goProfile">
            <el-icon><User /></el-icon> 个人中心
          </div>
          <div class="dropdown-item" @click="toggleTheme">
            <el-icon><Moon /></el-icon> 主题切换
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon> 退出登录
          </div>
        </div>
      </div>
    </div>
    <div class="main-area">
      <div class="nav-sidebar">
        <NavTree />
      </div>
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BrandHeader from './BrandHeader.vue'
import TabBar from './TabBar.vue'
import NavTree from './NavTree.vue'
import Watermark from '@/components/common/Watermark.vue'
import NotificationBell from '@/components/common/NotificationBell.vue'
import { ArrowDown, User, Moon, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useAuthStore()
const showMenu = ref(false)
const userRef = ref(null)

const username = computed(() => userStore.userInfo?.username || '用户')

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

const goProfile = () => {
  showMenu.value = false
  // TODO: navigate to profile page
}

const toggleTheme = () => {
  showMenu.value = false
  document.documentElement.classList.toggle('dark')
}

const handleClickOutside = (e) => {
  if (userRef.value && !userRef.value.contains(e.target)) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.workspace-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--c-bg);
}

.top-bar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border-light);
  flex-shrink: 0;
}

.top-left {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.top-right {
  display: flex;
  align-items: center;
  padding-right: 16px;
  flex-shrink: 0;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.user-area:hover { background: var(--c-hover); }

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-pri), var(--c-pri2));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.user-name {
  font-size: 13px;
  color: var(--c-text);
}

.user-arrow {
  font-size: 12px;
  color: var(--c-text2);
  transition: transform 0.2s;
}

.user-arrow.rotated { transform: rotate(180deg); }

.user-dropdown {
  position: absolute;
  top: 48px;
  right: 16px;
  background: var(--c-surface);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  padding: 4px 0;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--c-text);
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover { background: var(--c-hover); }
.dropdown-item.danger:hover { background: #fee2e2; color: var(--c-danger); }

.dropdown-divider {
  height: 1px;
  background: var(--c-border-light);
  margin: 4px 12px;
}

.main-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.nav-sidebar {
  width: 200px;
  background: var(--c-surface);
  border-right: 1px solid var(--c-border-light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-thumb {
  background: var(--c-border);
  border-radius: 3px;
}
</style>
