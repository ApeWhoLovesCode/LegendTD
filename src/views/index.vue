<script setup lang='ts'>
import { computed, onMounted, reactive, ref } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'
import levelData, {levelNullItem, LevelDataItem} from '@/dataSource/levelData';
import CoverCanvas from '@/components/coverCanvas.vue';
import { loadImage } from '@/utils/handleImg';
import floorData from '@/dataSource/floorData';
import { useSourceStore } from '@/stores/source';
import FloatingBall from '@/components/floating-ball';
import { useRouter } from 'vue-router';
import mapData from '@/dataSource/mapData';

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
/** 禁止点击 */
const isLock = ref(false)

const isVertical = computed(() => window.innerHeight > window.innerWidth)

const init = () => {
  const preIndex = (state.pageNum - 1) * state.pageSize
  state.items = levelData.slice(preIndex, preIndex + state.pageSize)
  loadImage(floorData[0]).then(res => {
    source.imgOnloadObj.floor = res
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
  if(!isLock.value && mapData[i]) {
    router.push(`/game/${i + 1}`)
  }
}

</script>

<template>
  <div class='page-index'>
    <FloatingBall
      magnetic="x"
      :style="{
        '--initial-position-top': '50px',
        [isVertical ? '--initial-position-left' : '--initial-position-right']: '50px',
        '--z-index': '1000',
      }"
    >
      <div class="ball">头像</div>
    </FloatingBall>
    <ScrollCircle 
      :list="levelData" 
      @on-page-change="onPageChange"
      @on-touch-start="isLock = false"
      @on-touch-move="isLock = true"
      >
      <ScrollCircleItem 
        v-for="(item, i) in state.items" 
        :key="(state.pageNum - 1) * state.pageSize + i" 
        :index="i"
      >
        <div class="card" @click="onCardClick(i)">
          <div class="card-bg">
            <CoverCanvas :index="(state.pageNum - 1) * state.pageSize + i" />
            <div v-if="!mapData[i]" class="card-disable iconfont icon-disablecase"></div>
          </div>
          <div class="card-level">{{ (state.pageNum - 1) * state.pageSize + i + 1 }}</div>
        </div>
      </ScrollCircleItem>
    </ScrollCircle>
  </div>
</template>

<style lang='less' scoped>
.page-index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: radial-gradient(circle 800px at center, #bcf1f3 0%, #95e0f3 47%, #68baf5 100%);
  .ball {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    color: #fff;
    font-size: 16px;
    background-color: skyblue;
    border-radius: 50%;
  }
  .card {
    position: relative;
    width: 24rem;
    height: 18rem;
    border: 5px solid #fff;
    border-radius: 12px;
    overflow: hidden;
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
    }
    &-disable {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      text-align: center;
      line-height: 18rem;
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
      background: #f74764;
      transform: rotate(45deg);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
    }
  }
}
</style>