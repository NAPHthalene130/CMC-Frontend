<template>
  <div class="tab-bar" ref="tabBarRef">
    <div class="tab-list" ref="tabListRef">
      <div
        v-for="tab in tabsStore.openedTabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: tabsStore.activeTab === tab.path }"
        @click="tabsStore.setActiveTab(tab.path)"
        @contextmenu.prevent="showMenu($event, tab)"
      >
        <el-icon v-if="tab.icon" class="tab-icon"><component :is="tab.icon" /></el-icon>
        <span class="tab-title">{{ tab.title }}</span>
        <el-icon
          v-if="tab.closable"
          class="tab-close"
          @click.stop="tabsStore.closeTab(tab.path)"
        >
          <Close />
        </el-icon>
      </div>
    </div>

    <div v-if="menuVisible" class="context-menu" :style="menuStyle">
      <div class="menu-item" @click="closeCurrent">关闭当前</div>
      <div class="menu-item" @click="closeOthers">关闭其他</div>
      <div class="menu-item" @click="closeAll">关闭全部</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import { Close } from '@element-plus/icons-vue'

const tabsStore = useTabsStore()
const menuVisible = ref(false)
const menuStyle = ref({})
const menuTarget = ref(null)

const showMenu = (e, tab) => {
  menuTarget.value = tab
  menuVisible.value = true
  menuStyle.value = { left: `${e.clientX}px`, top: `${e.clientY}px` }
}

const closeCurrent = () => { tabsStore.closeTab(menuTarget.value.path); menuVisible.value = false }
const closeOthers = () => { tabsStore.closeOtherTabs(menuTarget.value.path); menuVisible.value = false }
const closeAll = () => { tabsStore.closeAllTabs(); menuVisible.value = false }

const handleClickOutside = () => { menuVisible.value = false }
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.tab-bar {
  flex: 1;
  height: 56px;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--c-surface);
}

.tab-list {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
}

.tab-list::-webkit-scrollbar { height: 0; }

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 100%;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  color: var(--c-text2);
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s;
  user-select: none;
  position: relative;
}

.tab-item:hover {
  color: var(--c-pri);
  background: var(--c-hover);
}

.tab-item.active {
  color: var(--c-pri);
  border-bottom-color: var(--c-pri);
  font-weight: 600;
}

.tab-icon { font-size: 14px; }

.tab-close {
  font-size: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tab-close:hover {
  background: var(--c-pri-light);
  color: var(--c-pri);
}

.context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--c-surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 4px 0;
  min-width: 120px;
}

.menu-item {
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  color: var(--c-text);
}

.menu-item:hover {
  background: var(--c-hover);
  color: var(--c-pri);
}
</style>
