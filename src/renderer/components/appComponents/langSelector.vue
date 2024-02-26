<template>
  <div
    class="langMenu__wrapper"
    tabindex="0"
    @focus="toggleLangMenu"
    @blur="toggleLangMenu"
  >
    {{ lang }}
    <div v-if="lang_menu" class="langMenu__list">
      <div
        v-for="(lang, l_idx) in lang_list"
        class="langMenu__item"
        @click="selectLanguage($event, lang)"
        :style="[
          l_idx === 0
            ? {
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
              }
            : l_idx === lang_list.length - 1
            ? {
                borderBottomLeftRadius: '6px',
                borderBottomRightRadius: '6px',
              }
            : null,
          l_idx !== 0
            ? {
                borderTop: `1px solid var(--standard-background)`,
              }
            : null,
        ]"
      >
        {{ lang }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "langSelector",
  methods: {
    ...mapActions("localization", {
      changeLang: "CHANGE_LANG",
    }),
    selectLanguage(e, lang) {
      this.changeLang(lang);

      e.target.parentNode.parentNode.blur();
    },
    toggleLangMenu() {
      this.lang_menu = !this.lang_menu;
    },
  },
  data() {
    return {
      lang_menu: false,
    };
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      lang_list: "lang_list",
      localization: "localization",
    }),
  },
};
</script>

<style scoped></style>
