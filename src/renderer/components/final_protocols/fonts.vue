<template>
  <div
    style="display:flex;flex-direction:column;border-radius: 6px;width: 100%;height: 100%;padding: 16px;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div
      v-for="(stage, s_idx) in stageGrid"
      :key="s_idx"
      style="flex: 0 0 auto;border-radius: 6px;padding: .4rem 1rem"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA
      }"
    >
      <div style="padding: 2px 4px">{{ stage.title }}</div>
      <div
        v-for="competition in stage.s_competitors"
        :style="{
          border: `1px solid ${$vuetify.theme.themes[appTheme].textDefault}`
        }"
      >
        <div v-for="competitor in competition" style="padding: 4px 6px">
          {{
            `${competitor[1].rank} ${competitor[1].info_data.bib} ${
              competitor[1].info_data.surname
            } ${competitor[1].info_data.name}: ${competitions
              .find(_competition => _competition.id === competitor[0])
              .getResult(competitor[1].id)}`
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
        ? this.competition.stages.stage_grid
            .map(stage => {
              return {
                title: stage.title,
                s_competitors: [
                  ...stage.s_competitions.map(_competition =>
                    this.competitions.find(
                      competition => competition.id === _competition
                    ).races.length > 0
                      ? this.competitions
                          .find(competition => competition.id === _competition)
                          .getSortedByRank(
                            this.competitions
                              .find(
                                competition => competition.id === _competition
                              )
                              .races[
                                this.competitions.find(
                                  competition => competition.id === _competition
                                ).races.length - 1
                              ].finished.map(c_id =>
                                this.competitions
                                  .find(
                                    competition =>
                                      competition.id === _competition
                                  )
                                  .competitorsSheet.competitors.find(
                                    _competitor => _competitor.id === c_id
                                  )
                              )
                          )
                          .map(competitor => [_competition, competitor])
                      : []
                  )
                ]
              };
            })
            .map((_stage, s_idx, grid) => {
              console.log(grid, s_idx, _stage);
              return _stage;
            })
            .reverse()
        : [];
    }
  }
};
</script>

<style scoped></style>
