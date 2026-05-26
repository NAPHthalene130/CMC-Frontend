<template>
  <div class="customer-page">
    <PageHeader title="客户管理">
      <template #extra>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加客户
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <div class="toolbar">
        <SearchBar v-model="keyword" placeholder="搜索客户名称" @search="handleSearch" />
      </div>

      <el-table :data="list" stripe v-loading="loading" empty-text="">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="客户名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="tel" label="电话" width="140" />
        <el-table-column prop="address" label="地址" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && list.length === 0" description="暂无客户数据，请添加" />

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize"
          layout="total, prev, pager, next" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '添加客户'" width="550px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入客户名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="form.tel" placeholder="请输入联系电话" maxlength="20" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" maxlength="200" />
        </el-form-item>
        <el-form-item label="传真">
          <el-input v-model="form.fax" placeholder="请输入传真" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮编">
          <el-input v-model="form.code" placeholder="请输入邮编" maxlength="10" />
        </el-form-item>
        <el-form-item label="银行名称">
          <el-input v-model="form.bank" placeholder="请输入开户银行" maxlength="50" />
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input v-model="form.account" placeholder="请输入银行账号" maxlength="30" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" maxlength="200" show-word-limit />
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
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/api/customer'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
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

const form = reactive({
  id: null,
  name: '',
  tel: '',
  address: '',
  fax: '',
  code: '',
  bank: '',
  account: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
  tel: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
  address: [{ required: true, message: '地址不能为空', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCustomers({ page: page.value, pageSize, keyword: keyword.value })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = (val) => {
  keyword.value = val
  page.value = 1
  fetchData()
}

const resetForm = () => {
  Object.assign(form, {
    id: null, name: '', tel: '', address: '', fax: '', code: '', bank: '', account: '', remark: ''
  })
  formRef.value?.clearValidate()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id, name: row.name, tel: row.tel, address: row.address || '',
    fax: row.fax || '', code: row.code || '', bank: row.bank || '',
    account: row.account || '', remark: row.remark || ''
  })
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该客户？删除后不可恢复。', '删除确认', { type: 'warning' })
    await deleteCustomer(id)
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
      name: form.name,
      tel: form.tel,
      address: form.address,
      fax: form.fax,
      code: form.code,
      bank: form.bank,
      account: form.account,
      remark: form.remark
    }
    if (isEdit.value) {
      await updateCustomer(form.id, data)
      ElMessage.success('修改成功')
    } else {
      await addCustomer(data)
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
})
</script>

<style scoped>
.customer-page {
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
</style>
