<template>
  <div class="user-page">
    <PageHeader title="用户管理">
      <template #extra>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <div class="toolbar">
        <SearchBar v-model="keyword" placeholder="搜索用户名" @search="handleSearch" />
      </div>

      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column label="角色" min-width="120">
          <template #default="{ row }">{{ row.roleName || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :type="row.status === 1 ? 'success' : 'danger'" :text="row.status === 1 ? '启用' : '禁用'" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" link :type="row.status === 1 ? 'warning' : 'success'" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无用户数据" />

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '添加用户'" width="450px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" maxlength="30" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入密码" maxlength="30" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" clearable class="full-width">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, addUser, updateUser, deleteUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const keyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const roles = ref([])

const form = reactive({
  id: null,
  username: '',
  password: '',
  confirmPassword: '',
  roleId: null
})

const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUsers({ page: page.value, pageSize, keyword: keyword.value })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const res = await getRoleList()
    roles.value = res.data || []
  } catch { /* handled */ }
}

const handleSearch = (val) => {
  keyword.value = val
  page.value = 1
  fetchData()
}

const resetForm = () => {
  Object.assign(form, { id: null, username: '', password: '', confirmPassword: '', roleId: null })
  formRef.value?.clearValidate()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { id: row.id, username: row.username, password: '', confirmPassword: '', roleId: row.roleId || null })
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确认${actionText}该用户？`, '操作确认', { type: 'warning' })
    await updateUser(row.id, { status: newStatus })
    ElMessage.success(`${actionText}成功`)
    fetchData()
  } catch { /* cancelled or handled */ }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该用户？删除后不可恢复。', '删除确认', { type: 'warning' })
    await deleteUser(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled or handled */ }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data = {
      username: form.username,
      roleId: form.roleId
    }
    if (form.password) {
      data.password = form.password
      data.confirmPassword = form.confirmPassword
    }
    if (isEdit.value) {
      await updateUser(form.id, data)
      ElMessage.success('修改成功')
    } else {
      await addUser(data)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
  loadRoles()
})
</script>

<style scoped>
.user-page {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.toolbar {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.full-width {
  width: 100%;
}
</style>
