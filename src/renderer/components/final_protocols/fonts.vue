<template>
  <div
    style="display:flex;flex-wrap: wrap;border-radius: 6px;width: 100%;height: 100%;padding: 16px;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-for="(stage, s_idx) in stageGrid"
      :key="s_idx"
      style="overflow-y: auto;border-radius: 6px;padding: .4rem 1rem"
      :style="{ border: `1px solid ${$vuetify.theme.themes[appTheme].accent}` }"
    >
      <div style="padding: 2px 4px">{{ stage.title }}</div>
      <div
        v-for="competition in stage.s_competitors"
        style="border: 1px solid #3a82ba"
      >
        <div
          v-for="competitor in competition"
          style="padding: 4px 6px;border: #3b70a9"
        >
          {{
            `${competitor.rank} ${competitor.info_data.bib} ${competitor.info_data.surname} ${competitor.info_data.name}`
          }}
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  methods: {},
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      competitions: "competitions"
    }),
    stageGrid() {
      return this.competition.stages.stage_grid
        ? this.competition.stages.stage_grid.map(stage => {
            return {
              title: stage.title,
              s_competitors: stage.s_competitions.map(_competition =>
                this.competitions.find(
                  competition => competition.id === _competition
                ).races.length > 0
                  ? this.competitions
                      .find(competition => competition.id === _competition)
                      .getSortedByRank(
                        this.competitions
                          .find(competition => competition.id === _competition)
                          .races[
                            this.competitions.find(
                              competition => competition.id === _competition
                            ).races.length - 1
                          ].finished.map(c_id =>
                            this.competitions
                              .find(
                                competition => competition.id === _competition
                              )
                              .competitorsSheet.competitors.find(
                                _competitor => _competitor.id === c_id
                              )
                          )
                      )
                  : []
              )
            };
          })
        : [];
    }
  }
};
</script>

<style scoped></style>
