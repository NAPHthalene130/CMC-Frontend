<template>
  <div class="template-page">
    <PageHeader title="合同模板管理" description="管理合同起草模板，支持模板分类和内容预置">
      <template #extra>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新建模板</el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <SearchBar v-model="keyword" @search="handleSearch" placeholder="搜索模板名称" />

      <el-table :data="tableData" v-loading="loading" size="small" class="data-table">
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column prop="name" label="模板名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <StatusTag v-if="row.category" :text="row.category" type="info" />
            <span v-else class="text-muted">未分类</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <EmptyState v-if="!loading && tableData.length === 0" description="暂无模板数据" />

      <div v-if="total > 0" class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          small
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑模板' : '新建模板'"
      width="620px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" clearable style="width: 100%">
            <el-option label="采购合同" value="采购合同" />
            <el-option label="销售合同" value="销售合同" />
            <el-option label="服务合同" value="服务合同" />
            <el-option label="租赁合同" value="租赁合同" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入模板内容（可使用占位符如：{{客户名称}}、{{签订日期}}）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from '@/api/template'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const keyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editId = ref(null)

const form = ref({
  name: '',
  category: '',
  description: '',
  content: ''
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTemplates({ page: pageNum.value, pageSize: pageSize.value, keyword: keyword.value })
    if (res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    /* handled */
  }
  loading.value = false
}

const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  form.value = { name: '', category: '', description: '', content: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  form.value = {
    name: row.name || '',
    category: row.category || '',
    description: row.description || '',
    content: row.content || ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateTemplate(editId.value, form.value)
      ElMessage.success('模板更新成功')
    } else {
      await addTemplate(form.value)
      ElMessage.success('模板创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch {
    ElMessage.error('操作失败')
  }
  submitting.value = false
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除模板「${row.name}」吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTemplate(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.template-page {
  max-width: 1100px;
  margin: 0 auto;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

.data-table {
  margin-top: 16px;
}

.text-muted {
  color: var(--c-text2);
  font-size: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
