<script setup lang='ts'>
import { reactive } from 'vue';
import { ElAvatar, ElDialog, ElPagination, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { getRankListApi, RankItem } from '@/service/rank';
import { useSourceStore } from '@/stores/source';

const {visible} = defineProps({
  visible: {
    type: Boolean,
    default: false,
    require: true
  }
})
const emit = defineEmits<{
  (event: 'update:visible', v: boolean): void
}>()

const source = useSourceStore()

const state = reactive({
  rankList: [] as RankItem[],
  total: 0
})

const getRankList = async () => {
  try {
    const res = await getRankListApi()
    state.rankList = res
  } catch (error) {
    console.log('error: ', error);
  }
}

</script>

<template>
  <ElDialog 
    :modelValue="visible" 
    title="排行榜"
    :width="source.isMobile ? '100%' : '60%'"
    @open="getRankList"
    @close="emit('update:visible', false)"
  >
    <ElTable 
      :data="state.rankList"
      class="rankListTable"
      stripe
      :style="{width: '100%'}"
    >
      <ElTableColumn type="index"></ElTableColumn>
      <ElTableColumn prop="avatar" label="头像">
        <template #default="scope">
          <ElAvatar :src="scope.row.avatar" :size="30" />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="name" label="用户名"></ElTableColumn>
      <ElTableColumn prop="max" label="抵御波数">
        <template #default="scope">
          {{ scope.row.max.score }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="max" label="所在关卡">
        <template #default="scope">
          <ElTag>{{ scope.row.max.level + 1 }}</ElTag>
        </template>
      </ElTableColumn>
    </ElTable>
    <!-- <div class="paginationWrap">
      <ElPagination layout="prev, pager, next" :total="state.total" />
    </div> -->
  </ElDialog>
</template>

<style lang='less' scoped>
.rankListTable {
  height: 60vh;
}
.paginationWrap {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>