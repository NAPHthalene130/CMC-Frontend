<template>
  <div class="permission-page">
    <PageHeader title="分配权限" description="为用户分配系统角色和操作权限" />

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column label="当前角色" min-width="160">
          <template #default="{ row }">
            <StatusTag :type="row.roleName ? 'success' : 'info'" :text="row.roleName || '未分配'" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleAuth(row)">授权</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无用户数据" />

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="配置权限" width="450px" :close-on-click-modal="false">
      <div class="auth-dialog">
        <div class="auth-user-info">
          <span class="auth-label">用户</span>
          <span class="auth-value">{{ currentUser?.username }}</span>
        </div>
        <el-form :model="authForm" :rules="authRules" ref="authFormRef" label-width="90px">
          <el-form-item label="选择角色" prop="roleId">
            <el-select v-model="authForm.roleId" placeholder="请选择角色" class="full-width">
              <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id">
                <span>{{ r.name }}</span>
                <span class="role-desc" v-if="r.description"> - {{ r.description }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPermission" :loading="submitting">确认授权</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUsers, updateUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const dialogVisible = ref(false)
const currentUser = ref(null)
const roles = ref([])
const submitting = ref(false)
const authFormRef = ref(null)

const authForm = reactive({
  roleId: null
})

const authRules = {
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUsers({ page: page.value, pageSize })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const res = await getRoleList()
    roles.value = res.data || []
  } catch {
    roles.value = []
  }
}

const handleAuth = (row) => {
  currentUser.value = row
  authForm.roleId = row.roleId || null
  dialogVisible.value = true
}

const submitPermission = async () => {
  const valid = await authFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await updateUser(currentUser.value.id, {
      roleId: authForm.roleId
    })
    ElMessage.success('授权成功')
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('授权失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchRoles()
})
</script>

<style scoped>
.permission-page {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.auth-dialog {
  padding: 8px 0;
}

.auth-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  margin-bottom: 20px;
}

.auth-label {
  font-size: 13px;
  color: var(--c-text2);
}

.auth-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-pri);
}

.full-width {
  width: 100%;
}

.role-desc {
  font-size: 12px;
  color: var(--c-text2);
}
</style>
