<template>
  <div class="shadow">
    <div class="shadowCircle shadowCircle1"></div>
    <div class="shadowCircle shadowCircle2"></div>
    <div class="shadowCircle shadowCircle3"></div>
    <div class="shadowCircle shadowCircle4"></div>
    <div class="shadowCircle shadowCircleMask"></div>
  </div>
</template>

<style lang='less' scoped>
@iterations: 16 + `Math.floor(Math.random() * 16)`;
.randomNum(@max, @min: 0, @u: 1) {
  @result: `(@{min} + Math.floor(Math.random() * @{max})) * @{u} + 's'`;
  return: @result;
}
// .randomConicGradient() {
//   @list: (); // Less doesn't support list data type, you might need to use an alternative approach
//   .for-loop(@i) when (@i > 0) {
//     @color: `hsl(${.randomNum(60, 180, 10)}, ${.randomNum(100, 100, 10)}, ${.randomNum(100, 100, 1)})`;
//     @opacity: `.randomNum(100, 9, .01)`;
//     // Add the generated color to @list
//     .for-loop(@i - 1);
//   }
//   .for-loop(@iterations);
//   // Use the generated @list for conic-gradient
//   // Less doesn't support conic-gradient function, you might need to use a CSS fallback or a post-processor like PostCSS
// }
// .randomConicGradient();
.shadow {
  position: relative;
  width: 100%;
  height: 100%;
  margin: auto;
  overflow: hidden;
  font-size: @iterations;
  // background: radial-gradient(#FFC107, #000 65%, #000);
  // mask: radial-gradient(transparent, transparent 55%, #000 56%, #000);
  &:before, &:after {
    content: '';
		position: absolute;
		top: 50%; 
    left: 50%;
		margin: -100vmin; 
		width: 200vmin; 
    height: 200vmin;
		opacity: .5;
		mix-blend-mode: overlay;
    @newNum: .randomNum(100, 25, 0.1);
		animation: rotate @newNum ease-in-out infinite;
    background-color: skyblue;
	}
	&:before { 
    // background: @list; 
  }
	&:after {
		// background: @list;
		animation-duration: .randomNum(100, 25, 0.1);
		animation-direction: reverse;
	}
}
@keyframes rotate { 
  to { 
    transform: rotate(1turn); 
  } 
}

</style>