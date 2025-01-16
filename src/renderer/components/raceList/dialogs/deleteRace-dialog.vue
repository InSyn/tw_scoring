<template>
  <v-dialog v-model="dialogState" width="320px">
    <template v-slot:activator="{ on, attrs }">
      <div v-on="on" class="deleteRace__button">
        <v-icon x-small color="var(--text-default)"> mdi-close </v-icon>
      </div>
    </template>
    <div class="deleteRace__dialog__wrapper">
      <div class="deleteRace__dialog__title">
        {{ localization[lang].app.dialogs.d_delete }}&nbsp; <b> {{ race.title }} </b>?
      </div>

      <div class="deleteRace__dialog__text">
        {{ localization[lang].app.dialogs.d_text }}
      </div>

      <div class="deleteRace__dialog__actions">
        <v-btn text @click="del_race(race)" color="var(--action-red)" small>{{ localization[lang].app.dialogs.d_delete }} </v-btn>
        <v-btn @click="dialogState = false" small>
          {{ localization[lang].app.dialogs.d_cancel }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'deleteRace-dialog',
  props: ['competition', 'race'],
  methods: {
    del_race(_race) {
      this.dialogState = false;

      this.competition.races = this.competition.races.filter((race) => {
        return race.id !== _race.id;
      });

      this.competition.competitorsSheet.competitors.forEach((_competitor) => {
        _competitor.marks = _competitor.marks.filter((_mark) => {
          return _mark.race_id !== _race.id;
        });
        _competitor.results = _competitor.results.filter((result) => {
          return result.race_id !== _race.id;
        });
      });

      this.competition.races[0] ? this.selectRace(this.competition.races[0]) : this.selectRace(null);
      this.competition.selected_race_id = 0;

      this.$store.dispatch('main/updateEvent');
    },
    selectRace(race) {
      this.$emit('select-race', race);
    },
  },
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
.deleteRace__button {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 3px;
  right: 3px;
  height: 14px;
  width: 14px;
  border-radius: 4px;
  background: var(--background-card);
}
.deleteRace__button:hover {
  background: var(--action-red);
}
.deleteRace__dialog__wrapper {
  background-color: var(--background-card);
  color: var(--text-default);
}
.deleteRace__dialog__title {
  margin-bottom: 8px;
  padding: 8px;

  color: var(--text-default);
  font-size: 1.4rem;
  font-weight: bold;
}
.deleteRace__dialog__text {
  margin-bottom: 8px;
  padding: 8px;
  font-weight: bold;
}
.deleteRace__dialog__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;

  font-size: 1rem;
}
</style>
