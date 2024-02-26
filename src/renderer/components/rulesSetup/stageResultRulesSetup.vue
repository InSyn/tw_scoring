<template>
  <div
    class="pa-2 d-flex flex-column"
    style="
      border-radius: 6px;
      margin-top: 16px;
      background: var(--card-background);
    "
  >
    <div style="margin-bottom: 8px; font-size: 1.2rem; font-weight: bold">
      {{ localization[lang].app.settings.overall_results.title }}
    </div>

    <div
      class="pa-1 d-flex flex-nowrap"
      style="border-radius: 6px; background: var(--standard-background)"
    >
      <div class="d-flex flex-wrap align-stretch">
        <v-btn
          class="mr-2"
          v-for="overall_type in competition.result_formula.overall_result
            .types"
          :key="overall_type.id"
          @click="setOverallResultFormula(+overall_type.id)"
          :disabled="+overall_type.id === 9999"
          :depressed="
            overall_type.id === competition.result_formula.overall_result.type
          "
          style="color: var(--text-default); background: var(--card-background)"
          :style="
            overall_type.id ===
              competition.result_formula.overall_result.type && {
              color: 'var(--standard-background)',
              background: 'var(--success)',
            }
          "
          >{{
            localization[lang].app.settings.overall_results[overall_type.title]
          }}
        </v-btn>
      </div>

      <div
        class="pa-2 d-flex flex-column"
        style="
          width: 250px;
          height: 100%;
          margin-left: auto;
          background: var(--card-background);
          border-radius: 6px;
        "
      >
        <div
          v-for="mode in competition.result_formula.overall_result.select_heats
            .modes"
          class="pa-1 px-2 d-flex justify-center align-center font-weight-bold"
          style="border-radius: 6px"
          :style="
            competition.result_formula.overall_result.select_heats.mode ===
              mode.id && {
              background: 'var(--success)',
              color: 'var(--standard-background)',
            }
          "
        >
          <div>
            {{ localization[lang].app.settings.overall_results[mode.title] }}
          </div>
          <div
            v-if="mode.id === 1"
            class="ml-2 d-flex align-center"
            style="border-radius: 6px"
            :style="
              mode.id === 1 && {
                backgroundColor: 'var(--card-background)',
              }
            "
          >
            <v-icon
              @click="
                competition.result_formula.overall_result.select_heats.heats >
                  0 &&
                  competition.result_formula.overall_result.select_heats
                    .heats--;
                updateResults();
                updateEvent;
              "
              color="var(--text-default)"
              small
              >mdi-chevron-left
            </v-icon>
            <div
              class="pa-1 font-weight-bold"
              style="font-size: 1.2rem; color: var(--text-default)"
            >
              {{ competition.result_formula.overall_result.select_heats.heats }}
            </div>
            <v-icon
              @click="
                competition.result_formula.overall_result.select_heats.heats++;
                updateResults();
                updateEvent;
              "
              color="var(--text-default)"
              small
              >mdi-chevron-right
            </v-icon>
          </div>

          <div
            @click="
              competition.result_formula.overall_result.select_heats.mode =
                mode.id;
              updateResults();
              updateEvent;
            "
            style="
              border-radius: 50%;
              height: 12px;
              width: 12px;
              margin-left: auto;
              cursor: pointer;
              background: var(--standard-background);
            "
            :style="
              competition.result_formula.overall_result.select_heats.mode ===
                mode.id && {
                background: 'var(--text-default)',
                boxShadow: '0 0 5px -2px var(--text-default)',
              }
            "
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "stageResultRulesSetup",
  props: ["competition"],
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    setOverallResultFormula(type) {
      this.competition.result_formula.overall_result.type = type;

      this.updateResults();
      this.updateEvent();
    },
    updateResults() {
      this.$emit("update-results");
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
  },
};
</script>

<style scoped></style>
