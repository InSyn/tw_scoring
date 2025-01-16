<template>
  <v-dialog width="320px" v-model="dialogState">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="clearCompetitorsSheet__dialog__button" color="var(--action-red)" text small tile
        >{{ localization[lang].app.competitors.clear_table }}
      </v-btn>
    </template>

    <div class="clearCompetitorsSheet__dialog__wrapper" style="background: var(--background-card); color: var(--text-default)">
      <div class="clearCompetitorsSheet__dialog__title">
        {{ localization[lang].app.competitors.clear_table }}
      </div>

      <div class="clearCompetitorsSheet__dialog__body">
        <div class="clearCompetitorsSheet__dialog__body__text">
          {{ localization[lang].app.competitors.d_delete_all }}
        </div>

        <div class="clearCompetitorsSheet__dialog__body__actions">
          <v-btn @click="clearSheet" color="var(--accent)" small text>{{ localization[lang].app.dialogs.d_yes }} </v-btn>

          <v-btn @click="closeDialog" color="var(--action-red)" small text>{{ localization[lang].app.dialogs.d_cancel }} </v-btn>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'clearCompetitors-dialog',
  props: ['competition'],
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    clearSheet() {
      this.competition.competitorsSheet.competitors = this.competition.competitorsSheet.competitors.filter((_c) => {
        return 0;
      });
      this.competition.races.forEach((_race) => {
        _race.startList = _race.startList.filter((_comp) => {
          return this.competition.competitorsSheet.competitors.some((comp) => {
            return comp.id === _comp;
          });
        });
        !this.competition.competitorsSheet.competitors.some((_comp) => {
          return _comp.id === _race.selectedCompetitor;
        }) &&
          (() => {
            _race.selectedCompetitor = null;
          })();
        !this.competition.competitorsSheet.competitors.some((_comp) => {
          return _comp.id === _race.onTrack;
        }) &&
          (() => {
            _race.onTrack = null;
          })();
        _race.finished = _race.finished.filter((_comp) => {
          return this.competition.competitorsSheet.competitors.some((comp) => {
            return comp.id === _comp;
          });
        });
      });

      this.dialogState = false;

      this.updateEvent();
    },
    closeDialog() {
      this.dialogState = false;
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
.clearCompetitorsSheet__dialog__button {
  margin-left: auto;
}
.clearCompetitorsSheet__dialog__wrapper {
  color: var(--text-default);
  background: var(--background-card);
  border-radius: 6px;
}
.clearCompetitorsSheet__dialog__title {
  padding: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}
.clearCompetitorsSheet__dialog__body {
  display: flex;
  align-items: center;
  padding: 8px;
}
.clearCompetitorsSheet__dialog__body__text {
  white-space: nowrap;
}
.clearCompetitorsSheet__dialog__body__actions {
  display: flex;
  margin-left: auto;
}
</style>
