<script>
export default {
  name: 'loader-icon',
  props: {
    height: {
      type: Number,
      default: 16,
    },
  },
  methods: {
    dotStyle(idx) {
      return {
        height: `${Math.floor(!isNaN(this.height) ? Math.floor(Number(this.height) / 1.5) : 8)}px`,
        width: `${Math.floor(!isNaN(this.height) ? Math.floor(Number(this.height) / 1.5) : 8)}px`,
        backgroundColor: `rgb(${236 - idx * 8}, ${236 - idx * 8}, 236)`,
        transform: `scale(${1 - idx * 0.2}) translateY(50%)`,
      };
    },
  },
};
</script>

<template>
  <div class="loaderIcon__wrapper">
    <div v-for="idx in 3" class="loaderDot" :data-dot-idx="idx" :style="dotStyle(idx)"></div>
  </div>
</template>

<style scoped>
.loaderIcon__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  & > * {
    flex-shrink: 0;
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
}

.loaderDot {
  position: absolute;
  top: 50%;
  border-radius: 50%;
  animation: loaderDot 0.6s infinite ease-in-out alternate;
}
.loaderDot[data-dot-idx='1'] {
  left: 36%;
  animation-delay: 0.2s;
}
.loaderDot[data-dot-idx='2'] {
  left: 50%;
  animation-delay: 0.4s;
}
.loaderDot[data-dot-idx='3'] {
  left: 64%;
  animation-delay: 0.6s;
}

@keyframes loaderDot {
  0% {
    transform: scale(0.6);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.6);
  }
}
</style>
