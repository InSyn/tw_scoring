<script>
export default {
  name: 'collapsible-panel',
  props: {
    defaultCollapseState: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      collapsed: this.defaultCollapseState,
      contentHeight: 0,
    };
  },
  methods: {
    toggleCollapse() {
      if (!this.collapsed) {
        this.contentHeight = this.$refs.content.scrollHeight;
      }
      this.collapsed = !this.collapsed;
    },
  },
  mounted() {
    if (!this.collapsed) {
      this.contentHeight = this.$refs.content.scrollHeight;
    }
  },
};
</script>

<template>
  <div class="collapsible-panel section-container">
    <div class="panel-header">
      <slot name="header"></slot>
    </div>
    <div
      class="panel-content"
      ref="content"
      :class="{ collapsed: collapsed }"
      :style="{
        height: collapsed ? '0' : 'auto',
      }"
    >
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.collapsible-panel {
  --anim-dur: 128ms;
  display: flex;
  flex-direction: column;

  .panel-header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    user-select: none;
    //cursor: pointer;

    .collapse-icon {
      transition: transform var(--anim-dur) ease;
      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
  .panel-content {
    flex: 1 0 200px;
    overflow-y: auto;
    transition: height var(--anim-dur) ease;

    &.collapsed {
      overflow: hidden;
      padding: 0;
      opacity: 0;
    }
  }
}
</style>
