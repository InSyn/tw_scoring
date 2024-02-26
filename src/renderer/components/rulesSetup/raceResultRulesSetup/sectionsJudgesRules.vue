<template>
  <div class="rulesSection__wrapper judgesSections">
    <div class="rulesSections__title">
      <div
        @click="setRaceResultFormula(1)"
        :class="[
          'selectedRules__check',
          competition.result_formula.type === 1 &&
            'selectedRules__check-checked',
        ]"
      ></div>
      <div class="rulesSections__title__value">
        {{
          localization[lang].app.settings.race_results[
            competition.result_formula.types[1].title
          ].title
        }}
      </div>

      <v-dialog v-model="section_dialog.state" width="420px">
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            class="addSections__button"
            color="var(--success)"
            small
            text
          >
            {{
              localization[lang].app.settings.race_results.by_section
                .add_section
            }}
          </v-btn>
        </template>

        <div
          class="d-flex flex-column"
          :style="{
            color: 'var(--text-default)',
            background: 'var(--card-background)',
          }"
        >
          <v-card-title class="pa-2 d-flex align-center">
            <div>
              {{
                localization[lang].app.settings.race_results.by_section
                  .new_section
              }}
            </div>
            <v-spacer></v-spacer>
            <v-btn
              color="var(--action-red)"
              icon
              @click="
                () => {
                  section_dialog.state = false;
                  section_dialog.section.coefficient = 1;
                  updateResults();
                }
              "
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <div class="pa-2 d-flex flex-column">
            <div class="pa-1 d-flex align-center">
              <div class="pa-2 d-flex align-center">
                {{
                  localization[lang].app.settings.race_results.by_section
                    .new_section
                }}
                <input
                  v-model="section_dialog.section.coefficient"
                  class="pa-1 ml-2"
                  style="border-radius: 2px; width: 4rem; font-weight: bold"
                  :style="{
                    color: 'var(--text-default)',
                    background: 'var(--standard-background)',
                  }"
                  step="0.05"
                  type="number"
                />
              </div>

              <div
                class="d-flex flex-wrap align-center flex-grow-1"
                style="margin-left: auto; border-radius: 2px"
                :style="{
                  background: 'var(--standard-background)',
                }"
              >
                <div
                  v-for="judge in competition.stuff.judges.filter((_judge) => {
                    return !section_dialog.section.judges_to_add.includes(
                      _judge
                    );
                  })"
                  :key="judge.id"
                  class="d-flex align-center"
                >
                  <div
                    @click="
                      section_dialog.section.judges_to_add.push(judge);
                      updateResults();
                    "
                    class="ma-1 d-flex align-center justify-center font-weight-bold"
                    style="
                      height: 2rem;
                      width: 4rem;
                      font-size: 0.8rem;
                      border-radius: 2px;
                      cursor: pointer;
                      background: var(--subject-background);
                    "
                  >
                    {{
                      `${localization[lang].app.scoring.judge_short} ${judge.id}`
                    }}
                  </div>
                </div>
              </div>
            </div>
            <div
              class="pa-1 d-flex flex-wrap align-center"
              style="border-radius: 6px; background: var(--standard-background)"
            >
              <div
                v-for="(judge_to_add, jta) in section_dialog.section
                  .judges_to_add"
                :key="jta"
                class="d-flex align-center"
              >
                <div
                  @click="section_dialog.section.judges_to_add.splice(jta, 1)"
                  class="ma-1 d-flex align-center justify-center font-weight-bold"
                  style="
                    height: 2rem;
                    width: 4rem;
                    background: var(--subject-background);
                    font-size: 0.8rem;
                    border-radius: 2px;
                    cursor: pointer;
                  "
                >
                  {{
                    `${localization[lang].app.scoring.judge_full} ${judge_to_add.id}`
                  }}
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex">
            <v-btn
              @click="
                section_dialog.section.judges_to_add.length > 0 &&
                  (() => {
                    competition.result_formula.types[1].sections.push({
                      id: generateId(),
                      coefficient: section_dialog.section.coefficient,
                      judges: section_dialog.section.judges_to_add,
                      s_num:
                        competition.result_formula.types[1].sections.length,
                    });
                    section_dialog.state = false;
                    section_dialog.section.coefficient = 1;
                    section_dialog.section.judges_to_add = [];
                  })()
              "
              style="margin-left: auto"
              color="var(--success)"
              text
              >{{ localization[lang].app.dialogs.d_create }}
            </v-btn>
          </div>
        </div>
      </v-dialog>
    </div>

    <div
      class="d-flex flex-column"
      style="min-height: 100px; margin-top: 0.5rem"
    >
      <div class="d-flex align-center flex-wrap">
        <div
          v-for="(section, sc) in competition.result_formula.types[1].sections"
          :key="sc"
          style="margin: 0 0.5rem 0.5rem 0"
        >
          <div
            class="pa-2 pr-4 d-flex flex-column"
            style="border-radius: 6px; position: relative"
            :style="{
              background: 'var(--card-background)',
            }"
          >
            <div
              class="d-flex justify-center align-center"
              style="position: absolute; top: 0; right: 0"
            >
              <v-icon
                color="var(--action-red)"
                small
                @click="
                  competition.result_formula.types[1].sections =
                    competition.result_formula.types[1].sections.filter(
                      (_section) => {
                        return _section.id !== section.id;
                      }
                    );
                  updateResults();
                  updateEvent;
                "
                >mdi-close
              </v-icon>
            </div>
            <div class="d-flex align-center flex-nowrap">
              <div class="font-weight-bold">
                {{
                  localization[lang].app.settings.race_results.by_section
                    .coefficient
                }}
              </div>
              <input
                v-model="section.coefficient"
                type="number"
                class="ml-2 py-1 px-2"
                style="
                  width: 5rem;
                  border-radius: 6px;
                  color: var(--text-default);
                  background: var(--standard-background);
                "
                step="0.05"
              />
            </div>
            <div
              class="mt-2 d-flex align-center flex-wrap"
              style="border-radius: 6px; background: var(--standard-background)"
            >
              <div
                v-for="(section_judge, sj) in section.judges"
                :key="sj"
                class="ma-1 d-flex align-center"
              >
                <div
                  class="ma-1 d-flex align-center justify-center font-weight-bold"
                  style="
                    height: 2rem;
                    width: 4rem;
                    background: var(--subject-background);
                    font-size: 0.8rem;
                    border-radius: 2px;
                    cursor: pointer;
                  "
                >
                  {{
                    `${localization[lang].app.scoring.judge_full} ${section_judge.id}`
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { generateId } from "../../../../lib/utils";

export default {
  name: "sectionsJudgesRules",
  props: ["competition"],
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    generateId,
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    setRaceResultFormula(formulaId) {
      this.$emit("set-race-result-formula", formulaId);
    },
    updateResults() {
      this.$emit("update-results");
    },
  },
  data() {
    return {
      section_dialog: {
        state: false,
        section: {
          judges_to_add: [],
          coefficient: 1,
        },
      },
    };
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
  },
};
</script>

<style scoped>
.rulesSection__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 4px;
  border-radius: 6px;
  background: var(--standard-background);
}
.judgesSections {
  margin-left: 8px;
}
.rulesSections__title {
  display: flex;
  align-items: center;
  padding: 4px;
  background: var(--card-background);
  border-radius: 6px 6px 0 0;
  font-weight: bold;
  font-size: 1.4rem;
}
.selectedRules__check {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--standard-background);
  border: 2px solid var(--standard-background);
  cursor: pointer;
  transition: background 92ms, box-shadow 92ms;
}
.selectedRules__check:hover {
  background: var(--accent);
}
/*noinspection CssUnusedSymbol*/
.selectedRules__check-checked {
  box-shadow: 0 0 3px 1px var(--accent);
  background: var(--accent-light);
}
.rulesSections__title__value {
  margin-left: 8px;
}
.addSections__button {
  margin-left: auto;
}
.addSections__button {
  margin-left: auto;
}
</style>
