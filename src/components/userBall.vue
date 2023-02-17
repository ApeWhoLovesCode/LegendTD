<script setup lang='ts'>
import { computed, ref } from 'vue';
import FloatingBall from '@/components/floating-ball';
import { ElDialog, ElDropdown, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus';

const status = ref<-1 | 0 | 1>(1)
const isRankDialog = ref(false)

const isVertical = computed(() => window.innerHeight > window.innerWidth)

const ballItemStyle = (i: number) => {
  const x = -100 * Math.cos((10 + i * 30) * Math.PI / 180) * status.value
  const y = 100 * Math.sin((10 + i * 30) * Math.PI / 180) * (status.value ? 1 : 0)
  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    opacity: (status.value ? 1 : 0)
  }
}

const onMagnetic = (isLeft: boolean) => {
  status.value = isLeft ? -1 : 1
}

const loginOut = () => {
  ElMessageBox.confirm(
    '您确定要退出登录吗？',
    '退出登录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage('退出登录')
  })
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
      <img class="avatar" src="https://cdn.lightwork.com.cn/img/20220921141442-h4AHAn.png" alt="">
      <div class="ball-item" :style="ballItemStyle(0)">
        <div class="ball-item-content">个人信息</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(1)">
        <div class="ball-item-content" @click="isRankDialog = true">排行榜</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(2)">
        <ElDropdown size="small">
          <div class="ball-item-content">设置</div>
          <template #dropdown>
            <ElDropdownItem @click="loginOut">退出登录</ElDropdownItem>
          </template>
        </ElDropdown>
      </div>
    </div>
  </FloatingBall>
  <ElDialog v-model="isRankDialog" title="排行榜">
    123
  </ElDialog>
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
    .ball-item-content {
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
  }
}
</style>