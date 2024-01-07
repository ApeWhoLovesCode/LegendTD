<script setup lang='ts'>
import { ElDrawer, ElTooltip } from 'element-plus';
import { useSourceStore } from '@/stores/source';
import enemyObj, { enemyStaticData, enemyNameListData } from "@/dataSource/enemyData"
import TowerCanvas from './towerCanvas.vue';
import { EnemyName, TowerCanvasEnemy } from '@/type';

const source = useSourceStore()

/** 处理器最大的运行线程数量，不代表web worker就只能运行这几个 */
const MAX_WORKERS = window.navigator.hardwareConcurrency || 4

defineProps({
  visible: {
    type: Boolean,
    default: false,
    require: true
  }
})

const emit = defineEmits<{
  (event: 'update:visible', v: boolean): void;
}>()


const getCanvasEnemyList = (enemyName: EnemyName): TowerCanvasEnemy[] => {
  return enemyStaticData[enemyName].enemyNameList?.map(name => ({
    enemyName: name,
    level: 1
  })) ?? [{enemyName, level: 1}]
}

const onClose = () => {
  emit('update:visible', false)
}

</script>

<template>
  <ElDrawer 
    :model-value="visible"
    class='enemyInfoPop' 
    :class="{'enemyInfoPopMobile': source.isMobile}"
    :with-header="false"
    :size="source.isMobile ? '80vh' : '90vh'"
    direction="btt"
    @close="onClose"
    :style="{ 
      '--cardGridSize': source.isMobile ? '18px' : '16px',
    }"
  >
    <div class='enemyInfo'>
      <div 
        class="card"
        v-for="enemyName in enemyNameListData"
        :key="enemyName"
      >
        <div class="cardArea">
          <div class="img">
            <TowerCanvas 
              :enemy-list="getCanvasEnemyList(enemyName)" 
              :tower-list="enemyStaticData[enemyName].towerList ?? [{towerName: 'jin', x: 4, y: 3}]" 
              :is-pause="!visible"
            />
          </div>
          <div class="content">
            <div class="name">{{ enemyStaticData[enemyName].name }}</div>
            <div class="row">
              <span class="iconfont icon-jinbi1"></span>
              <div class="info">{{ enemyObj[enemyName].reward }}</div>
            </div>
            <div class="row">
              <span class="iconfont icon-aixin"></span>
              <div class="info">{{ enemyObj[enemyName].hp.sum }}</div>
            </div>
            <div class="row">
              <span class="iconfont icon-yundong icon-speed"></span>
              <div class="info">{{ enemyObj[enemyName].speed * 60_00 / 100  }} / s</div>
            </div>
            <div class="row">
              <span class="iconfont icon-icon_xiangguanmiaoshu icon-explain"></span>
              <ElTooltip>
                <template #content>
                  <div style="max-width: 200px">
                    {{enemyStaticData[enemyName].explain}}
                  </div>
                </template>
                <div class="info">{{ enemyStaticData[enemyName].explain }}</div>
              </ElTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<style lang='less'>
@import '@/style.less'; 
.enemyInfoPop {
  .el-drawer__body {
    padding: 0;
    background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
  }
  .enemyInfo {
    @gridSize: var(--cardGridSize);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: calc(2 * @gridSize) calc(2 * @gridSize);
    gap: calc(3 * @gridSize);
    .card {
      width: calc(18 * @gridSize);
      height: calc(10 * @gridSize);
      padding-left: calc(4.5 * @gridSize);
      &Area {
        position: relative;
        width: 100%;
        height: 100%;
        // width: calc(12 * @gridSize);
        // height: calc(10 * @gridSize);
        background-color: #dcf4f9;
        border-radius: 8px;
        padding-left: calc(4.5 * @gridSize);
      }
      .img {
        box-sizing: content-box;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(-50%, -50%);
        display: block;
        width: calc(9 * @gridSize);
        height: calc(7 * @gridSize);
        border: 2px solid #8f8cfa;
        border-radius: 6px;
        overflow: hidden;
      }
      .content {
        height: 100%;
        color: #74727c;
        padding: calc(0.8 * @gridSize);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .name {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
        }
        .row {
          display: flex;
          .iconfont {
            display: inline-block;
            width: 14px;
            height: 14px;
            font-size: 14px;
          }
          .icon {
            &-jinbi1 {
              color: #c8ae1a;
            }
            &-aixin {
              color: #d95a5d;
            }
            &-speed {
              color: #61b0f4;
            }
            &-explain {
              color: #676666;
            }
          }
          .info {
            margin-left: 5px;
            flex: 1;
            font-size: 12px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            -webkit-line-clamp: 3;
            overflow: hidden;
            word-break: break-all;
            user-select: none;
          }
        }
      }
    }
  }
}
</style>