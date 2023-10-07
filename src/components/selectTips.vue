<script setup lang='ts'>
import { ref } from 'vue';

const emit = defineEmits<{
  (event: 'clickMask'): void
  (event: 'clickContent'): boolean
}>()

const isShow = ref(true)

const clickMaskFn = () => {
  isShow.value = false
  emit('clickMask')
}

const clickContentFn = (e: Event) => {
  e.stopPropagation()
  const _isShow = emit('clickContent')
  console.log('_isShow: ', _isShow);
  isShow.value = !_isShow
}

</script>

<template>
  <div v-if="isShow" class='selectTips' @click="clickMaskFn">
    <div class="content" @click="clickContentFn">
    </div>
  </div>
</template>

<style lang='less' scoped>
.selectTips {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  .content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 30rem;
    height: 30rem;
    border-radius: 50%;
    box-shadow: 0 0 0 100vw rgba(0, 0, 0, 0.75);
  }
}
</style>