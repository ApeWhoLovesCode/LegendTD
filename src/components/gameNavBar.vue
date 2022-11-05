<template>
  <div class="com-game-navbar">
    <div class="left">
      <span class="icon-wrap">
        <span class="iconfont icon-jinbi1"></span>
      </span>
      <span class="money">{{money}}</span>
      <span v-if="addMoney.num" class="add-money">{{addMoney.num}}</span>
    </div>
    <div class="center">
      <span class="level fff-color">{{level + 1}}</span> 
      <span class="fff-color" style="margin:0 4px;">/</span>
      <span class="level2 fff-color">∞</span> 
      波僵尸
    </div>
    <div class="right">
      <el-tooltip effect="dark" content="开始 / 暂停游戏" placement="bottom">
        <span class="icon-wrap icon-hover" @click="$emit('gamePause')">
          <span class="iconfont" :class="isPause ? 'icon-kaishi1' : 'icon-24gf-pause2'"></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="播放 / 关闭音乐" placement="bottom">
        <span class="icon-wrap icon-hover" @click="$emit('playBgAudio')">
          <span class="iconfont" :class="isPlayBgAudio ? 'icon-mn_shengyin_fill' : 'icon-mn_shengyinwu_fill'"></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="其他工具（待开发）" placement="bottom">
        <span class="icon-wrap icon-hover">
          <span class="iconfont icon-xuanxiangka_fuzhi"></span>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'game-navbar',
  props: {
    money: {
      type: Number,
      default: 0,
    },
    addMoney: {
      type: Object,
      default: () => {}
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
  }
}
</script>

<style lang="scss" scoped>
@import '@/style.scss';
.com-game-navbar {
  $smallSize: calc($size * 0.6);
  $fontSize: calc($size * 0.32);
  position: absolute;
  top: 0;
  left: $smallSize;
  right: $smallSize;
  height: calc($size * 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #d2f5fa;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 0 20px;
  box-shadow: -7px 4px 14px #1781c2;
  user-select: none;
  .left {
    position: relative;
    .icon-wrap {
      display: inline-block;
      width: $smallSize;
      height: $smallSize;
      line-height: $smallSize;
      text-align: center;
      background: linear-gradient(to left top, #fffc00, #fefdee);
      border-radius: $size;
      border: 1px solid #d8b356;
      .iconfont {
        font-size: $fontSize;
        color: #c87a1a;
      }
    }
    .money {
      margin-left: 10px;
      font-size: $fontSize;
      font-weight: bold;
      color: $fontSize;
    }
    .add-money {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      font-size: calc($fontSize * 0.9);
      color: $fontSize;
      font-weight: bold;
      margin-left: 6px;
      opacity: 0;
      animation: add-money 0.6s ease;
    }
    @keyframes add-money {
      0% {
        right: calc($size * -0.6);
        opacity: 0;
      }
      50% {
        right: calc($size * -0.7);
        opacity: 1;
      }
      100% {
        right: calc($size * -0.8);
        opacity: 0;
      }
    }
  }
  .center {
    box-sizing: border-box;
    display: inline-block;
    width: calc($size * 4);
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: $fontSize;
    font-weight: bold;
    color: $fontSize;
    background: #1781c2;
    border-radius: calc($size * 0.8);
    border: 4px solid $fontSize;
    box-shadow: -7px 4px 14px #1781c2,
      inset 3px 4px 6px #082a74;
    .fff-color {
      color: #fff;
    }
    .level {
      font-size: $fontSize;
    }
    .level2 {
      font-size: calc($size * 0.48);
      line-height: 24px;
      margin-right: 8px;
    }
  } 
  .right {
    .icon-wrap {
      display: inline-block;
      width: $smallSize;
      height: $smallSize;
      line-height: $smallSize;
      text-align: center;
      border-radius: $size;
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
        font-size: $fontSize;
        color: #fff;
      }
    }
  }
}
</style>