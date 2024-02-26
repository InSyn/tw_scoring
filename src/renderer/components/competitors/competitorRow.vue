<template>
  <div
    class="competitorRow__wrapper"
    @click="openEditCompetitorDialog(competitor)"
  >
    <competitor-data-dialog
      :competition="competition"
      :competitor="competitor"
      :dialog-state="editCompetitorDataDialog"
      @toggleDialogState="editCompetitorDataDialog = !editCompetitorDataDialog"
    ></competitor-data-dialog>

    <div
      class="competitorDataCell"
      v-for="(dataCell, key, index) in competition.competitorsSheet.header"
      :key="key"
    >
      {{
        competitor.info_data[dataCell.id]
          ? competitor.info_data[dataCell.id]
          : null
      }}
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
import CompetitorDataDialog from "./dialogs/competitorDataDialog";
import { mapActions } from "vuex";

export default {
  name: "competitorRow",
  components: { CompetitorDataDialog },
  props: ["competition", "competitor", "competitors", "listIsSorted"],
  data() {
    return {
      editCompetitorDataDialog: false,
    };
  },
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    openEditCompetitorDialog() {
      this.editCompetitorDataDialog = true;
    },
    moveCompetitorUp() {
      const id = this.competition.competitorsSheet.competitors.indexOf(
        this.competitor
      );

      if (id > 0) {
        let competitorToCheck =
          this.competition.competitorsSheet.competitors[id - 1];
        this.$set(
          this.competition.competitorsSheet.competitors,
          id - 1,
          this.competition.competitorsSheet.competitors[id]
        );
        this.$set(
          this.competition.competitorsSheet.competitors,
          id,
          competitorToCheck
        );
      }

      this.updateEvent();
    },
    moveCompetitorDown() {
      const id = this.competition.competitorsSheet.competitors.indexOf(
        this.competitor
      );

      if (id < this.competition.competitorsSheet.competitors.length - 1) {
        let competitorToCheck =
          this.competition.competitorsSheet.competitors[id + 1];
        this.$set(
          this.competition.competitorsSheet.competitors,
          id + 1,
          this.competition.competitorsSheet.competitors[id]
        );
        this.$set(
          this.competition.competitorsSheet.competitors,
          id,
          competitorToCheck
        );
      }

      this.updateEvent();
    },
  },
};
</script>

<style scoped>
.competitorRow__wrapper {
  position: relative;
  display: flex;
  flex-wrap: nowrap;

  background: var(--standard-background);
  border: 1px solid var(--standard-background);
  cursor: pointer;
  user-select: none;
}
.competitorRow__wrapper:nth-child(odd) {
  border: 1px solid var(--card-background);
  background: var(--card-background);
}
.competitorRow__wrapper:hover {
  background: var(--card-background);
  border: 1px solid var(--accent);
}
.competitorDataCell {
  flex: 1 1 0;
  padding: 6px 0 6px 12px;
  overflow: hidden;
  white-space: nowrap;
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
