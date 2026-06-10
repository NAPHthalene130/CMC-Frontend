<template>
  <div class="version-page">
    <PageHeader title="合同版本历史" :description="`合同「${contractName}」的版本变更记录`" />

    <div class="content-card" v-loading="loading">
      <el-timeline v-if="versions.length > 0">
        <el-timeline-item
          v-for="v in versions"
          :key="v.id"
          :timestamp="v.createTime"
          placement="top"
          :color="v.versionNum === 1 ? '#2d6a4f' : '#40916c'"
        >
          <div class="version-card">
            <div class="version-header">
              <span class="version-num">版本 {{ v.versionNum }}</span>
              <StatusTag v-if="v.versionNum === 1" text="首次创建" type="draft" />
              <StatusTag v-else text="修订版本" type="info" />
            </div>
            <div class="version-name">名称：{{ v.name }}</div>
            <div class="version-change" v-if="v.changeDesc">
              <span class="change-label">变更说明：</span>{{ v.changeDesc }}
            </div>
            <el-collapse class="version-content-collapse">
              <el-collapse-item title="查看合同内容">
                <div class="content-text">{{ v.content || '暂无内容' }}</div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-timeline-item>
      </el-timeline>

      <EmptyState v-else description="暂无版本记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getVersions } from '@/api/contractVersion'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const loading = ref(false)
const versions = ref([])
const contractName = ref('')

const contractId = route.query.contractId
const contractNameParam = route.query.contractName || ''

onMounted(async () => {
  contractName.value = contractNameParam
  if (!contractId) return

  loading.value = true
  try {
    const res = await getVersions(contractId)
    versions.value = res.data || []
    if (versions.value.length > 0 && !contractName.value) {
      contractName.value = versions.value[0].name || ''
    }
  } catch {
    /* handled */
  }
  loading.value = false
})
</script>

<style scoped>
.version-page {
  max-width: 800px;
  margin: 0 auto;
}

.content-card {
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

.version-card {
  padding: 4px 0;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.version-num {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-pri);
}

.version-name {
  font-size: 13px;
  color: var(--c-text);
  margin-bottom: 4px;
}

.version-change {
  font-size: 12px;
  color: var(--c-text2);
  margin-bottom: 8px;
}

.change-label {
  font-weight: 600;
}

.version-content-collapse {
  margin-top: 8px;
}

.content-text {
  font-size: 13px;
  color: var(--c-text);
  line-height: 1.8;
  white-space: pre-wrap;
  padding: 12px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
}
</style>
