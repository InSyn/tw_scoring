<template>
  <v-dialog v-model="showDialog" width="380px">
    <div class="editFrame-wrapper">
      <div class="editFrame-header">
        <span class="competitorName">{{
          `${
            (competitor.info_data["bib"] && competitor.info_data["bib"]) || ""
          } ${
            (competitor.info_data["lastname"] &&
              competitor.info_data["lastname"]) ||
            ""
          } ${
            (competitor.info_data["name"] && competitor.info_data["name"]) || ""
          }`
        }}</span>

        <div class="editFrame-title">
          {{ localization[lang].app.competitors.d_competitor_info }}
        </div>
      </div>
      <div class="editFrame-body">
        <div
          v-for="(field, f_key) in competition.competitorsSheet.header"
          class="competitorDataUnit-row"
          :key="f_key"
        >
          <div class="competitorDataUnit-key">
            {{ field.id }}
          </div>
          <input
            class="competitorDataUnit-input"
            type="text"
            @change="setDataValue($event, competitor, field)"
            v-bind:value="competitor.info_data[field.id]"
          />
        </div>
      </div>
      <div class="editFrameActions">
        <v-btn
          class="action-btn delete"
          @click="deleteCompetitor(competitor)"
          small
          text
          color="var(--action-red)"
          >{{ localization[lang].app.dialogs.d_delete }}
        </v-btn>
        <v-btn
          class="action-btn close"
          @click="$emit('toggleDialogState')"
          small
          color="var(--accent)"
          >{{ localization[lang].app.dialogs.d_close }}
        </v-btn>
      </div>
    </div></v-dialog
  >
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { mdiAccountEdit } from "@mdi/js";

export default {
  name: "competitorDataDialog",
  props: ["competition", "competitor", "dialogState"],
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    deleteCompetitor(competitor) {
      this.competition.races.forEach((race) => {
        race.startList = race.startList.filter(
          (_competitor) => _competitor !== competitor.id
        );
        if (race.selectedCompetitor === competitor.id)
          race.selectedCompetitor = null;
        if (race.onTrack === competitor.id) race.onTrack = null;
        race.finished = race.finished.filter(
          (_competitor) => _competitor !== competitor.id
        );
      });

      this.competition.competitorsSheet.competitors =
        this.competition.competitorsSheet.competitors.filter(
          (_competitor) => _competitor.id !== competitor.id
        );

      this.$emit("toggleDialogState");
      this.rebuildAllStartLists();
    },
    rebuildAllStartLists() {
      this.competition.races.forEach((race) => {
        race._startList = [...race.startList];
        race.onTrack && race._startList.unshift(race.onTrack);
        race.finished.length > 0 && race._startList.unshift(...race.finished);

        this.refreshAllStartLists(race);
      });
    },
    refreshAllStartLists(race) {
      race.startList[0] ? (race.selectedCompetitor = race.startList[0]) : null;

      this.updateEvent();
    },
    setDataValue(e, competitor, dataField) {
      competitor.info_data[dataField.id] = e.target.value;

      this.updateEvent();
    },
  },
  data() {
    return {
      editIcon: mdiAccountEdit,
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    showDialog: {
      get() {
        return this.dialogState;
      },
      set() {
        this.$emit("toggleDialogState");
      },
    },
  },
};
</script>

<style scoped>
.editFrame-wrapper {
  background: var(--card-background);
  color: var(--text-default);
  border-radius: 6px;
  overflow: hidden;
}
.editFrame-header {
  display: flex;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-default);
  background: var(--card-background);
}
.competitorName {
  flex: 0 0 auto;
  padding: 8px;
  background: var(--accent);
  border-bottom-right-radius: 6px;
}
.editFrame-title {
  flex: 1 0 auto;
  text-align: end;
  padding: 8px;
}
.editFrame-body {
  padding: 0 16px;
  max-height: 300px;
  overflow-y: auto;
}
.competitorDataUnit-row {
  display: flex;
  align-items: baseline;
  margin-top: 8px;
}
.competitorDataUnit-key {
  flex: 0 0 auto;
  min-width: 72px;
  font-weight: bold;
}
.competitorDataUnit-input {
  flex: 0 0 auto;
  min-width: 0;
  width: 160px;
  padding: 4px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 6px;
}
.editFrameActions {
  display: flex;
  padding: 8px;
}
.action-btn {
  color: var(--text-default);
}
.action-btn.close {
  margin-left: auto;
}
</style>
