<script>
export default {
  name: 'template-selection',
  props: {
    templates: {
      type: Array,
      default: () => [],
    },
    selectedTemplateId: {
      type: String,
      default: null,
    },
  },
  computed: {
    getSortedTemplates() {
      return this.templates.sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    selectTemplate(template) {
      this.$emit('apply-template', template);
    },
  },
};
</script>

<template>
  <div class="templateSelection__wrapper">
    <h3 class="templateSelection__header">Шаблоны протоколов</h3>
    <ul class="templateSelection__list">
      <li v-for="template in getSortedTemplates" :key="template.id" :class="{ selected: template.id === selectedTemplateId }" @click="selectTemplate(template)">
        {{ template.name }}
      </li>
    </ul>
    <div class="templateSelection__actions">
      <button class="tw-button" @click="$emit('create-new-template')">Добавить новый</button>
      <button class="tw-button" @click="$emit('open-manager')">Шаблоны</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.templateSelection__wrapper {
  display: flex;
  flex-direction: column;
  overflow: visible;
  min-height: 6rem;
  font-size: 0.9em;

  .templateSelection__header {
    flex: 0 0 auto;
    margin-bottom: 8px;
  }
  .templateSelection__list {
    flex: 1 1 50px;
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    margin: 0;
    background-color: var(--background-deep);
    border-radius: 2px;
    overflow-y: auto;

    li {
      flex: 0 0 auto;
      padding: 0.25rem 0.4rem;
      font-size: 0.9rem;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transition: background-color 92ms;
      &:hover {
        background-color: var(--subject-background);
      }

      &.selected {
        font-weight: bold;
        background-color: var(--accent);
        color: white;
      }
    }
  }
  .templateSelection__actions {
    flex: 0 0 auto;
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;

    & > * {
      margin-left: 8px;
      &:first-child {
        margin-left: 0;
      }
    }
  }
}
</style>
