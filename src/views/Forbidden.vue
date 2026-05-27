<template>
  <div class="forbidden-page">
    <el-result
      icon="warning"
      title="403"
      sub-title="您暂无权限访问该功能，请联系管理员授权。"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
</script>

<style scoped>
.forbidden-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border-light);
}
</style>
