<template>
  <div class="competitorRow__wrapper" @click.right="openEditCompetitorDialog" title="ПКМ - открыть диалог изменения данных">
    <competitor-data-dialog
      :competition="competition"
      :competitor="competitor"
      :dialog-state="editCompetitorDataDialog"
      @toggleDialogState="editCompetitorDataDialog = !editCompetitorDataDialog"
    ></competitor-data-dialog>

    <div class="competitorDataCell" v-for="(dataCell, key, index) in competition.competitorsSheet.header" :key="key">
      <input
        class="competitorDataCell__input"
        type="text"
        :value="competitor.info_data[dataCell.id] || ''"
        @change="setAthleteData($event, competitor, dataCell.id)"
      />
      <!--      {{ competitor.info_data[dataCell.id] ? competitor.info_data[dataCell.id] : null }}-->
    </div>

    <div class="switchCompetitorButtons">
      <div @click.stop="moveCompetitorUp" class="switchCompetitor-btn">
        <v-icon class="switchCompetitor-icon" small>mdi-chevron-up</v-icon>
      </div>

      <div @click.stop="moveCompetitorDown" class="switchCompetitor-btn">
        <v-icon class="switchCompetitor-icon" small>mdi-chevron-down</v-icon>
      </div>
    </div>
  </div>
</template>

<script>
import CompetitorDataDialog from './dialogs/competitorDataDialog';
import { mapActions } from 'vuex';

export default {
  name: 'competitorRow',
  components: { CompetitorDataDialog },
  props: ['competition', 'competitor', 'competitors', 'listIsSorted'],
  data() {
    return {
      editCompetitorDataDialog: false,
    };
  },
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    openEditCompetitorDialog() {
      this.editCompetitorDataDialog = true;
    },
    setAthleteData(e, competitor, dataField) {
      const value = e.target.value ? e.target.value.toString().trim() : '';
      competitor.info_data[dataField] = value;

      this.updateEvent();
    },
    moveCompetitorUp() {
      const id = this.competition.competitorsSheet.competitors.indexOf(this.competitor);

      if (id > 0) {
        let competitorToCheck = this.competition.competitorsSheet.competitors[id - 1];
        this.$set(this.competition.competitorsSheet.competitors, id - 1, this.competition.competitorsSheet.competitors[id]);
        this.$set(this.competition.competitorsSheet.competitors, id, competitorToCheck);
      }

      this.updateEvent();
    },
    moveCompetitorDown() {
      const id = this.competition.competitorsSheet.competitors.indexOf(this.competitor);

      if (id < this.competition.competitorsSheet.competitors.length - 1) {
        let competitorToCheck = this.competition.competitorsSheet.competitors[id + 1];
        this.$set(this.competition.competitorsSheet.competitors, id + 1, this.competition.competitorsSheet.competitors[id]);
        this.$set(this.competition.competitorsSheet.competitors, id, competitorToCheck);
      }

      this.updateEvent();
    },
  },
};
</script>

<style scoped lang="scss">
.competitorRow__wrapper {
  position: relative;
  display: flex;
  flex-wrap: nowrap;

  background: var(--standard-background);
  //border: 1px solid var(--standard-background);
  cursor: pointer;
  user-select: none;

  &:nth-child(odd) {
    background: var(--background-card);
  }
  &:hover {
    //border: 1px solid var(--accent);
    background: var(--subject-background);
  }
}
.competitorDataCell {
  flex: 1 1 0;
  overflow: hidden;

  .competitorDataCell__input {
    min-width: 0;
    height: 100%;
    width: 100%;
    padding: 4px 0 4px 8px;
    border-radius: 0;
    background-color: transparent;

    &:hover {
      box-shadow: 0 0 0 1px var(--text-default) inset;
    }
    &:active,
    &:focus {
      box-shadow: 0 0 0 1px var(--accent-light) inset;
      background-color: var(--background-card-nested);
    }
  }
}
.switchCompetitorButtons {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -17px;
  width: 16px;
}
.switchCompetitor-btn {
  display: none;
  justify-content: center;
  align-items: center;
  height: 50%;
  width: 100%;
}
.competitorRow__wrapper:hover .switchCompetitor-btn {
  display: flex;
}
.switchCompetitorButtons:hover .switchCompetitor-btn {
  display: flex;
}
.switchCompetitor-icon {
  color: var(--accent);
  transition: color 112ms;
}
.switchCompetitor-btn:hover .switchCompetitor-icon {
  color: var(--text-default);
}
</style>
