<template>
  <div class="page">
    <el-card>
      <template #header>
        <el-form :inline="true" :model="query">
          <el-form-item label="查找用户">
            <el-input v-model="query.keyword" placeholder="输入查找条件" clearable />
          </el-form-item>
          <el-form-item><el-button type="primary" @click="fetchData">搜索</el-button></el-form-item>
        </el-form>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="roleName" label="角色" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleAuth(row)">授权</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="配置权限" width="400px">
      <el-form>
        <el-form-item label="用户名称">{{ currentUser?.username }}</el-form-item>
        <el-form-item label="配置权限">
          <el-select v-model="selectedRoleId" placeholder="选择角色">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPermission">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsers, updateUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import { ElMessage } from 'element-plus'

const list = ref([]); const loading = ref(false)
const dialogVisible = ref(false); const currentUser = ref(null)
const roles = ref([]); const selectedRoleId = ref(null)
const query = reactive({ keyword: '' })

const fetchData = async () => {
  loading.value = true
  try { const res = await getUsers({ keyword: query.keyword }); list.value = res.data?.records || [] }
  catch { /* handled */ }
  loading.value = false
}
onMounted(() => { fetchData(); getRoleList().then(r => roles.value = r.data || []) })

const handleAuth = (row) => { currentUser.value = row; selectedRoleId.value = row.roleId; dialogVisible.value = true }
const submitPermission = async () => {
  await updateUser(currentUser.value.id, { roleId: selectedRoleId.value, username: currentUser.value.username, password: '' })
  ElMessage.success('授权成功'); dialogVisible.value = false; fetchData()
}
</script>
