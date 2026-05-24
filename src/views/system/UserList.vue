<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>用户管理</span>
        <el-button type="primary" style="float:right" @click="handleAdd">添加用户</el-button>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" :total="total" :page-size="10"
        layout="total, prev, pager, next" @current-change="fetchData" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '添加用户'" width="400px">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" show-password /></el-form-item>
        <el-form-item v-if="!isEdit" label="确认密码" prop="confirmPassword"><el-input v-model="form.confirmPassword" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsers, addUser, updateUser, deleteUser } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1)
const dialogVisible = ref(false); const isEdit = ref(false); const formRef = ref(null)
const form = reactive({ id: null, username: '', password: '', confirmPassword: '' })
const rules = {
  username: [{ required: true, message: '用户名不能为空' }],
  password: [{ required: true, message: '密码不能为空' }],
  confirmPassword: [{ required: true, message: '确认密码不能为空' }]
}

const fetchData = async () => {
  loading.value = true
  try { const res = await getUsers({ page: page.value, pageSize: 10 }); list.value = res.data?.records || []; total.value = res.data?.total || 0 }
  catch { /* handled */ }
  loading.value = false
}
onMounted(fetchData)

const handleAdd = () => { isEdit.value = false; Object.assign(form, { id: null, username: '', password: '', confirmPassword: '' }); dialogVisible.value = true }
const handleEdit = (row) => { isEdit.value = true; Object.assign(form, { id: row.id, username: row.username, password: '', confirmPassword: '' }); dialogVisible.value = true }
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' })
  await deleteUser(id); ElMessage.success('删除成功'); fetchData()
}
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  isEdit.value ? await updateUser(form.id, form) : await addUser(form)
  ElMessage.success(isEdit.value ? '修改成功' : '添加成功！'); dialogVisible.value = false; fetchData()
}
</script>
