<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import ScrollCircle from '@/components/scrollCircle/index.vue'
import ScrollCircleItem from '@/components/scrollCircle/item.vue'

const state = reactive<{list: any[]}>({
  list: []
})

onMounted(() => {
  state.list = new Array(24).fill('Tops').map((a,i) => (
    {_id: 'id' + i, title: a + i}
  ))
})

</script>

<template>
  <div class='page-index'>
    <div class="placeholder">header</div>
    <ScrollCircle :list="state.list" :height="`calc(100vh - 200px)`">
      <ScrollCircleItem 
        v-for="(item, i) in state.list" 
        :key="item._id" 
        :index="i"
      >
        <div class="card">
          <div class="cardTitle">{{ item.title }}</div>
        </div>
      </ScrollCircleItem>
    </ScrollCircle>
    <div class="placeholder">bottom</div>
  </div>
</template>

<style lang='scss'>
.page-index {
  position: relative;
  .placeholder {
    height: 100px;
    background: green;
  }
  .card {
    width: 135px;
    height: 174px;
    border: 3px solid #000;
    border-radius: 12px;
  }
}
</style>