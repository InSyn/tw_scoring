<template>
  <transition name="fade">
    <div v-if="visible" class="ratingsDialog__overlay">
      <div class="ratingsDialog">
        <header class="ratingsDialog__header">
          <h3>{{ texts.title || 'Создать Рейтинг' }}</h3>
          <button class="ratingsDialog__close" @click="$emit('close')">×</button>
        </header>

        <section class="ratingsDialog__body">
          <label class="ratingsDialog__field">
            <span>{{ texts.nameLabel || 'Название' }}</span>
            <input
              type="text"
              v-model="form.title"
              :placeholder="texts.namePlaceholder || 'Рейтинг России...'"
            />
          </label>

          <label class="ratingsDialog__field">
            <span>{{ texts.competitionsCount || 'Количество соревнований' }}</span>
            <input
              type="number"
              min="0"
              max="20"
              v-model.number="form.competitions"
            />
          </label>
        </section>

        <footer class="ratingsDialog__footer">
          <button class="ratingsDialog__btn ratingsDialog__btn--secondary" @click="$emit('close')">
            {{ texts.cancel || 'Отмена' }}
          </button>
          <button class="ratingsDialog__btn ratingsDialog__btn--primary" @click="handleConfirm">
            {{ texts.create || 'Создать' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'RatingCreateDialog',
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
        competitions: 0,
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
        competitions: 0,
      };
    },
    handleConfirm() {
      const payload = {
        title: this.form.title.trim(),
        competitionsCount: Math.min(20, Math.max(0, this.form.competitions || 0)),
      };
      this.$emit('confirm', payload);
    },
  },
};
</script>

<style scoped lang="scss">
.ratingsDialog__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.ratingsDialog {
  width: 420px;
  background: #111624;
  border-radius: 12px;
  border: 1px solid #262d42;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.ratingsDialog__header,
.ratingsDialog__footer {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ratingsDialog__header h3 {
  margin: 0;
}

.ratingsDialog__close {
  border: none;
  background: transparent;
  color: #9aa4c6;
  font-size: 1.2rem;
  cursor: pointer;
}

.ratingsDialog__body {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ratingsDialog__field {
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

.ratingsDialog__btn {
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

