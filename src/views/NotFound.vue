<template>
  <div class="not-found">
    <div class="code">404</div>
    <div class="desc">页面不存在</div>
    <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--c-text);
}
.code {
  font-size: 72px;
  font-weight: 700;
  color: var(--c-pri2);
}
.desc {
  font-size: 16px;
  color: var(--c-text2);
}
</style>
