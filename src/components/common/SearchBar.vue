<template>
  <div class="search-bar">
    <el-input
      v-model="keyword"
      :placeholder="placeholder"
      :prefix-icon="Search"
      clearable
      @keyup.enter="$emit('search', keyword)"
      @clear="$emit('search', '')"
    />
    <el-button type="primary" @click="$emit('search', keyword)">搜索</el-button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请输入关键词搜索' }
})

const emit = defineEmits(['update:modelValue', 'search'])
const keyword = ref(props.modelValue)

watch(() => props.modelValue, (v) => { keyword.value = v })
watch(keyword, (v) => emit('update:modelValue', v))
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 8px;
  max-width: 360px;
}
</style>
