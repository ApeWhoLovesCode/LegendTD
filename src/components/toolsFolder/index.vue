<script setup lang='ts'>
import { computed, ref } from 'vue';
import FloatingBall from '../floatingBall';
import { useSourceStore } from '@/stores/source';

export type ToolsFolderItem = {
  icon: string
  title?: string
  url?: string
}

const props = defineProps<{
  list: ToolsFolderItem[]
}>()

const emits = defineEmits<{
  (event: 'onClickItem', e: ToolsFolderItem): void
}>()

const source = useSourceStore()

const ballClickTime = ref(0)
const isShowMore = ref(false)
const isMoreAreaHide = ref(false)
const isMoreOverflowHidden = ref(true)
const moreStyleState = ref<{x: number, y: number}[]>([])

const ballStyle = computed(() => {
  let distance = source.isMobile ? '1rem' : '1rem'
  return {
    '--initial-position-top': distance,
    [source.isMobile ? '--initial-position-right' : '--initial-position-left']: distance,
    '--z-index': '1000',
  }
})

const onClickItem = (item: ToolsFolderItem) => {
  if(item.url) {
    if(Date.now() - ballClickTime.value < 300 || isShowMore.value) {
      window.open(item.url)
    }
  }
  emits('onClickItem', item)
}

const onShowMore = () => {
  isShowMore.value = true
  isMoreOverflowHidden.value = false
  setTimeout(() => {
    const arr = []
    for(let i = 0; i < props.list.length - 3; i++) {
      const itemInfo = document.querySelector(`.lastItem .icon${i}`)!.getBoundingClientRect()
      const popItemInfo = document.querySelector(`.pop .item${i}`)!.getBoundingClientRect()
      arr.push({
        x: popItemInfo.left - itemInfo.left,
        y: popItemInfo.top - itemInfo.top, 
      })
    }
    moreStyleState.value = arr
  }, 10);
}

const animationEnd = () => {
  isMoreAreaHide.value = true
}

const onHideMore = () => {
  isMoreAreaHide.value = false
  moreStyleState.value = []
  isShowMore.value = false
  setTimeout(() => {
    isMoreOverflowHidden.value = true
  }, 200);
}

</script>

<template>
  <FloatingBall
    magnetic="x"
    :style="ballStyle"
  >
    <div class="tools" @mousedown="ballClickTime = Date.now()">
      <div 
        class="item" 
        v-for="(item, i) in list.slice(0, 3)" 
        :key="item.icon + i" 
        @click="onClickItem(item)"
      >
        <img :src="item.icon" class="icon">
      </div>
      <div 
        class="lastItem" 
        :class="{more: isShowMore, overflowHide: isMoreOverflowHidden}" 
        @click="onShowMore" 
        @animationend="animationEnd"
      >
        <img 
          v-for="(item, i) in list.slice(3)" 
          :key="item.icon + i" 
          :src="item.icon" 
          :class="`icon icon${i} ${isMoreAreaHide ? 'iconHide' : ''}`"
          :style="{
            transform: moreStyleState[i] ? `translate(${moreStyleState[i].x}px, ${moreStyleState[i].y}px)` : '',
            opacity: i > 4 ?( moreStyleState[i] ? 1 : 0) : '',
          }"
        />
      </div>
    </div>
  </FloatingBall>
  <div class="pop" v-if="isShowMore" @click="onHideMore">
    <div class="content">
      <div 
        v-for="(item, i) in list.slice(3)" 
        :key="item.icon + i" 
        :class="`item item${i}`" 
        @click="onClickItem(item)"
      >
        <img :src="item.icon" class="icon">
        <div class="title">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>

<style lang='less' scoped>
.tools {
  display: grid;
  gap: 0.75rem;
  grid-template: 'a a' 'b b';
  background-color: rgba(255, 255, 255, .3);
  padding: 0.75rem;
  border-radius: 1.2rem;
  transition: all .4s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:hover {
    background-color: rgba(255, 255, 255, .4);
    border-radius: 1.6rem;
  }
  .item {
    .icon {
      display: block;
      width: 4rem;
      height: 4rem;
      transition: all .4s;
      user-select: none;
      -webkit-user-drag: none;
      &:hover {
        scale: 1.05;
      }
    }
  }
  .lastItem {
    width: 4rem;
    height: 4rem;
    display: grid;
    gap: 0.25rem;
    grid-template: 'a a' 'b b';
    padding: 0.25rem;
    transition: all .4s;
    border-radius: 0.5rem;
    &:hover {
      background-color: rgba(255, 255, 255, .1);
      border-radius: 1rem;
    }
    .icon {
      width: 1.625rem;
      height: 1.625rem;
      display: block;
      user-select: none;
      -webkit-user-drag: none;
      transition: transform .3s, opacity .2s;
    }
  }
  .overflowHide {
    overflow: hidden;
  }
  .more {
    overflow: visible;
    // 该动画是为了触发动画结束的回调
    @keyframes iconEnd {
      0% { opacity: 1; }
    }
    animation: iconEnd 0.5s;
    .icon {
      width: 4rem;
      height: 4rem;
      &Hide {
        opacity: 0;
      }
    }
  }
}
.pop {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  background-color: rgba(0, 0, 0, .1);
  .content {
    display: grid;
    gap: 2rem;
    grid-template: 'a a a';
    animation: popShow 0.3s ease;
    .item {
      .icon {
        display: block;
        width: 4rem;
        height: 4rem;
        transition: all .4s;
        user-select: none;
        -webkit-user-drag: none;
        &:hover {
          scale: 1.05;
        }
      }
      .title {
        margin-top: 5px;
        font-size: 10px;
        color: #fff;
        text-align: center;
      }
    }
  }
}
@keyframes popShow {
  0% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>