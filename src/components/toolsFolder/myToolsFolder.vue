<script setup lang='ts'>
import RankList from '@/components/rankList.vue';
import SelectTowerPop from '@/components/selectTowerPop.vue';
import ToolsFolder, { ToolsFolderItem } from './index.vue';
import { ref } from 'vue';

import GithubIcon from '@/assets/img/github.svg';
import BlogIcon from '@/assets/img/blog.svg';
import ComponentIcon from '@/assets/img/component.svg';
import MyGameIcon from '@/assets/img/myGame.png';
import RankListIcon from '@/assets/img/rankList.svg';
import TowerLogoIcon from '@/assets/img/towerLogo.svg';
import JuejinIcon from '@/assets/img/juejin.svg';
import LTDIcon from '@/assets/img/LTDIcon.png';

const rankListVisible = ref(false)
const selectTowerVisible = ref(false)

const onClickItem = (item: ToolsFolderItem) => {
  if(item.title === '排行榜') {
    rankListVisible.value = true
  } else if(item.title === '塔防选择') {
    selectTowerVisible.value = true
  }
}

</script>

<template>
  <ToolsFolder
    :list="[
      {icon: GithubIcon, title: 'GitHub', url: 'https://github.com/ApeWhoLovesCode/LegendTD'},
      {icon: TowerLogoIcon, title: '塔防选择'},
      {icon: RankListIcon, title: '排行榜'},
      {icon: BlogIcon, title: '我的博客', url: 'https://codeape.site/'},
      {icon: JuejinIcon, title: '掘金文档', url: 'https://juejin.cn/post/7214517573584601144'},
      {icon: ComponentIcon, title: '个人组件库', url: 'http://lhhui.codeape.site/'},
      {icon: MyGameIcon, title: '小游戏平台', url: 'http://mygame.codeape.site/'},
      {icon: LTDIcon, title: 'LegendTD', url: 'http://game.codeape.site/'},
    ]" 
    @on-click-item="onClickItem"
  />
  <RankList v-model:visible="rankListVisible" />
  <SelectTowerPop v-model:visible="selectTowerVisible" />
</template>

<style lang='less' scoped>

</style>