<script setup lang='ts'>
import { useSourceStore } from '@/stores/source';
import { GameBaseData, GameConfigType, GameMasterSkill } from '@/type/game';
import { computed } from 'vue';
import otherImgData from '@/dataSource/otherImgData';

const props = defineProps<{
  baseDataState: GameBaseData
  gameConfigState: GameConfigType
  gameSkillState: GameMasterSkill
}>()
const emit = defineEmits<{
  (event: 'proMoneyClick'): void
}>()

const source = useSourceStore()

/** 终点位置 */
const terminalStyle = computed(() => {
  const size = transRatio(props.gameConfigState.size)
  if(props.baseDataState.terminal) {
    const {x, y} = props.baseDataState.terminal
    return {left: transRatio(x) + size / 2 + 'px', top: transRatio(y) - size / 2 + 'px'}
  }
})

/** 清晰度转化 */
function transRatio(v: number) {
  return v / source.ratio
}

</script>

<template>
  <div v-if="baseDataState.terminal" class="terminal" :style="terminalStyle">
    <div class="hp" :class="{'hp-mobile': source.isMobile}">{{baseDataState.hp}}</div>
    <img class="terminal-icon" :src="otherImgData.terminal" alt="">
    <img 
      v-show="gameSkillState.proMoney.isShow" 
      class="money-icon" 
      :src="otherImgData.sunGif" 
      alt=""
      @click="emit('proMoneyClick')"
    >
  </div>
</template>

<style lang='less' scoped>
.terminal {
  @size: var(--size);
  position: absolute;
  user-select: none;
  .hp {
    position: absolute;
    top: calc(@size * 0.15);
    left: calc(@size * 0.35);
    color: #f24410;
    font-size: calc(@size * 0.3);
    font-weight: bold;
    text-align: center;
    &-mobile {
      font-size: calc(@size * 0.4);
      top: calc(@size * 0.1);
      left: calc(@size * 0.25);
    }
  }
  .terminal-icon {
    display: block;
    width: calc(@size * 1.8);
    user-select: none;
    -webkit-user-drag: none;
  }
  .money-icon {
    position: absolute;
    top: 0;
    right: 0;
    width: calc(@size * 1.2);
    height: calc(@size * 1.2);
    cursor: pointer;
    user-select: none;
    -webkit-user-drag: none;
  }
}
</style>