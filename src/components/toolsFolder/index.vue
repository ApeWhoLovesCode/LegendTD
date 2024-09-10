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
const isMoreOverflowHidden = ref(true)
const toolsFolderRef = ref<HTMLDivElement>()
const moreItems = ref<{x: number, y: number}[]>([])

const ballStyle = computed(() => {
  let distance = source.isMobile ? '1rem' : '1rem'
  return {
    '--initial-position-top': distance,
    [source.isMobile ? '--initial-position-right' : '--initial-position-left']: distance,
    '--z-index': '1000',
  }
})

const onClickItem = (item: ToolsFolderItem, isExpand = false) => {
  // 需要展开项，当还未获取位置展开弹出层的时候禁止点击 
  if(!isExpand && !moreItems.value.length) return
  if(Date.now() - ballClickTime.value < 300 || isShowMore.value) {
    if(item.url) {
      window.open(item.url)
    }
    emits('onClickItem', item)
    // 延时一下，防止先触发hide，然后再冒泡触发onShowMore
    setTimeout(() => { onHideMore() }, 10);
  }
}

const onShowMore = () => {
  if(Date.now() - ballClickTime.value > 300 || isShowMore.value) return
  isShowMore.value = true
  isMoreOverflowHidden.value = false
  setTimeout(() => {
    const arr = []
    for(let i = 0; i < props.list.length; i++) {
      const itemInfo = toolsFolderRef.value?.querySelector(`.item-${i}`)?.getBoundingClientRect()
      const popItemInfo = toolsFolderRef.value?.querySelector(`.pop-item-${i}`)?.getBoundingClientRect()
      if(!itemInfo || !popItemInfo) continue;
      arr.push({
        x: popItemInfo.left - itemInfo.left,
        y: popItemInfo.top - itemInfo.top, 
      })
    }
    moreItems.value = arr
  }, 10);
}


const onHideMore = () => {
  moreItems.value = []
  isShowMore.value = false
  setTimeout(() => {
    isMoreOverflowHidden.value = true
  }, 300);
}

</script>

<template>
  <div ref="toolsFolderRef">
    <FloatingBall
      magnetic="x"
      :style="ballStyle"
    >
      <div class="tools" @mousedown="ballClickTime = Date.now()">
        <div 
          v-for="(item, i) in list.slice(0, 3)" 
          :key="item.icon + i" 
          :class="`item item-${i}`"
          @click="onClickItem(item, true)"
          :style="{
            transform: moreItems[i] ? `translate(${moreItems[i].x}px, ${moreItems[i].y}px)` : '',
          }"
        >
          <img :src="item.icon" class="icon">
          <div v-if="isShowMore" class="title">{{ item.title }}</div>
        </div>
        <div 
          class="item lastItem" 
          :class="{more: isShowMore, overflowHide: isMoreOverflowHidden}" 
          @click="onShowMore" 
        >
          <div
            v-for="(item, i) in list.slice(3)" 
            :key="item.icon + i" 
            :class="`item-sub item-${3 + i}`"
            :style="{
              transform: moreItems[3 + i] ? `translate(${moreItems[3 + i].x}px, ${moreItems[3 + i].y}px)` : '',
              opacity: i >= 4 ?( moreItems[3 + i] ? 1 : 0) : '',
            }"
            @click="onClickItem(item)"
          >
            <img :src="item.icon" class="icon"/>
            <div v-if="isShowMore" class="title">{{ item.title }}</div>
          </div>
        </div>
      </div>
      <div v-show="isShowMore" class="mask" @click="onHideMore"></div>
    </FloatingBall>
    <div class="pop" v-show="isShowMore">
      <div class="content">
        <div 
          v-for="(item, i) in list" 
          :key="item.icon + i" 
          :class="`pop-item pop-item-${i}`" 
          @click="e => e.stopPropagation()"
        >
        </div>
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
    position: relative;
    z-index: 1;
    transition: transform .3s, opacity .2s;
    .icon {
      display: block;
      width: 4rem;
      height: 4rem;
      user-select: none;
      -webkit-user-drag: none;
      transition: scale .3s;
      &:hover {
        scale: 1.05;
      }
    }
    .title {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      font-size: 10px;
      color: #fff;
      text-align: center;
      user-select: none;
    }
    &-sub {
      position: relative;
      z-index: 1;
      transition: transform 0.4s, opacity .2s;
    }
  }
  .lastItem {
    position: static;
    z-index: unset;
    width: 4rem;
    height: 4rem;
    display: grid;
    gap: 0.25rem;
    grid-template: 'a a' 'b b';
    padding: 0.25rem;
    border-radius: 0.5rem;
    .icon {
      width: 1.625rem;
      height: 1.625rem;
      display: block;
      user-select: none;
      -webkit-user-drag: none;
    }
  }
  .overflowHide {
    overflow: hidden;
  }
  .more {
    overflow: visible;
    .icon {
      width: 4rem;
      height: 4rem;
    }
  }
}
.mask {
  position: fixed;
  left: -100vw;
  top: -100vw;
  width: 200vw;
  height: 200vh;
  background-color: rgba(0, 0, 0, .3);
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
  z-index: 999;
  .content {
    display: grid;
    gap: 2rem;
    grid-template: 'a a a';
    animation: popShow 0.3s ease;
    .pop-item {
      width: 4rem;
      height: 4rem;
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