<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import levelData, {levelNullItem, LevelDataItem, LevelDataItemEnum} from '@/dataSource/levelData';
import CoverCanvas from '@/components/coverCanvas.vue';
import { useSourceStore } from '@/stores/source';
import { useRouter } from 'vue-router';
import UserBall from '@/components/userBall.vue'

const source = useSourceStore()
const router = useRouter()
const state = reactive({
  // 遍历的数据列表
  items: [] as LevelDataItem[],
  pageNum: 1,
  pageSize: 20,
  /** 是否可以加载了 */
  isOnload: false
})

const init = () => {
  const preIndex = (state.pageNum - 1) * state.pageSize
  state.items = levelData.slice(preIndex, preIndex + state.pageSize)
  source.loadingAllImg().then(() => {
    state.isOnload = true
  })
}

const onPageChange = ({pageNum, pageSize}: {pageNum: number, pageSize: number}) => {
  const preIndex = (pageNum - 1) * pageSize
  const arr = levelData.slice(preIndex, preIndex + pageSize)
  // 填充空数据
  const length = arr.length
  for(let i = 0; i < pageSize - length; i++) {
    arr.push(levelNullItem)
  }
  state.items = arr
  state.pageNum = pageNum
  state.pageSize = pageSize
}

onMounted(() => {
  init()
})

const onCardClick = (i: number) => {
  if(levelData[i] && source.progress === 100) {
    router.push(`/game/${i + 1}`)
  }
}

const cardIndex = (i: number) => (state.pageNum - 1) * state.pageSize + i

const getCardText = (i: number) => {
  switch (levelData[i].type) {
    case LevelDataItemEnum.Endless: return '卍';
    case LevelDataItemEnum.Experience: return '试玩';
    default: return i
  }
}

</script>

<template>
  <div class='page-index'>
    <ScrollCircle 
      :list-length="levelData.length" 
      @on-page-change="onPageChange"
    >
      <ScrollCircleItem 
        v-for="(_, i) in state.items" 
        :key="cardIndex(i)" 
        :index="i"
        @on-click="onCardClick(cardIndex(i))"
      >
        <div class="card">
          <div class="card-bg" :style="{filter: `blur(${20 - source.progress * 20 / 100}px)`}">
            <CoverCanvas v-if="source.progress > 10" :index="cardIndex(i)" />
            <div v-if="!levelData[cardIndex(i)]" class="card-disable iconfont icon-disablecase"></div>
          </div>
          <div class="card-level">{{ getCardText(i) }}</div>
        </div>
      </ScrollCircleItem>
    </ScrollCircle>
    <UserBall />
  </div>
</template>

<style lang='less' scoped>
@import '@/style.less'; 
.page-index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: radial-gradient(circle 800px at center, #bcf1f3 0%, #95e0f3 47%, #68baf5 100%);
  @gridSize: 1.2rem;
  .card {
    position: relative;
    width: calc(20 * @gridSize);
    height: calc(12.5 * @gridSize);
    border: 5px solid #fff;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    -webkit-user-drag: none;
    filter: drop-shadow(8px 8px 20px rgba(0, 0, 0, 0.5));
    &-bg {
      position: absolute;
      left: 0;
      top: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(circle 250px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%);
      transition: filter .4s ease-out;
    }
    &-disable {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      text-align: center;
      line-height: calc(12.5 * @gridSize);
      font-size: 10rem;
      color: rgba(255, 255, 255, .5);
    }
    &-level {
      position: absolute;
      right: -2rem;
      top: 1rem;
      width: 8rem;
      height: 2rem;
      line-height: 2rem;
      text-align: center;
      font-size: 1rem;
      font-weight: bold;
      color: #fff;
      background: @red;
      transform: rotate(45deg);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
    }
  }
}
</style>