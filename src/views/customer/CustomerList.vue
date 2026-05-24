<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>客户管理</span>
        <el-button type="primary" style="float:right" @click="handleAdd">添加客户</el-button>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="num" label="客户编号" />
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="tel" label="电话" />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" :total="total" :page-size="10" layout="total, prev, pager, next"
        @current-change="fetchData" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '添加客户'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="客户名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="电话" prop="tel"><el-input v-model="form.tel" /></el-form-item>
        <el-form-item label="地址" prop="address"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="传真"><el-input v-model="form.fax" /></el-form-item>
        <el-form-item label="邮编"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="银行名称"><el-input v-model="form.bank" /></el-form-item>
        <el-form-item label="银行账号"><el-input v-model="form.account" /></el-form-item>
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
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/api/customer'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1)
const dialogVisible = ref(false); const isEdit = ref(false); const formRef = ref(null)
const form = reactive({ id: null, name: '', tel: '', address: '', fax: '', code: '', bank: '', account: '' })
const rules = {
  name: [{ required: true, message: '客户名称不能为空' }],
  tel: [{ required: true, message: '电话不能为空' }],
  address: [{ required: true, message: '地址不能为空' }]
}

const fetchData = async () => {
  loading.value = true
  try { const res = await getCustomers({ page: page.value, pageSize: 10 }); list.value = res.data?.records || []; total.value = res.data?.total || 0 }
  catch { /* handled */ }
  loading.value = false
}
onMounted(fetchData)

const handleAdd = () => { isEdit.value = false; Object.assign(form, { id: null, name: '', tel: '', address: '', fax: '', code: '', bank: '', account: '' }); dialogVisible.value = true }
const handleEdit = (row) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' })
  await deleteCustomer(id); ElMessage.success('删除成功'); fetchData()
}
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  isEdit.value ? await updateCustomer(form.id, form) : await addCustomer(form)
  ElMessage.success(isEdit.value ? '修改成功' : '添加成功！'); dialogVisible.value = false; fetchData()
}
</script>
