<template>
  <div class="role-page">
    <PageHeader title="角色管理">
      <template #extra>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加角色
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column prop="name" label="角色名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="权限数量" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.functionCount || (row.functions ? row.functions.split(',').length : 0) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无角色数据" />

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '添加角色'" width="550px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入角色描述" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="权限配置">
          <div class="tree-wrapper">
            <el-tree :data="functionTree" show-checkbox node-key="id" ref="treeRef"
              :props="{ label: 'name', children: 'children' }"
              :default-checked-keys="form.functionIds"
              :default-expand-all="false"
              check-strictly />
          </div>
          <div v-if="functionTree.length === 0" class="tree-empty">
            <EmptyState description="暂无可用权限" />
          </div>
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoles, addRole, updateRole, deleteRole } from '@/api/role'
import { getFunctionList } from '@/api/function'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const treeRef = ref(null)
const functionTree = ref([])

const form = reactive({
  id: null,
  name: '',
  description: '',
  functionIds: []
})

const rules = {
  name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRoles({ page: page.value, pageSize })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const fetchFunctions = async () => {
  try {
    const res = await getFunctionList()
    functionTree.value = res.data || []
  } catch {
    functionTree.value = []
  }
}

const resetForm = () => {
  Object.assign(form, { id: null, name: '', description: '', functionIds: [] })
  formRef.value?.clearValidate()
  nextTick(() => {
    treeRef.value?.setCheckedKeys([])
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  const fnIds = row.functions ? row.functions.split(',').map(Number) : []
  Object.assign(form, { id: row.id, name: row.name, description: row.description || '', functionIds: fnIds })
  dialogVisible.value = true
  nextTick(() => {
    treeRef.value?.setCheckedKeys(fnIds)
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该角色？删除后不可恢复。', '删除确认', { type: 'warning' })
    await deleteRole(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled or handled */ }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
  const allKeys = [...checkedKeys, ...halfCheckedKeys]

  submitting.value = true
  try {
    const data = {
      name: form.name,
      description: form.description,
      functionIds: allKeys
    }
    if (isEdit.value) {
      await updateRole(form.id, data)
      ElMessage.success('修改成功')
    } else {
      await addRole(data)
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
  fetchFunctions()
})
</script>

<style scoped>
.role-page {
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

.tree-wrapper {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  padding: 8px;
  width: 100%;
}

.tree-empty {
  padding: 8px 0;
}
</style>
