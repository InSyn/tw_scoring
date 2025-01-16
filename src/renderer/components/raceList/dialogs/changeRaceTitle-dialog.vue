<template>
  <v-dialog v-model="dialogState" width="fit-content">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon x-small color="var(--text-default)">
        <v-icon x-small>mdi-tools</v-icon>
      </v-btn>
    </template>

    <div class="changeRaceTitle__dialog__wrapper">
      <div class="changeRaceTitle__dialog__title">{{ localization[lang].app.races.d_title }}:</div>

      <div class="raceTitle__input__wrapper">
        <input class="raceTitle__input" size="16" v-model="race.title" />
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'changeRaceTitle-dialog',
  props: ['race'],
  data() {
    return {
      dialogState: false,
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
  },
};
</script>

<style scoped>
.changeRaceTitle__dialog__wrapper {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: var(--background-card);
}
.changeRaceTitle__dialog__title {
  font-size: 1.4rem;
  font-weight: bold;
  white-space: nowrap;
}
.raceTitle__input__wrapper {
  display: flex;
  margin-left: 1rem;
}
.raceTitle__input {
  padding: 4px 8px;
  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 6px;
  font-size: 1.2rem;
}
</style>
