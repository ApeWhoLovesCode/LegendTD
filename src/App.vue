<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { isMobile } from '@/utils/tools'

import { useSourceStore } from './stores/source';

const source = useSourceStore()

const init = () => {
  source.isMobile = !!isMobile()
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