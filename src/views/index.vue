<script setup lang='ts'>
import { onMounted, reactive } from 'vue';

const icon = new URL('../assets/img/add.png', import.meta.url).href

</script>

<template>
  <div class='page-index'>
    <img :src="icon" alt="">
  </div>
</template>

<style lang='scss'>
.page-index {

}
</style>