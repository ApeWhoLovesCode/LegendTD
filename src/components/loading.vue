<template>
  <div class="loading-wrap">
    <div class="loading-item"></div>
    <div class="loading-item"></div>
    <div class="loading-item"></div>
  </div>
</template>

<style lang='less' scoped>
// 加载中
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  .loading-item {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin: 0.5em;
    background-color: currentColor;
    border-radius: 100%;
    animation: point-animation 1s ease infinite;
    &:nth-child(1) {
      animation-delay: -200ms;
    }
    &:nth-child(2) {
      animation-delay: -100ms;
    }
    &:nth-child(3) {
      animation-delay: 0;
    }
  }
  @keyframes point-animation {
    0%,
    60%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    30% {
      transform: scale(0.01);
      opacity: 0.1;
    }
  }
}
</style>