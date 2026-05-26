<template>
  <div class="notification-bell" ref="bellRef">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
      <el-button :icon="Bell" circle size="small" @click="toggleDropdown" />
    </el-badge>

    <div v-if="visible" class="notification-dropdown">
      <div class="dropdown-header">
        <span class="dropdown-title">通知消息</span>
        <el-button v-if="unreadCount > 0" text size="small" type="primary" @click="handleMarkAllRead">
          全部已读
        </el-button>
      </div>

      <div class="dropdown-body" v-loading="loading">
        <div v-if="notifications.length === 0" class="empty-hint">暂无通知</div>
        <div
          v-for="item in notifications"
          :key="item.id"
          class="notify-item"
          :class="{ unread: item.isRead === 0 }"
          @click="handleClick(item)"
        >
          <div class="notify-icon">
            <el-icon v-if="item.type === 'CONTRACT'"><Document /></el-icon>
            <el-icon v-else-if="item.type === 'APPROVAL'"><Checked /></el-icon>
            <el-icon v-else><Bell /></el-icon>
          </div>
          <div class="notify-content">
            <div class="notify-title">{{ item.title }}</div>
            <div class="notify-desc">{{ item.content }}</div>
            <div class="notify-time">{{ formatTime(item.createTime) }}</div>
          </div>
          <div v-if="item.isRead === 0" class="unread-dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Bell, Document, Checked } from '@element-plus/icons-vue'
import { getNotifications, getUnreadCount, markRead, markAllRead } from '@/api/notification'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const loading = ref(false)
const unreadCount = ref(0)
const notifications = ref([])
const bellRef = ref(null)
let pollTimer = null

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return d.toLocaleDateString('zh-CN')
}

const toggleDropdown = () => {
  visible.value = !visible.value
  if (visible.value) {
    loadNotifications()
  }
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const res = await getNotifications({ page: 1, pageSize: 10 })
    if (res.data?.records) {
      notifications.value = res.data.records
    }
  } catch {
    /* handled */
  }
  loading.value = false
}

const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    if (res.data != null) {
      unreadCount.value = res.data
    }
  } catch {
    /* handled */
  }
}

const handleClick = async (item) => {
  if (item.isRead === 0) {
    try {
      await markRead(item.id)
      item.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {
      /* handled */
    }
  }
}

const handleMarkAllRead = async () => {
  try {
    await markAllRead()
    notifications.value.forEach(n => { n.isRead = 1 })
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch {
    /* handled */
  }
}

const handleClickOutside = (e) => {
  if (bellRef.value && !bellRef.value.contains(e.target)) {
    visible.value = false
  }
}

onMounted(() => {
  loadUnreadCount()
  document.addEventListener('click', handleClickOutside)
  pollTimer = setInterval(loadUnreadCount, 30000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.notification-bell {
  position: relative;
  margin-right: 12px;
}

.notification-dropdown {
  position: absolute;
  top: 42px;
  right: 0;
  width: 360px;
  max-height: 420px;
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--c-border-light);
}

.dropdown-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}

.dropdown-body {
  flex: 1;
  overflow-y: auto;
  min-height: 60px;
  max-height: 350px;
}

.empty-hint {
  text-align: center;
  padding: 32px;
  font-size: 13px;
  color: var(--c-text2);
}

.notify-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.notify-item:hover {
  background: var(--c-hover);
}

.notify-item.unread {
  background: var(--c-pri-light);
}

.notify-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-pri-light);
  color: var(--c-pri);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.notify-content {
  flex: 1;
  min-width: 0;
}

.notify-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 2px;
}

.notify-desc {
  font-size: 12px;
  color: var(--c-text2);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notify-time {
  font-size: 11px;
  color: var(--c-border);
  margin-top: 4px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-pri2);
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
