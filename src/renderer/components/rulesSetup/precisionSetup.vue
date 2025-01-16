<template>
  <div class="precisionSetup__wrapper section-container" style="margin-top: 16px">
    <div style="margin-bottom: 8px; font-size: 1.2rem; font-weight: bold">
      {{ localization[lang].app.settings.precision.result_precision }}
    </div>

    <div style="width: 100%">
      <v-radio-group
        @change="updateEvent"
        v-model="competition.structure.selected.accuracy"
        class="ma-0 pa-0"
        style="border-radius: 6px; background: var(--background-deep)"
        row
        hide-details
      >
        <v-radio
          v-for="(acc_lvl, acc) in competition.structure.accuracy"
          :key="acc"
          :value="acc_lvl.id"
          :label="acc_lvl.title"
          class="pa-2 ma-1"
          style="color: var(--text-default); background: var(--background-card); border-radius: 6px"
          color="var(--accent)"
          :dark="appTheme === 'dark'"
        ></v-radio>
      </v-radio-group>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'precisionSetup',
  props: ['competition'],
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('main', {
      appTheme: 'appTheme',
    }),
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
  },
};
</script>

<style scoped>
.precisionSetup__wrapper {
}
</style>
