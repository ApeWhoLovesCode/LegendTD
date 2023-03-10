<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import FloatingBall from '@/components/floating-ball';
import { ElDropdown, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus';
import Login from '@/components/login.vue';
import { useUserInfoStore } from '@/stores/userInfo';
import UserIcon from '@/assets/img/user.png'
import RankList from './rankList.vue';
import UserInfo from './userInfo.vue'
import SelectLevelPop from './selectLevelPop.vue'
import { useSourceStore } from '@/stores/source';
import SelectTowerPop from './selectTowerPop.vue';
import Circle from './circle';

const props = withDefaults(defineProps<{itemsNum?: number}>(), {
  itemsNum: 3
})
const emit = defineEmits<{
  (event: 'switchMapLevel', index: number): void;
  (event: 'reStart'): void;
}>()

const status = ref<-1 | 0 | 1>(window.innerHeight > window.innerWidth ? -1 : 1)
const userInfoVisible = ref(false)
const rankListVisible = ref(false)
const loginVisible = ref(false)
const selectLevelVisible = ref(false)
const selectTowerVisible = ref(false)
const isCircleProgress = ref(true)
const ballTimer = ref<NodeJS.Timer>()

const source = useSourceStore()
const userInfoStore = useUserInfoStore()

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
      '??????????????????????????????',
      '????????????',
      {
        confirmButtonText: '??????',
        cancelButtonText: '??????',
        type: 'warning'
      }
    ).then(async () => {
      await userInfoStore.logout()
      ElMessage.info('???????????????')
    })
  }
}

const openUser = () => {
  if(userInfoStore.userInfo) {
    userInfoVisible.value = true
  } else {
    ElMessage.info('????????????')
  }
}

const progressChange = (v: number) => {
  if(v >= 100) {
    // ElMessage.success('?????????????????????')
    setTimeout(() => {
      isCircleProgress.value = false
    }, 400);
  }
}

/** ????????????3s????????? */
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

onMounted(() => onBallSleep())

onBeforeUnmount(() => clearBallSleep())

</script>

<template>
  <FloatingBall
    magnetic="x"
    :style="floatingBallStyle"
    @on-offset-change="status = 0"
    @on-magnetic="onMagnetic"
  >
    <div class="ball-wrap" :class="{'ball-mobile': source.isMobile}">
      <img class="avatar" :src="userInfoStore.userInfo?.avatar ?? UserIcon" alt="">
      <div class="ball-item" :style="ballItemStyle(0)">
        <div class="ball-item-content" @click="selectTowerVisible = true">????????????</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(1)">
        <div class="ball-item-content" @click="rankListVisible = true">?????????</div>
      </div>
      <div v-if="props.itemsNum === 4" class="ball-item" :style="ballItemStyle(2)">
        <div class="ball-item-content" @click="selectLevelVisible = true">??????</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(props.itemsNum - 1)">
        <ElDropdown size="small">
          <div class="ball-item-content">??????</div>
          <template #dropdown>
            <ElDropdownItem v-if="userInfoStore.userInfo" @click="openUser">????????????</ElDropdownItem>
            <ElDropdownItem @click="login">{{ userInfoStore.userInfo ? '??????' : '' }}??????</ElDropdownItem>
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
  <UserInfo v-if="userInfoStore.userInfo" :modelValue:visible="userInfoVisible"/>
  <RankList :modelValue:visible="rankListVisible"/>
  <Login :modelValue:visible="loginVisible"/>
  <SelectTowerPop :modelValue:visible="selectTowerVisible" @re-start="emit('reStart')" />
  <SelectLevelPop 
    v-if="props.itemsNum === 4" 
    :modelValue:visible="selectLevelVisible"
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
</style>