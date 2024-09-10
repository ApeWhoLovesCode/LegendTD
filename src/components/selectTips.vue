<script setup lang="ts">
import { useSourceStore } from "@/stores/source";
import { ref } from "vue";

const emit = defineEmits<{
  (event: "clickMask"): void;
  (event: "clickContent"): boolean;
}>();

const source = useSourceStore();

const isShow = ref(true);
const isAnimationEnd = ref(false);
const isContentShow = ref(false);

const clickMaskFn = () => {
  isShow.value = false;
  emit("clickMask");
};

const clickContentFn = (e: Event) => {
  e.stopPropagation();
  const _isShow = emit("clickContent");
  isShow.value = !_isShow;
};

const onAnimationEnd = () => {
  isAnimationEnd.value = true;
  setTimeout(() => {
    isContentShow.value = true;
  }, 10);
};
</script>

<template>
  <div
    v-if="isShow"
    class="selectTips"
    @click="clickMaskFn"
  >
    <template v-if="isAnimationEnd">
      <div
        class="mask content"
        :class="{ contentShow: isContentShow }"
        @click="clickContentFn"
      ></div>
      <div
        class="tips"
        :class="{ tipsMobile: source.isMobile }"
      >
        <div class="info">点击关卡试玩，享受游戏吧 ~</div>
        <div class="info2">点击其他区域关闭引导层</div>
      </div>
    </template>
    <template v-else>
      <div
        class="mask animation animationLeft"
        @animationend="onAnimationEnd"
      >
        <div class="boxShadowWrap">
          <div class="boxShadowArea"></div>
        </div>
      </div>
      <div class="mask animation animationRight">
        <div class="boxShadowWrap">
          <div class="boxShadowArea"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
.selectTips {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1001;
  @contentSize: 30rem;
  @shadow1: rgba(0, 0, 0, 0.5);
  @shadow2: rgba(0, 0, 0, 0.75);
  @shadow3: rgba(0, 0, 0, 0.82);
  .mask {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: @contentSize;
    height: @contentSize;
  }
  .content {
    border-radius: 50%;
    transition: box-shadow 0.8s;
    box-shadow: 0 0 0 100vmax @shadow1, inset 2px -5px 1rem rgba(0, 0, 0, 0.6);
    &Show {
      box-shadow: 0 0 0 100vmax @shadow2, inset 2px -5px 1rem rgba(0, 0, 0, 0.6);
    }
    &:hover {
      cursor: pointer;
      box-shadow: 0 0 0 100vmax @shadow3, inset 2px -5px 3rem rgba(0, 0, 0, 0.9);
    }
  }
  .tips {
    position: absolute;
    top: calc(50% + @contentSize / 2);
    left: calc(50% + @contentSize / 2);
    box-sizing: border-box;
    padding: 10px;
    border-radius: 4px;
    color: #eee;
    font-size: 1rem;
    cursor: pointer;
    animation: tipsShow 0.5s ease-in;
    &Mobile {
      left: calc(50% - @contentSize / 4);
    }
    .info2 {
      margin-top: 10px;
      font-size: 0.9rem;
      color: #ccc;
    }
  }
  .animation {
    animation-duration: 0.8s;
    animation-timing-function: ease-out;
    .boxShadow {
      &Wrap {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      &Area {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        box-shadow: calc(-@contentSize * 1.45) 0 0 @contentSize @shadow1;
      }
    }
    &Left {
      box-shadow: calc(-100vmax - @contentSize / 2) 0 0 100vmax @shadow1;
      animation-name: maskLeft;
    }
    &Right {
      box-shadow: calc(100vmax + @contentSize / 2) 0 0 100vmax @shadow1;
      animation-name: maskRight;
      .boxShadowArea {
        box-shadow: calc(@contentSize * 1.45) 0 0 @contentSize @shadow1;
      }
    }
  }
}
@keyframes tipsShow {
  0% {
    transform: translateX(50vw);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes maskLeft {
  0% {
    transform: translate(calc(-100vmax - 50%), -50%);
  }
  100% {
    transform: translate(-50%, -50%);
  }
}
@keyframes maskRight {
  0% {
    transform: translate(calc(100vmax - 50%), -50%);
  }
  100% {
    transform: translate(-50%, -50%);
  }
}
</style>
