<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>角色管理</span>
        <el-button type="primary" style="float:right" @click="handleAdd">添加角色</el-button>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '添加角色'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="角色名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="权限配置">
          <el-tree :data="functionTree" show-checkbox node-key="id" ref="treeRef"
            :props="{ label: 'name' }" :default-checked-keys="form.functionIds" />
        </el-form-item>
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
import { getRoles, getRoleList, addRole, updateRole, deleteRole } from '@/api/role'
import { getFunctionList } from '@/api/function'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1)
const dialogVisible = ref(false); const isEdit = ref(false); const formRef = ref(null); const treeRef = ref(null)
const functionTree = ref([])
const form = reactive({ id: null, name: '', description: '', functionIds: [] })
const rules = { name: [{ required: true, message: '角色名称不能为空' }] }

const fetchFunctions = async () => { const res = await getFunctionList(); functionTree.value = res.data || [] }
const fetchData = async () => {
  loading.value = true
  try { const res = await getRoles({ page: page.value, pageSize: 10 }); list.value = res.data?.records || []; total.value = res.data?.total || 0 }
  catch { /* handled */ }
  loading.value = false
}
onMounted(() => { fetchData(); fetchFunctions() })

const handleAdd = () => { isEdit.value = false; Object.assign(form, { id: null, name: '', description: '', functionIds: [] }); dialogVisible.value = true }
const handleEdit = (row) => {
  isEdit.value = true
  const fnIds = row.functions ? row.functions.split(',').map(Number) : []
  Object.assign(form, { id: row.id, name: row.name, description: row.description || '', functionIds: fnIds })
  dialogVisible.value = true
}
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' })
  await deleteRole(id); ElMessage.success('删除成功'); fetchData()
}
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const dto = { name: form.name, description: form.description, functionIds: checkedKeys }
  isEdit.value ? await updateRole(form.id, dto) : await addRole(dto)
  ElMessage.success(isEdit.value ? '修改成功' : '添加成功！'); dialogVisible.value = false; fetchData()
}
</script>
