<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import { ElDrawer, ElMessage, ElMessageBox, ElTooltip } from 'element-plus';
import { useSourceStore } from '@/stores/source';
import enemyObj from "@/dataSource/enemyData"
import TowerCanvas from './towerCanvas.vue';

const source = useSourceStore()

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
  >
    <div class='enemyInfo'>
      <div 
        class="card"
        v-for="enemy in Object.values(enemyObj)"
        :key="enemy.name"
      >
        <div class="left">
          <div class="img">
            <TowerCanvas :enemy-list="[{enemyName: enemy.name, level: 1}]" />
          </div>
          <div class="name"></div>
          <div class="explain"></div>
        </div>
        <div class="right">
          <div class="row"></div>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<style lang='less' scoped>
.enemyInfoPop {
  .card {
    .left {
      .img {
  
      }
      .name {
  
      }
      .explain {
  
      }
    }
    .right {
      .row {

      }
    }
  }
}
</style>