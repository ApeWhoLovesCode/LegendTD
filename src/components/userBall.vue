<script setup lang='ts'>
import { computed, ref } from 'vue';
import FloatingBall from '@/components/floating-ball';
import { ElDropdown, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus';
import Login from '@/components/login.vue';
import { useUserInfoStore } from '@/stores/userInfo';
import UserIcon from '@/assets/img/user.png'
import RankList from './rankList.vue';
import UserInfo from './userInfo.vue'

const status = ref<-1 | 0 | 1>(window.innerHeight > window.innerWidth ? -1 : 1)
const userInfoVisible = ref(false)
const rankListVisible = ref(false)
const loginVisible = ref(false)
const userInfoStore = useUserInfoStore()

const isVertical = computed(() => window.innerHeight > window.innerWidth)

const ballItemStyle = (i: number) => {
  const x = -100 * Math.cos((5 + i * 35) * Math.PI / 180) * status.value
  const y = 100 * Math.sin((5 + i * 35) * Math.PI / 180) * (status.value ? 1 : 0)
  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    opacity: (status.value ? 1 : 0)
  }
}

const onMagnetic = (isLeft: boolean) => {
  status.value = isLeft ? -1 : 1
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

</script>

<template>
  <FloatingBall
    magnetic="x"
    :style="{
      '--initial-position-top': '50px',
      [isVertical ? '--initial-position-left' : '--initial-position-right']: '50px',
      '--z-index': '1000',
    }"
    @on-offset-change="status = 0"
    @on-magnetic="onMagnetic"
  >
    <div class="ball-wrap">
      <img class="avatar" :src="userInfoStore.userInfo?.avatar ?? UserIcon" alt="">
      <div class="ball-item" :style="ballItemStyle(0)">
        <div class="ball-item-content" :class="{'ball-item-disable': !userInfoStore.userInfo}" @click="openUser">个人信息</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(1)">
        <div class="ball-item-content" @click="rankListVisible = true">排行榜</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(2)">
        <ElDropdown size="small">
          <div class="ball-item-content">设置</div>
          <template #dropdown>
            <ElDropdownItem @click="login">{{ userInfoStore.userInfo ? '退出' : '' }}登录</ElDropdownItem>
          </template>
        </ElDropdown>
      </div>
    </div>
  </FloatingBall>
  <UserInfo v-if="userInfoStore.userInfo" v-model:visible="userInfoVisible"/>
  <RankList 
    v-model:visible="rankListVisible"
  />
  <Login 
    v-model:visible="loginVisible"
  />

</template>

<style lang='less'>
@import '@/style.less';
.ball-wrap {
  position: relative;
  width: 80px;
  height: 80px;
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
    &-content {
      box-sizing: content-box;
      width: 28px;
      height: 28px;
      padding: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      line-height: 14px;
      font-size: 12px;
      font-weight: bold;
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
      &:hover {
        font-size: 14px;
        background-color: @purple1;
      }
    }
  }
}
</style>