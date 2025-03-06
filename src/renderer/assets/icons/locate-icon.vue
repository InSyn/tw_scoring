<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="`${1.2 * width}px`" :height="`${1.2 * height}px`" viewBox="0 0 24 24">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="M2 12h3m14 0h3M12 2v3m0 14v3"></path>
      <circle cx="12" cy="12" r="7"></circle>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'locate-icon',
  props: {
    width: {
      type: Number,
      default: 16,
    },
    height: {
      type: Number,
      default: 16,
    },
  },
};
</script>
