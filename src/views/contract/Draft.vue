<template>
  <div class="page">
    <el-card>
      <template #header><span>起草合同</span></template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="合同名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" clearable filterable>
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime">
          <el-date-picker v-model="form.beginTime" type="date" placeholder="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="date" placeholder="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="合同内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入合同内容" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload :auto-upload="false" :limit="1">
            <el-button type="primary">上传附件</el-button>
            <template #tip><span class="tip">支持 doc、jpg、png、bmp、gif 格式</span></template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="formRef.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { draftContract } from '@/api/contract'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const form = reactive({
  name: '', customerId: null, beginTime: '', endTime: '', content: ''
})
const rules = {
  name: [{ required: true, message: '合同名称不能为空', trigger: 'blur' }],
  beginTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
  content: [{ required: true, message: '合同内容不能为空', trigger: 'blur' }]
}
const customers = ref([])

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    await draftContract(form)
    ElMessage.success('起草成功！')
    formRef.value.resetFields()
  } catch { /* handled by interceptor */ }
}
</script>

<style scoped>
.page { max-width: 800px; margin: 0 auto; }
.tip { color: #999; font-size: 12px; margin-left: 8px; }
</style>
