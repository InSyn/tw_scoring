<script>
import { mdiTrashCan } from '@mdi/js';

export default {
  name: 'tw-file-input',
  props: {
    buttonLabel: {
      type: String,
      default: 'Выбрать изображение',
    },
    accept: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    useForPath: {
      type: Boolean,
      default: false,
    },
    useForJSON: {
      type: Boolean,
      default: true,
    },
    useNative: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      deleteIcon: mdiTrashCan,
      selectedFiles: [],
    };
  },
  methods: {
    browseFiles() {
      this.$refs.fileInput.click();
    },
    onFileChange(event) {
      if (this.useNative) {
        this.$emit('input', event);
        return;
      }

      const files = Array.from(event.target.files || []);
      if (this.useForJSON) {
        this.selectedFiles = files[0];
        this.$emit('input', files[0]);
        return;
      }
      if (!this.multiple && files.length) {
        this.selectedFiles = [files[0]];
      } else {
        this.selectedFiles = files;
      }
      this.$emit('input', this.selectedFiles);
    },
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
      this.$emit('input', this.selectedFiles);
    },
  },
};
</script>

<template>
  <div class="tw-file-input">
    <label class="cfi__label">
      <button type="button" class="tw-button" @click="browseFiles">
        {{ buttonLabel }}
      </button>
      <input type="file" ref="fileInput" :accept="accept" :multiple="multiple" class="cfi__native-input" @change="onFileChange" />
    </label>

    <div v-if="selectedFiles.length" class="cfi__file-list">
      <div v-for="(file, index) in selectedFiles" :key="index" class="cfi__file-item">
        <span class="cfi__filename">{{ file.name }}</span>
        <button type="button" class="tw-button-small danger" @click="removeFile(index)">
          <v-icon size="12" color="white">{{ deleteIcon }}</v-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tw-file-input {
  display: flex;
  align-items: center;
  padding: 4px;

  .cfi__label {
    button {
      flex: 0 1 12ch;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cfi__native-input {
      display: none;
    }
  }

  .cfi__file-list {
    flex: 0 0 auto;
    display: flex;
    flex-wrap: wrap;

    .cfi__file-item {
      flex: 1 1 5rem;
      display: flex;
      align-items: center;
      overflow: hidden;
      margin-left: 8px;
      padding: 3px 6px;

      background-color: var(--standard-background);
      color: var(--text-default);
      border: 1px solid var(--subject-background);
      border-radius: 2px;

      .cfi__filename {
        flex: 1 1 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      button {
        margin-left: 8px;
      }
    }
  }
}
</style>
