<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import FloatingBall from '@/components/floatingBall';
import { ElDropdown, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus';
import Login from '@/components/login.vue';
import { useUserInfoStore } from '@/stores/userInfo';
import RankList from './rankList.vue';
import UserInfo from './userInfo.vue'
import SelectLevelPop from './selectLevelPop.vue'
import { useSourceStore } from '@/stores/source';
import SelectTowerPop from './selectTowerPop.vue';
import Circle from './circle';
import { requireCDN } from '@/utils/handleImg';

const props = withDefaults(defineProps<{itemsNum?: number}>(), {
  itemsNum: 3
})
const emit = defineEmits<{
  (event: 'switchMapLevel', index: number): void;
  (event: 'reStart'): void;
}>()

const source = useSourceStore()
const userInfoStore = useUserInfoStore()

const status = ref<-1 | 0 | 1>(window.innerHeight > window.innerWidth ? -1 : 1)
const userInfoVisible = ref(false)
const rankListVisible = ref(false)
const loginVisible = ref(false)
const selectLevelVisible = ref(false)
const selectTowerVisible = ref(false)
const isCircleProgress = ref(source.progress < 100)
const ballTimer = ref<NodeJS.Timeout>()

const floatingBallStyle = computed(() => {
  let distance = source.isMobile ? '1rem' : '50px'
  return {
    '--initial-position-top': distance,
    [source.isMobile ? '--initial-position-left' : '--initial-position-right']: distance,
    '--z-index': '1000',
  }
})

const ballItemStyle = (i: number) => {
  const initDeg = source.isMobile ? -40 : -60
  const endDeg = source.isMobile ? 100 : 80
  const changeDeg = (-initDeg + endDeg) / (props.itemsNum)
  const r = 28 * props.itemsNum * (source.isMobile ? 0.7 : 1)
  const x = -r * Math.cos((initDeg + (i + 1) * changeDeg) * Math.PI / 180) * status.value
  const y = r * Math.sin((initDeg + (i + 1) * changeDeg) * Math.PI / 180) * (status.value ? 1 : 0)
  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    opacity: (status.value ? 1 : 0)
  }
}

const onMagnetic = (isLeft: boolean) => {
  status.value = isLeft ? -1 : 1
  onBallSleep()
}

const login = () => {
  if(!userInfoStore.userInfo) {
    loginVisible.value = true
  } else {
    ElMessageBox.confirm(
      '您确定要退出登录吗？',
      '退出登录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await userInfoStore.logout()
      ElMessage.info('登录已退出')
    })
  }
}

const openUser = () => {
  if(userInfoStore.userInfo) {
    userInfoVisible.value = true
  } else {
    ElMessage.info('请先登录')
  }
}

const progressChange = (v: number) => {
  if(v >= 100) {
    // ElMessage.success('资源已加载完毕')
    setTimeout(() => {
      isCircleProgress.value = false
    }, 400);
  }
}

/** 监听球的5s后睡眠 */
const onBallSleep = () => {
  clearBallSleep()
  ballTimer.value = setTimeout(() => {
    status.value = 0
  }, 3000);
}

const clearBallSleep = () => {
  if(ballTimer.value) {
    clearTimeout(ballTimer.value)
    ballTimer.value = undefined
  }
}

onMounted(onBallSleep)

onBeforeUnmount(clearBallSleep)

</script>

<template>
  <FloatingBall
    magnetic="x"
    :style="floatingBallStyle"
    @on-offset-change="status = 0"
    @on-magnetic="onMagnetic"
  >
    <div 
      class="ball-wrap" 
      :class="{'ball-mobile': source.isMobile}" 
      @mouseenter="clearBallSleep"
      @mouseleave="onBallSleep"
    >
      <img class="avatar" :src="userInfoStore.userInfo?.avatar ?? requireCDN('user.png')" alt="">
      <div class="ball-item" :style="ballItemStyle(0)">
        <div class="ball-item-content" @click="selectTowerVisible = true">塔防选择</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(1)">
        <div class="ball-item-content" @click="rankListVisible = true">排行榜</div>
      </div>
      <div v-if="props.itemsNum === 4" class="ball-item" :style="ballItemStyle(2)">
        <div class="ball-item-content" @click="selectLevelVisible = true">选关</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(props.itemsNum - 1)">
        <ElDropdown size="small">
          <div 
            class="ball-item-content" 
            @click="() => {
              if(!userInfoStore.userInfo) {
                login()
              }
            }"
          >{{ !userInfoStore.userInfo ? '登录' : '设置' }}</div>
          <template #dropdown>
            <ElDropdownItem v-if="userInfoStore.userInfo" @click="openUser">个人信息</ElDropdownItem>
            <ElDropdownItem @click="login">{{ userInfoStore.userInfo ? '退出' : '' }}登录</ElDropdownItem>
            <!-- <ElDropdownItem v-if="userInfoStore.userInfo" @click="login">退出登录</ElDropdownItem> -->
          </template>
        </ElDropdown>
      </div>
      <Circle 
        v-if="isCircleProgress"
        class="circle" 
        :value="Math.ceil(source.progress)" 
        :stroke-width="source.isMobile ? 4 : 6"
        :speed="100"
        :size="source.isMobile ? 62 : 90" 
        layer-color="rgba(255,255,255,0.4)" 
        @on-change="progressChange"
      />
    </div>
  </FloatingBall>
  <UserInfo v-if="userInfoStore.userInfo" v-model:visible="userInfoVisible" />
  <RankList v-model:visible="rankListVisible" />
  <Login v-model:visible="loginVisible"/>
  <SelectTowerPop v-model:visible="selectTowerVisible" @re-start="emit('reStart')" />
  <SelectLevelPop 
    v-if="props.itemsNum === 4" 
    v-model:visible="selectLevelVisible"
    @switch-map-level="i => emit('switchMapLevel', i)"
  />

</template>

<style lang='less'>
@import '@/style.less';
.ball-wrap {
  position: relative;
  width: 78px;
  height: 78px;
  filter: drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.25));
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    user-select: none;
    -webkit-user-drag: none;
  }
  .ball-item {
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    border: 2px solid #fff;
    overflow: hidden;
    top: 50%;
    left: 50%;
    transition: transform ease 0.8s, opacity ease 0.6s;
    font-size: 14px;
    &-content {
      box-sizing: content-box;
      width: 2em;
      height: 2em;
      padding: 0.4em;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      line-height: 14px;
      font-weight: bold;
      font-size: 14px;
      color: #fff;
      background-color: @purple1;
      cursor: pointer;
      transition: all 0.4s;
      &:hover {
        font-size: 14px;
        background-color: @purple2;
      }
    }
    &-disable {
      opacity: 0.7;
    }
  }
  .circle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }
}
.ball-mobile {
  width: 54px;
  height: 54px;
  .ball-item {
    font-size: 12px;
    &-content {
      font-size: 12px;
    }
  }
}
</style>@/components/floatingBall