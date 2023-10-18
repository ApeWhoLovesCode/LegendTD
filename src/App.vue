<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { isMobile } from '@/utils/tools'

import { useSourceStore } from './stores/source';
import { useSettingStore } from './stores/setting';

const source = useSourceStore()
const setting = useSettingStore()

const init = () => {
  source.isMobile = !!isMobile()
  source.ratio = window.devicePixelRatio ?? 1
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