<script setup lang="ts">
import { onBeforeMount } from 'vue';

import { useSettingStore } from './stores/setting';

const setting = useSettingStore()

const init = () => {
  setting.getFps()
}

onBeforeMount(() => {
  init()
})

</script>

<template>
  <router-view></router-view>
</template>

<style>
</style>