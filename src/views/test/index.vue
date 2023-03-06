<script setup lang='ts'>
import UserBall from '@/components/userBall.vue';
import { updateScoreApi } from '@/service/rank';
import { useUserInfoStore } from '@/stores/userInfo';
import { ElButton, ElInput, ElMessage } from 'element-plus';
import { ref } from 'vue';

const userInfoStore = useUserInfoStore()

const v = ref(0)

const uploadScore = () => {
  updateScoreApi({
    userId: userInfoStore.userInfo?.id ?? '',
    score: v.value,
    level: 4
  }).then(res => {
    ElMessage.success(res.isUpdate ? '新纪录，恭喜您超越了最高分~~' : '还未超越最高分，继续努力吧~~')
  })
}

</script>

<template>
  <div class='test'>
    <ElInput type='number' v-model="v" />
    <ElButton @click="uploadScore">上传得分</ElButton>
    <UserBall />
  </div>
</template>

<style lang='less' scoped>
.test {
  width: 100vw;
  height: 100vh;
  background-color: #aaa;
}
</style>