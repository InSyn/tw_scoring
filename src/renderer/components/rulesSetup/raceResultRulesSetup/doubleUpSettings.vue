<template>
  <div style="flex: 0 0 auto; display: flex; flex-wrap: nowrap">
    <div
      v-for="(cor, cor_idx) in competition.result_formula.types[0]
        .doubleUp_corridors"
      :key="`cor_${cor_idx}`"
      style="
        width: 50%;
        margin-right: 4px;
        color: var(--text-default);
        background: var(--card-background);
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          width: 100%;
          font-weight: bold;
          padding: 2px 4px;
        "
      >
        {{ localization[lang].app.settings.race_results.by_judge.corridor }}
        {{ cor_idx + 1 }}
        <div style="margin-left: auto">
          <v-dialog
            v-model="
              competition.result_formula.types[0][
                `doubleUp_cor${cor_idx}_dialog`
              ]
            "
            width="420px"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                class="corridorSettings__button"
                color="var(--text-default)"
                icon
                x-small
              >
                <settings-cog-icon
                  class="corridorSettings__button__icon"
                ></settings-cog-icon>
              </v-btn>
            </template>
            <div
              class="corridor_setup"
              style="
                padding: 4px 8px;
                color: var(--text-default);
                background: var(--card-background);
                user-select: none;
              "
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  font-size: 1.2rem;
                  font-weight: bold;
                  width: 100%;
                  padding: 4px 6px;
                  margin-bottom: 1rem;
                "
              >
                {{
                  `${
                    localization[lang].app.settings.race_results.by_judge
                      .corridor
                  } ${cor_idx + 1}`
                }}

                <v-btn
                  color="var(--error)"
                  icon
                  small
                  style="margin-left: auto"
                  @click="
                    competition.result_formula.types[0][
                      `doubleUp_cor${cor_idx}_dialog`
                    ] = false
                  "
                >
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </div>
              <div
                class="judges"
                style="
                  display: flex;
                  align-items: center;
                  flex-wrap: wrap;
                  margin: 0 4px;
                  padding: 4px 0 0 4px;
                  background: var(--standard-background);
                "
              >
                <div
                  v-for="judge in competition.stuff.judges"
                  :key="`judge_${judge.id}`"
                  style="
                    margin: 0 4px 4px 0;
                    font-size: 1.2rem;
                    font-weight: bold;
                    padding: 4px 6px;
                    border-radius: 2px;
                    background: var(--card-background);
                    cursor: pointer;
                  "
                  @click="
                    !competition.result_formula.types[0].doubleUp_corridors[
                      cor_idx
                    ].includes(judge) &&
                      competition.result_formula.types[0].doubleUp_corridors[
                        cor_idx
                      ].push(judge)
                  "
                >
                  {{
                    `${localization[lang].app.scoring.judge_short} ${judge.id}`
                  }}
                </div>
              </div>
              <div
                class="corridor_judges"
                style="
                  display: flex;
                  flex-direction: column;
                  margin: 0.5rem 6px 4px 6px;
                  padding-bottom: 4px;
                  height: 180px;
                  background: var(--standard-background);
                  overflow-y: auto;
                "
              >
                <div style="padding: 4px 6px; font-weight: bold">
                  Corridor judges:
                </div>
                <div
                  v-for="judge in competition.result_formula.types[0]
                    .doubleUp_corridors[cor_idx]"
                  :key="`judgeCor_${judge.id}`"
                  style="
                    flex: 0 0 auto;
                    display: flex;
                    flex-wrap: nowrap;
                    align-items: center;
                    margin: 4px 2px 0 2px;
                    border-radius: 2px;
                    padding: 2px 4px;
                    background: var(--card-background);
                  "
                >
                  {{ `Judge ${judge.id}` }}

                  <v-btn
                    color="var(--error)"
                    icon
                    style="margin-left: auto"
                    x-small
                    @click="
                      competition.result_formula.types[0].doubleUp_corridors[
                        cor_idx
                      ].splice(
                        competition.result_formula.types[0].doubleUp_corridors[
                          cor_idx
                        ].indexOf(judge),
                        1
                      )
                    "
                  >
                    <v-icon small>mdi-minus</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-dialog>
        </div>
      </div>
      <div
        style="
          display: flex;
          flex-wrap: wrap;
          margin: 4px 2px 2px 2px;
          border-radius: 2px;
          min-height: 1rem;
          padding: 4px;
          background: var(--standard-background);
        "
      >
        <div
          v-for="judge in competition.result_formula.types[0]
            .doubleUp_corridors[cor_idx]"
          :key="`cor${cor_idx}_${judge._id}`"
          style="
            padding: 4px 6px;
            font-weight: bold;
            font-size: 1.1rem;
            margin: 0 2px 2px;
          "
        >
          {{ `${localization[lang].app.scoring.judge_short} ${judge.id}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SettingsCogIcon from "../../../assets/icons/settingsCog-icon.vue";

export default {
  name: "doubleUpSettings",
  components: { SettingsCogIcon },
  props: ["competition"],
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
  },
};
</script>

<style scoped>
.corridorSettings__button {
}
.corridorSettings__button__icon {
  height: 16px;
}
</style>
