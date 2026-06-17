import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useTabsStore = defineStore('tabs', () => {
  const router = useRouter()
  const openedTabs = ref([])
  const activeTab = ref('')

  const hasTab = (path) => openedTabs.value.some((t) => t.path === path)

  const openTab = (route) => {
    const { path, meta } = route
    if (!hasTab(path)) {
      openedTabs.value.push({
        path,
        title: meta?.title || path,
        icon: meta?.icon || '',
        closable: true
      })
    }
    activeTab.value = path
    router.push(path)
  }

  const closeTab = (path) => {
    const idx = openedTabs.value.findIndex((t) => t.path === path)
    if (idx < 0) return
    openedTabs.value.splice(idx, 1)
    if (activeTab.value === path) {
      const nextTab = openedTabs.value[Math.min(idx, openedTabs.value.length - 1)]
      if (nextTab) {
        activeTab.value = nextTab.path
        router.push(nextTab.path)
      } else {
        activeTab.value = ''
        router.push('/home')
      }
    }
  }

  const closeOtherTabs = (path) => {
    openedTabs.value = openedTabs.value.filter((t) => t.path === path || !t.closable)
    activeTab.value = path
  }

  const closeAllTabs = () => {
    openedTabs.value = []
    activeTab.value = ''
    router.push('/home')
  }

  const setActiveTab = (path) => {
    activeTab.value = path
    router.push(path)
  }

  return {
    openedTabs,
    activeTab,
    hasTab,
    openTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    setActiveTab
  }
})
