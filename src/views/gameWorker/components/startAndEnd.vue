<script setup lang='ts'>
import { GameBaseData, GameConfigType } from '@/type/game';
import Loading from '@/components/loading.vue'

const {gameConfigState, baseDataState} = defineProps<{
  gameConfigState: GameConfigType
  baseDataState: GameBaseData
}>()

const emit = defineEmits<{
  (event: 'beginGame'): void
  (event: 'reStart'): void
  (event: 'reUploadScore'): void
}>()

</script>

<template>
  <div v-if="gameConfigState.isGameBeginMask" class="game-begin mask">
    <!-- 游戏开始遮罩层 -->
    <div class="info">
      <Loading v-if="!gameConfigState.loadingDone" />
      <div v-else class="begin-wrap">
        <span class="icon-wrap" @click="emit('beginGame')">
          <span class="iconfont" :class="baseDataState.isPause ? 'icon-kaishi1' : 'icon-24gf-pause2'"></span>
        </span>
        <span class="begin-text">开始游戏</span>
      </div>
    </div>
  </div>
  <div v-if="baseDataState.isGameOver" class="gameover-wrap mask">
    <!-- 游戏结束遮罩层 -->
    <div class="info">你成功抵御了{{baseDataState.level}}波僵尸</div>
    <div class="restart-btn" @click="emit('reStart')">重新开始</div>
    <!-- <div class="restart-btn restart-btn-2" @click="emit('reUploadScore')">重新上传成绩</div> -->
  </div>
</template>

<style lang='less' scoped>
@import '@/style.less';
@size: var(--size);
.game-begin {
  .info {
    color: #fff;
    .begin-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .icon-wrap {
        display: inline-block;
        display: flex;
        justify-content: center;
        align-items: center;
        width: calc(@size * 3);
        height: calc(@size * 3);
        border-radius: 50%;
        background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
        cursor: pointer;
        user-select: none;
        &:hover {
          opacity: .95;
          box-shadow: 0 0 16px 4px #3393e7;
        }
        .iconfont {
          color: #fff;
          font-size: calc(@size * 1.6);
          animation: pulse 2s linear infinite;
        }
        @keyframes pulse {
          70% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      }
      .begin-text {
        font-size: 36px;
        color: #fff;
        font-weight: bold;
        margin-top: 16px;
        letter-spacing: 8px;
        margin-left: 8px;
        user-select: none;
      }
    }
  }
}
.gameover-wrap {
  flex-direction: column;
  .info {
    font-size: calc(@size * 1.2);
    font-weight: bold;
    color: #fff;
  }
  .restart-btn {
    margin-top: calc(@size * 0.5);
    background-image: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
    color: #fff;
    border-radius: calc(@size * 0.4);
    font-size: calc(@size * 0.8);
    padding: calc(@size * 0.2) calc(@size * 0.6);
    &:hover {
      cursor: pointer;
      opacity: .9;
    }
    &-2 {
      margin-left: 12px;
      font-size: calc(@size * 0.4);
      padding: calc(@size * 0.1) calc(@size * 0.3);
      border-radius: calc(@size * 0.2);
    }
  }
}
.mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .4);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>