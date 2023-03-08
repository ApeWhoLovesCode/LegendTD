<script setup lang='ts'>
import UserBall from '@/components/userBall.vue';
import floorData from '@/dataSource/floorData';
import { useSourceStore } from '@/stores/source';
import { useUserInfoStore } from '@/stores/userInfo';
import { loadImage } from '@/utils/handleImg';
import { onMounted, ref } from 'vue';

const userInfoStore = useUserInfoStore()
const source = useSourceStore()

const isOnload = ref(false)


onMounted(() => {
  if(!source.imgOnloadObj.floor) {
    loadImage(floorData[0]).then(res => {
      source.imgOnloadObj.floor = res
      isOnload.value = true
    })
  }
})

</script>

<template>
  <div class='test'>
    <UserBall v-if="isOnload" />
  </div>
</template>

<style lang='less' scoped>
.test {
  width: 100vw;
  height: 100vh;
  background-color: #aaa;
}
</style>