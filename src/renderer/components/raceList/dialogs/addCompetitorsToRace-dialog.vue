<template>
  <v-dialog v-model="dialogState" width="640px">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="addCompetitorsToRace__button" color="var(--success)" text small>{{ localization[lang].app.races.add_competitors }} </v-btn>
    </template>

    <div class="addCompetitorsToRace__dialog__wrapper">
      <div class="addCompetitorsToRace__dialog__title">
        <div class="addCompetitorsToRace__dialog__title__text">
          {{ `${localization[lang].app.races.d_add_competitors_to} ${selectedRace.title}` }}
        </div>

        <v-btn @click="closeAddCompetitorsDialog()" class="addCompetitorsToRace__dialog__button-close" color="var(--action-red)" small icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="addCompetitorsToRace__dialog__body">
        <div class="addCompetitorsToRace__dialog__competitorsList">
          <div
            v-for="competitor in competition.competitorsSheet.competitors.filter((_comp) => {
              return (
                !dialogCompetitors.includes(_comp.id) &&
                !selectedRace.startList.includes(_comp.id) &&
                !selectedRace.finished.includes(_comp.id) &&
                selectedRace.onTrack !== _comp.id
              );
            })"
            :key="competitor.id"
            @click="dialogCompetitors.push(competitor.id)"
            class="addCompetitorsToRace__dialog__competitorsList__item competitorItem-available"
          >
            {{ `${competitor.info_data.bib && competitor.info_data.bib} ${competitor.info_data.name && competitor.info_data.name}` }}
          </div>
        </div>

        <div class="addCompetitorsToRace__dialog__competitorsList">
          <div
            v-for="competitor in competition.competitorsSheet.competitors.filter((_comp) => {
              return dialogCompetitors.includes(_comp.id);
            })"
            :key="competitor.id"
            @click="
              dialogCompetitors = dialogCompetitors.filter((_comp) => {
                return _comp !== competitor.id;
              })
            "
            class="addCompetitorsToRace__dialog__competitorsList__item competitorItem-added"
          >
            {{ `${competitor.info_data.bib && competitor.info_data.bib} ${competitor.info_data.name && competitor.info_data.name}` }}
          </div>
        </div>
      </div>

      <div class="addCompetitorsToRace__dialog__actions">
        <v-btn @click="addCompetitorToRace(selectedRace)" class="addCompetitorsToRace__dialog__actions__button-accept" color="var(--action-blue)" text small
          >{{ localization[lang].app.dialogs.d_accept }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'addCompetitorsToRace-dialog',
  props: ['competition', 'selectedRace'],
  methods: {
    addCompetitorToRace(race) {
      this.selectedRace.startList.push(...this.dialogCompetitors);
      this.dialogState = false;
      this.dialogCompetitors = [];

      this.competition.rebuildStartList(race);
    },
    closeAddCompetitorsDialog() {
      this.dialogCompetitors = [];
      this.dialogState = false;
    },
    rebuildStartList(race) {
      this.$emit('rebuild-start-list', race);
    },
  },
  data() {
    return {
      dialogCompetitors: [],
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
.addCompetitorsToRace__button {
  margin-left: auto;
}
.addCompetitorsToRace__dialog__wrapper {
  color: var(--text-default);
  background-color: var(--background-card);
}
.addCompetitorsToRace__dialog__title {
  display: flex;
  align-items: center;
  padding: 8px;
}
.addCompetitorsToRace__dialog__title__text {
  font-size: 1.2rem;
  font-weight: bold;
}
.addCompetitorsToRace__dialog__button-close {
  margin-left: auto;
}
.addCompetitorsToRace__dialog__body {
  display: flex;
  flex-wrap: nowrap;
  padding: 8px;
  height: 380px;
}
.addCompetitorsToRace__dialog__competitorsList {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  background-color: var(--standard-background);
  user-select: none;
}
.addCompetitorsToRace__dialog__competitorsList:nth-child(1) {
  margin-right: 4px;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}
.addCompetitorsToRace__dialog__competitorsList:nth-child(2) {
  margin-left: 4px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}
.addCompetitorsToRace__dialog__competitorsList__item {
  padding: 4px 8px;
  font-weight: bold;
  cursor: pointer;

  border-bottom: 1px solid var(--background-card);
}
.competitorItem-available:hover {
  background: rgba(42, 190, 106, 0.4);
}
.competitorItem-added:hover {
  background: rgba(217, 45, 65, 0.4);
}
.addCompetitorsToRace__dialog__actions {
  display: flex;
  padding: 8px;
}
.addCompetitorsToRace__dialog__actions__button-accept {
  margin-left: auto;
}
</style>
