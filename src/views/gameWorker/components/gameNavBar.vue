<template>
  <div class="com-game-navbar">
    <div class="left">
      <div class="left-area">
        <span class="icon-wrap">
          <span class="iconfont icon-jinbi1"></span>
        </span>
        <span class="money">{{money}}</span>
        <span v-if="addMoney.num" class="add-money">{{addMoney.num}}</span>
      </div>
    </div>
    <div class="center">
      <span class="level fff-color">{{level + 1}}</span> 
      <span class="fff-color" style="margin:0 4px;">/</span>
      <span class="level2 fff-color">∞</span> 
      波僵尸
    </div>
    <div class="right">
      <el-tooltip effect="dark" content="开始 / 暂停游戏" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover" @click="emit('gamePause')">
          <span class="iconfont" :class="isPause ? 'icon-kaishi1' : 'icon-24gf-pause2'"></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="播放 / 关闭音乐" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover" @click="emit('playBgAudio')">
          <span class="iconfont" :class="isPlayBgAudio ? 'icon-mn_shengyin_fill' : 'icon-mn_shengyinwu_fill'"></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="上传成绩，重新开始" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover" @click="reStart">
          <span class="iconfont icon-jurassic_restart" ></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="其他工具（待开发）" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover">
          <span class="iconfont icon-xuanxiangka_fuzhi"></span>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSourceStore } from '@/stores/source';
import { ElTooltip, ElMessageBox } from 'element-plus';
import { nextTick, reactive, watch } from 'vue';

const props = defineProps({
  money: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0
  },
  isPause: {
    type: Boolean,
    default: true
  },
  isPlayBgAudio: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits<{
  (event: 'gamePause'): void
  (event: 'playBgAudio'): void
  (event: 'reStart'): void
}>()

const source = useSourceStore()

const addMoney = reactive({
  num: '', 
  timer: undefined as NodeJS.Timeout | undefined, 
  time: 1000
})

// 监听增加的钱
watch(() => props.money, (newVal, oldVal) => {
  addMoney.num = ''
  clearTimeout(addMoney.timer!)
  addMoney.timer = undefined
  nextTick(() => {
    const val = newVal - oldVal
    addMoney.num = (val >= 0 ? '+' : '') + val
    addMoney.timer = setTimeout(() => {
      addMoney.num = ''
    }, addMoney.time);
  })
})

const reStart = () => {
  ElMessageBox.confirm(
    '当前的成绩将作为最终的成绩，您确定要上传得分并重新开始游戏吗？',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    emit('reStart')
  })
}

</script>

<style lang='less' scoped>
@import '@/style.less';
.com-game-navbar {
  @size: var(--size);
  @smallSize: calc(@size * 0.6);
  @fontSize: calc(@size * 0.32);
  position: absolute;
  top: 0;
  left: @smallSize;
  right: @smallSize;
  height: calc(@size * 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #d2f5fa;
  border-bottom-left-radius: @fontSize;
  border-bottom-right-radius: @fontSize;
  padding: 0 20px;
  box-shadow: -7px 4px 14px #1781c2;
  user-select: none;
  .left {
    flex: 1;
    &-area {
      position: relative;
      display: flex;
      align-items: center;
      width: fit-content;
      .icon-wrap {
        width: @smallSize;
        height: @smallSize;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(to left top, #fffc00, #fefdee);
        border-radius: @size;
        border: 1px solid #d8b356;
        .iconfont {
          font-size: @fontSize;
          line-height: @fontSize;
          color: #c87a1a;
        }
      }
      .money {
        margin-left: 10px;
        font-size: @fontSize;
        font-weight: bold;
        color: @theme3;
      }
      .add-money {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(100%, -50%);
        font-size: calc(@fontSize * 0.9);
        color: @theme3;
        font-weight: bold;
        margin-left: 6px;
        opacity: 0;
        animation: add-money 0.6s ease;
      }
      @keyframes add-money {
        0% {
          transform: translate(calc(@size * 0.2 + 100%), -50%);
          opacity: 0;
        }
        50% {
          transform: translate(calc(@size * 0.3 + 100%), -50%);
          opacity: 1;
        }
        100% {
          transform: translate(calc(@size * 0.4 + 100%), -50%);
          opacity: 0;
        }
      }
    }
  }
  .center {
    box-sizing: border-box;
    width: calc(@size * 4);
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: @fontSize;
    line-height: @fontSize;
    font-weight: bold;
    color: @theme3;
    background: #1781c2;
    border-radius: calc(@size * 0.8);
    border: calc(@fontSize * 0.2) solid @theme3;
    box-shadow: -7px 4px 14px #1781c2,
      inset 3px 4px 6px #082a74;
    .fff-color {
      color: #fff;
    }
    .level {
      font-size: @fontSize;
    }
    .level2 {
      font-size: calc(@size * 0.48);
      margin-right: 8px;
    }
  } 
  .right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .icon-wrap {
      width: @smallSize;
      height: @smallSize;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: @size;
      background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
      margin-right: 20px;
      cursor: pointer;
      &:last-child {
        margin-right: 0;
      }
      &:hover {
        opacity: .85;
        box-shadow: 2px 2px 5px 1px #439ce9;
      }
      .iconfont {
        font-size: @fontSize;
        color: #fff;
      }
    }
  }
}
</style>