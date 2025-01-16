<script>
import { ProtocolDocument } from '../../../store/classes/Protocol/ProtocolDocument';

export default {
  name: 'general-settings-section',
  props: {
    protocol: {
      type: ProtocolDocument,
      default: () => null,
    },
  },
  data() {
    return {
      localProtocol: this.protocol ? { ...this.protocol } : null,
    };
  },
  methods: {
    updateField() {
      this.$emit('template:updated', this.localProtocol);
    },
  },
  watch: {
    protocol: {
      handler(newVal) {
        this.localProtocol = newVal ? { ...newVal } : null;
      },
      immediate: true,
    },
  },
};
</script>

<template>
  <div class="generalSettings__wrapper">
    <h3 class="generalSettings__header">Настройки шаблона</h3>
    <div v-if="protocol" class="generalSettings__body">
      <label>
        Название шаблона:
        <input type="text" v-model="localProtocol.name" @input="updateField" />
      </label>
      <div class="layout-inputs">
        <label>
          Ширина (mm):
          <input type="number" v-model="localProtocol.config.page.width" @input="updateField" />
        </label>
        <label>
          Высота (mm):
          <input type="number" v-model="localProtocol.config.page.height" @input="updateField" />
        </label>
        <label>
          Ориентация:
          <select v-model="localProtocol.config.page.orientation" @change="updateField">
            <option value="portrait">Портретная</option>
            <option value="landscape">Альбомная</option>
          </select>
        </label>
      </div>
      <label>
        Отступы (mm):
        <div class="margin-inputs">
          <input type="number" v-model="localProtocol.config.page.margins.top" @input="updateField" placeholder="Верхний отступ" />
          <input type="number" v-model="localProtocol.config.page.margins.right" @input="updateField" placeholder="Правый отступ" />
          <input type="number" v-model="localProtocol.config.page.margins.bottom" @input="updateField" placeholder="Нижний отступ" />
          <input type="number" v-model="localProtocol.config.page.margins.left" @input="updateField" placeholder="Левый отступ" />
        </div>
      </label>
    </div>
  </div>
</template>

<style scoped lang="scss">
.generalSettings__wrapper {
  display: flex;
  flex-direction: column;

  .generalSettings__header {
    flex: 0 0 auto;
    margin-bottom: 16px;
  }
  .generalSettings__body {
    flex: 1 1 50px;
    display: flex;
    flex-direction: column;
    padding: 4px;
    overflow-y: auto;

    & > * {
      flex: 0 0 auto;
      margin-bottom: 8px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    .layout-inputs {
      flex: 0 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      grid-gap: 8px;
    }
    .margin-inputs {
      flex: 0 0 auto;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 4px;
    }

    label {
      display: flex;
      flex-direction: column;

      input,
      select {
        min-width: 0;
      }
    }
  }
}
</style>
