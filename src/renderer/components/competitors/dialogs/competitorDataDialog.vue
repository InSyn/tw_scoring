<template>
  <v-dialog v-model="showDialog" min-width="380px" max-width="480px">
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
          v-for="(field, f_key) in competitor.info_data"
          class="competitorDataUnit-row"
          :key="f_key"
        >
          <div class="competitorDataUnit-key">
            {{ f_key }}
          </div>
          <input
            class="competitorDataUnit-input"
            type="text"
            @change="setDataValue($event, competitor, f_key)"
            v-bind:value="competitor.info_data[f_key]"
          />
        </div>
      </div>

      <div class="editFrameActions">
        <v-btn
          @click="deleteCompetitor(competitor)"
          class="action-btn delete"
          small
          color="var(--action-red)"
          >{{ localization[lang].app.dialogs.d_delete }}
        </v-btn>

        <v-btn
          @click="$emit('toggleDialogState')"
          class="action-btn close"
          text
          small
          color="var(--accent)"
          >{{ localization[lang].app.dialogs.d_close }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
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
      competitor.info_data[dataField] = e.target.value;

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
  margin-bottom: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-default);
  background: var(--card-background);
}

.competitorName {
  flex: 0 0 auto;
  padding: 4px 8px;
  background: var(--accent);
  border-bottom-right-radius: 6px;
}

.editFrame-title {
  flex: 1 0 auto;
  text-align: end;
  padding: 4px 8px;
}

.editFrame-body {
  padding: 0 16px;
  max-height: 300px;
  margin-bottom: 8px;
  overflow-y: auto;
}

.competitorDataUnit-row {
  display: flex;
  align-items: baseline;
  margin-top: 8px;
}

.competitorDataUnit-key {
  flex: 2 1 0;
  overflow: hidden;

  white-space: nowrap;
  font-weight: bold;
}

.competitorDataUnit-input {
  flex: 5 1 0;
  min-width: 0;
  margin-left: 8px;
  padding: 4px;
  overflow: hidden;

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
