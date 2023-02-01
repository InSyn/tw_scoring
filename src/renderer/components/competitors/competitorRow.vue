<template>
  <v-row
    class="competitorRow"
    @click="openEditCompetitorDialog(competitor)"
    no-gutters
  >
    <competitor-data-dialog
      :competition="competition"
      :competitor="competitor"
      :dialog-state="editCompetitorDataDialog"
      @toggleDialogState="editCompetitorDataDialog = !editCompetitorDataDialog"
    ></competitor-data-dialog>

    <v-col
      class="competitorDataCell"
      v-for="(dataCell, key, index) in competition.competitorsSheet.header"
      :key="key"
    >
      {{
        competitor.info_data[dataCell.id]
          ? competitor.info_data[dataCell.id]
          : null
      }}
    </v-col>

    <div class="switchCompetitorButtons">
      <div @click.stop="moveCompetitorUp" class="switchCompetitor-btn">
        <v-icon class="switchCompetitor-icon" small>mdi-chevron-up</v-icon>
      </div>
      <div @click.stop="moveCompetitorDown" class="switchCompetitor-btn">
        <v-icon class="switchCompetitor-icon" small>mdi-chevron-down</v-icon>
      </div>
    </div>
  </v-row>
</template>

<script>
import CompetitorDataDialog from "./dialogs/competitorDataDialog";
import { mapActions } from "vuex";

export default {
  name: "tableRow",
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
.competitorRow {
  position: relative;
  height: 32px;
  background: var(--standard-background);
  border: 1px solid var(--standard-background);
  cursor: pointer;
  user-select: none;
}
.competitorRow:nth-child(odd) {
  border: 1px solid var(--card-background);
  background: var(--card-background);
}
.competitorRow:hover {
  background: var(--card-background);
  border: 1px solid var(--accent);
}
.competitorDataCell {
  padding-left: 6px !important;
  line-height: 30px;
  overflow: hidden;
  white-space: nowrap;
}
.switchCompetitorButtons {
  position: absolute;
  z-index: 999;
  top: 0;
  left: -24px;
  height: 100%;
  width: 24px;
}
.switchCompetitor-btn {
  display: none;
  justify-content: center;
  align-items: center;
  height: 50%;
  width: 100%;
}
.competitorRow:hover .switchCompetitor-btn {
  display: flex;
}
.switchCompetitorButtons:hover .switchCompetitor-btn {
  display: flex;
}
.switchCompetitor-icon {
  color: var(--accent);
  transition: color 64ms;
}
.switchCompetitor-btn:hover .switchCompetitor-icon {
  color: var(--text-default);
}
</style>
