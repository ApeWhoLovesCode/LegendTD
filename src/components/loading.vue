<template>
  <div class="loading-wrap">
    <div class="loading">
      <div class="loading-item"></div>
      <div class="loading-item"></div>
      <div class="loading-item"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
}
</script>
<style lang='less' scoped>
@import '@/style.less';
// 加载中
.loading-wrap {
  display: flex;
  justify-content: center;
  .loading, .loading > .loading-item {
    position: relative;
    box-sizing: border-box;
  }
  .loading {
    color: #ffffff;
    font-size: 0;
  }
  .loading > .loading-item {
    display: inline-block;
    float: none;
    background-color: currentColor;
    border: 0 solid currentColor;
  }
  .loading > .loading-item:nth-child(1) {
    animation-delay: -200ms;
  }
  .loading > .loading-item:nth-child(2) {
    animation-delay: -100ms;
  }
  .loading > .loading-item:nth-child(3) {
    animation-delay: 0ms;
  }
  .loading > .loading-item {
    width: 30px;
    height: 30px;
    margin: 15px;
    border-radius: 100%;
    animation: ball-pulse 1s ease infinite;
  }
  @keyframes ball-pulse {
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