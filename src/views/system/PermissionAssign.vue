<template>
  <div class="page">
    <section class="page-hero">
      <h1 class="page-title">分配权限</h1>
      <p class="page-desc">为新用户或业务用户分配角色，授权后用户可按角色访问对应功能。</p>
    </section>

    <el-card class="page-panel table-card">
      <template #header>
        <div class="panel-header">
          <span class="section-title">用户权限列表</span>
          <el-button type="primary" @click="fetchData">刷新</el-button>
        </div>
      </template>
      <div class="page-toolbar">
        <el-form :inline="true" :model="query" class="toolbar-form">
          <el-form-item label="查找用户">
            <el-input v-model="query.keyword" placeholder="输入用户名" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button></el-form-item>
        </el-form>
      </div>
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无用户数据">
        <el-table-column prop="username" label="用户名" />
        <el-table-column label="角色">
          <template #default="{ row }">
            <span :class="['status-pill', row.roleId ? 'status-approved' : 'status-rejected']">{{ roleName(row.roleId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleAuth(row)">授权</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar">
        <el-pagination v-model:current-page="query.page" :total="total" :page-size="query.pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="配置权限" width="400px">
      <el-form :model="permissionForm" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="用户名称">{{ currentUser?.username }}</el-form-item>
        <el-form-item label="配置权限" prop="roleId">
          <el-select v-model="permissionForm.roleId" placeholder="选择角色" filterable>
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitPermission">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsers, updateUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import { ElMessage } from 'element-plus'

const list = ref([]); const loading = ref(false); const total = ref(0)
const dialogVisible = ref(false); const currentUser = ref(null)
const roles = ref([]); const submitting = ref(false); const formRef = ref(null)
const query = reactive({ keyword: '', page: 1, pageSize: 10 })
const permissionForm = reactive({ roleId: null })
const rules = { roleId: [{ required: true, message: '请选择角色', trigger: 'change' }] }

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUsers({ keyword: query.keyword, page: query.page, pageSize: query.pageSize })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  }
  catch { /* handled */ }
  loading.value = false
}
onMounted(() => { fetchData(); getRoleList().then(r => roles.value = r.data || []) })

const roleName = (roleId) => roles.value.find((role) => role.id === roleId)?.name || '未授权'
const handleSearch = () => {
  query.page = 1
  fetchData()
}
const handleAuth = (row) => { currentUser.value = row; permissionForm.roleId = row.roleId; dialogVisible.value = true }
const submitPermission = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await updateUser(currentUser.value.id, { roleId: permissionForm.roleId, username: currentUser.value.username, password: '' })
    ElMessage.success('授权成功')
    dialogVisible.value = false
    await fetchData()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
:deep(.el-select) {
  width: 100%;
}
</style>
