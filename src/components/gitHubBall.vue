<script setup lang='ts'>
import { computed, ref } from 'vue';
import FloatingBall from './floatingBall';
import { useSourceStore } from '@/stores/source';
import GithubIcon from '@/assets/img/github.svg'

const source = useSourceStore()

const ballClickTime = ref(0)

const ballStyle = computed(() => {
  let distance = source.isMobile ? '1rem' : '1rem'
  return {
    '--initial-position-top': distance,
    [source.isMobile ? '--initial-position-right' : '--initial-position-left']: distance,
    '--z-index': '1000',
  }
})

const toGithub = () => {
  if(Date.now() - ballClickTime.value < 300) {
    window.open('https://github.com/ApeWhoLovesCode/LegendTD')
  }
}

</script>

<template>
  <FloatingBall
    magnetic="x"
    :style="ballStyle"
  >
    <div class="ballWrap" @mousedown="ballClickTime = Date.now()" @click="toGithub">
      <img :src="GithubIcon" alt="" class="githubIcon">
    </div>
  </FloatingBall>
</template>

<style lang='less' scoped>
.ballWrap {
  transition: border-radius ease 0.8s, opacity ease 0.6s;
  padding: 6px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 50%);
  &:hover {
    border-radius: 50%;
  }
  .githubIcon {
    display: block;
    width: 2rem;
    height: 2rem;
    user-select: none;
    -webkit-user-drag: none;
  }
}
</style>