<template>
  <transition name="fade">
    <div v-if="visible" class="cupsDialog__overlay">
      <div class="cupsDialog">
        <header class="cupsDialog__header">
          <h3>{{ texts.title || 'Создать Кубок' }}</h3>
          <button class="cupsDialog__close" @click="$emit('close')">×</button>
        </header>

        <section class="cupsDialog__body">
          <label class="cupsDialog__field">
            <span>{{ texts.nameLabel || 'Название' }}</span>
            <input
              type="text"
              v-model="form.title"
              :placeholder="texts.namePlaceholder || 'Кубок России...'"
            />
          </label>

          <label class="cupsDialog__field">
            <span>{{ texts.stagesCount || 'Количество этапов' }}</span>
            <input
              type="number"
              min="1"
              max="8"
              v-model.number="form.stages"
            />
          </label>
        </section>

        <footer class="cupsDialog__footer">
          <button class="cupsDialog__btn cupsDialog__btn--secondary" @click="$emit('close')">
            {{ texts.cancel || 'Отмена' }}
          </button>
          <button class="cupsDialog__btn cupsDialog__btn--primary" @click="handleConfirm">
            {{ texts.create || 'Создать' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CupCreateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    texts: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      form: {
        title: '',
        stages: 4,
      },
    };
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.resetForm();
      }
    },
  },
  methods: {
    resetForm() {
      this.form = {
        title: '',
        stages: 4,
      };
    },
    handleConfirm() {
      const payload = {
        title: this.form.title.trim(),
        stages: Math.min(8, Math.max(1, this.form.stages || 1)),
      };
      this.$emit('confirm', payload);
    },
  },
};
</script>

<style scoped lang="scss">
.cupsDialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.cupsDialog {
  width: 420px;
  background: #111624;
  border-radius: 12px;
  border: 1px solid #262d42;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.cupsDialog__header,
.cupsDialog__footer {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cupsDialog__header h3 {
  margin: 0;
}

.cupsDialog__close {
  border: none;
  background: transparent;
  color: #9aa4c6;
  font-size: 1.2rem;
  cursor: pointer;
}

.cupsDialog__body {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cupsDialog__field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  input {
    width: 100%;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #2c3350;
    background: #0d111c;
    color: var(--text-default);
  }
}

.cupsDialog__btn {
  min-width: 120px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;

  &--secondary {
    background: #1c2235;
    color: #9aa4c6;
  }

  &--primary {
    background: #1cbf73;
    color: #0c111d;
  }
}
</style>

