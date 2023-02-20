<script setup lang='ts'>
import { reactive } from 'vue';
import { ElAvatar, ElDialog, ElTable, ElTableColumn } from 'element-plus'
import { getRankListApi, RankItem } from '@/service/rank';

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

const state = reactive<{
  rankList: RankItem[]
}>({rankList: []})

const getRankList = async () => {
  try {
    const res = await getRankListApi('101')
    console.log('res: ', res);
    state.rankList = res
  } catch (error) {
    console.log('error: ', error);
  }
}

</script>

<template>
  <ElDialog 
    v-model="visible" 
    title="排行榜"
    width="60%"
    draggable
    @open="getRankList"
    @close="emit('update:visible', false)"
  >
    <ElTable 
      :data="state.rankList"
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
      <ElTableColumn prop="g101" label="得分"></ElTableColumn>
    </ElTable>
  </ElDialog>
</template>

<style lang='less' scoped>

</style>