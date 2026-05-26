<template>
  <div class="watermark-wrapper" ref="containerRef"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from '@/stores/index'

const userStore = useUserStore()
const containerRef = ref(null)
let observer = null

const renderWatermark = () => {
  const container = containerRef.value
  if (!container) return
  container.innerHTML = ''

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const text = `${userStore.username || 'CMS'} ${new Date().toLocaleDateString('zh-CN')}`
  const width = 280
  const height = 180

  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)
  ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(180, 190, 180, 0.08)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.rotate((-20 * Math.PI) / 180)
  ctx.fillText(text, width / 4, height / 2)
  ctx.fillText(text, (width * 3) / 4, height / 2)

  container.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
  container.style.backgroundRepeat = 'repeat'
}

onMounted(() => {
  renderWatermark()
  observer = new MutationObserver(() => renderWatermark())
  if (containerRef.value) {
    observer.observe(containerRef.value, { childList: true, attributes: true })
  }
})

onBeforeUnmount(() => { observer?.disconnect() })

watch(() => userStore.username, renderWatermark)
</script>

<style scoped>
.watermark-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
}
</style>
