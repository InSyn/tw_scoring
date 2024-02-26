<template>
  <div
    style="
      flex: 1 0 auto;
      padding: 8px;
      color: var(--text-default);
      background: var(--card-background);
      border-radius: 6px;
    "
  >
    <div style="margin-bottom: 8px; font-size: 1.2rem; font-weight: bold">
      {{ localization[lang].app.settings.stages.title }}
    </div>

    <div
      style="
        display: flex;
        flex-wrap: wrap;
        min-height: 4rem;
        padding: 8px;
        background: var(--standard-background);
        border-radius: 6px;
      "
    >
      <div
        v-for="_competition in competitions.filter(
          (_comp) => _comp.id !== competition.id
        )"
        :key="_competition.id"
        style="
          flex: 0 0 calc(25% - 4px);
          margin: 0 4px 4px 0;
          border-radius: 6px;
          overflow: hidden;
          background: var(--card-background);
          border: 1px solid var(--standard-background);
          transition: border 0.112s;
        "
        :style="[
          competition &&
            competition.stages.prev_stages.some(
              (_comp) => _comp === _competition.id
            ) && {
              border: `1px solid var(--accent)`,
            },
          stageUsed(_competition) && {
            border: `1px solid var(--action-darkYellow)`,
          },
        ]"
      >
        <div class="title" style="padding: 4px">
          <!--          <div style="margin-right: 1rem; font-weight: bold">-->
          <!--            {{ _competition.mainData.title.value || "" }}-->
          <!--          </div>-->

          <div
            :style="[
              competition &&
                competition.stages.prev_stages.some(
                  (_comp) => _comp === _competition.id
                ) && {
                  background: 'var(--accent)',
                },
              stageUsed(_competition) && {
                background: 'var(--action-darkYellow)',
              },
            ]"
            style="
              padding: 2px;
              background: var(--subject-background);
              border-radius: 6px;
              transition: background 0.112s;
            "
          >
            <div style="padding: 2px 1rem">
              {{
                `${localization[lang].app.settings.stages.stage} ${
                  _competition.mainData.title.stage.value
                    ? _competition.mainData.title.stage.value.value
                    : ""
                }`
              }}
            </div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: nowrap; align-items: center">
          <div
            :style="[
              competition &&
                competition.stages.prev_stages.some(
                  (_comp) => _comp === _competition.id
                ) && {
                  transform: 'scaleX(1)',
                },
              stageUsed(_competition) && {
                transform: 'scaleX(1)',
                background: 'var(--action-darkYellow)',
              },
            ]"
            style="
              display: flex;
              align-items: center;
              flex-wrap: nowrap;
              margin-top: auto;
              margin-right: 1rem;
              padding: 4px 0.5rem;
              overflow: hidden;
              transform: scaleX(0);
              border-top-right-radius: 6px;
              transform-origin: left;
              transition: transform 0.112s;
              background: var(--accent);
            "
          >
            <div
              v-if="!stageUsed(_competition)"
              style="overflow: hidden; white-space: nowrap; font-weight: bold"
            >
              {{ localization[lang].app.settings.stages.passed_number }}
            </div>

            <input
              v-if="!stageUsed(_competition)"
              v-model="
                competitions.find((_comp) => _comp.id === _competition.id)
                  .passed_competitors
              "
              style="
                padding: 2px 4px;
                margin-left: 0.4rem;
                width: 4rem;
                background: var(--card-background);
                color: var(--text-default);
                border-radius: 6px;
                font-weight: bold;
              "
              type="number"
              @change="checkPassedInput"
            />

            <div
              v-else
              style="
                display: flex;
                align-items: center;
                padding: 2px 4px;
                font-weight: bold;
              "
            >
              {{
                competitions.find((_comp) => _comp.id === _competition.id)
                  .passed_competitors
              }}

              <v-icon color="var(--text-default)" small
                >mdi-arrow-right
              </v-icon>
            </div>
          </div>

          <v-hover v-slot:default="{ hover }">
            <div
              style="
                display: flex;
                align-items: center;
                margin-left: auto;
                cursor: pointer;
              "
              @click="
                !stageUsed(_competition) && add_prev_stage(_competition.id)
              "
            >
              <div
                :style="
                  competition &&
                  competition.stages.prev_stages.some(
                    (_comp) => _comp === _competition.id
                  ) && { color: 'var(--accent)' }
                "
                style="
                  color: var(--standard-background);
                  font-weight: bold;
                  font-size: 0.95rem;
                "
              >
                Comp_id:&nbsp{{ _competition.id }}
              </div>

              <v-btn :disabled="stageUsed(_competition)" icon>
                <v-icon
                  v-if="
                    competition &&
                    competition.stages.prev_stages.some(
                      (_comp) => _competition.id === _comp
                    )
                  "
                  :color="hover ? 'var(--text-default)' : 'var(--accent)'"
                  >mdi-radiobox-marked
                </v-icon>

                <v-icon
                  v-else
                  :color="hover ? 'var(--accent)' : 'var(--text-default)'"
                  >mdi-radiobox-blank
                </v-icon>
              </v-btn>
            </div>
          </v-hover>
        </div>
      </div>

      <div
        v-if="
          competitions.filter((_comp) => _comp.id !== competition.id).length < 1
        "
        style="font-size: 1.2rem; font-weight: bold"
      >
        <v-icon color="var(--text-default)">mdi-dots-horizontal</v-icon>

        {{ localization[lang].app.settings.stages.no_stages }}
      </div>

      <div
        style="
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-top: 8px;
          padding: 0.5rem 1rem;
          background: var(--card-background);
          border-radius: 6px;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            flex: 0 0 auto;
            width: 100%;
            font-weight: bold;
            font-size: 1.2rem;
            margin: 0 0 0.5rem 0;
          "
        >
          {{ localization[lang].app.settings.stages.stages_grid }}

          <v-tooltip open-delay="512" right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="var(--action-darkYellow)"
                icon
                style="margin-left: auto"
                v-bind="attrs"
                @click="defaultGrid()"
                v-on="on"
              >
                <v-icon>mdi-backup-restore</v-icon>
              </v-btn>
            </template>

            <span>{{
              localization[lang].app.settings.stages.reset_btn
            }}</span></v-tooltip
          >
        </div>

        <div
          style="
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            padding: 6px;
            background: var(--standard-background);
            border-radius: 6px;
          "
        >
          <div
            v-for="(stage, s_idx) in competition.stages.stage_grid"
            :key="s_idx"
            style="
              display: flex;
              flex-wrap: nowrap;
              flex: 0 0 auto;
              align-items: center;
            "
          >
            <div
              v-if="s_idx > 0"
              style="
                margin: auto 0;
                height: 4px;
                width: 16px;
                background: var(--card-background);
              "
            ></div>
            <div
              style="
                display: flex;
                flex-direction: column;
                overflow: hidden;
                padding: 4px;
                border-radius: 4px;
                background: var(--card-background);
              "
            >
              <div style="display: flex; align-items: center; width: 100%">
                <input
                  @blur="
                    $event.target.style.background =
                      'var(--standard-background)'
                  "
                  @focus="
                    $event.target.style.background = 'var(--subject-background)'
                  "
                  v-model="stage.title"
                  style="
                    flex: 1 0 auto;
                    margin-bottom: 6px;
                    padding: 4px 8px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    color: var(--text-default);
                    background: var(--standard-background);
                    border-radius: 2px;
                    transition: background 92ms;
                  "
                  type="text"
                />
              </div>

              <div
                v-for="(_stage, s_idx) in stage.s_competitions"
                :key="`${s_idx}-${_stage}`"
                :style="[
                  {
                    background: 'var(--card-background)',
                    border: `1px solid var(--accent)`,
                  },
                ]"
                style="flex: 0 0 auto; padding: 4px"
              >
                <div
                  v-for="(comp, c_idx) in competitionsInGridSection(_stage)"
                  :key="c_idx"
                  :style="{
                    color: 'var(--text-default)',
                  }"
                  style="display: flex; flex-direction: column"
                >
                  <div
                    style="
                      flex: 0 0 auto;
                      font-size: 0.95rem;
                      font-weight: bold;
                    "
                  >
                    {{
                      comp && comp.mainData && comp.mainData.title
                        ? comp.mainData.title.value
                        : null
                    }}
                  </div>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      font-size: 0.9rem;
                    "
                  >
                    <div style="flex: 0 0 auto">
                      {{
                        comp &&
                        comp.mainData &&
                        comp.mainData.title &&
                        comp.mainData.title.stage &&
                        comp.mainData.title.stage.value
                          ? comp.mainData.title.stage.value.value
                          : null
                      }}
                    </div>
                    <div v-if="comp" style="flex: 0 0 auto; margin-left: auto">
                      <input
                        class="passedCompetitors__input ml-2"
                        style="
                          min-width: 0;
                          width: 2.5rem;
                          padding: 3px 6px;
                          border-radius: 6px;
                          color: var(--text-default);
                          background: var(--standard-background);
                        "
                        type="number"
                        v-bind:value="comp.passed_competitors"
                        @change="setPassedCompetitors($event, comp)"
                      />
                      <v-icon color="var(--text-default)" x-small
                        >mdi-arrow-right
                      </v-icon>
                    </div>
                  </div>
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

export default {
  name: "stagesSetup",
  props: ["competition", "competitions"],
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    add_prev_stage(stage) {
      if (
        this.competition.stages.prev_stages.some((_prev) => _prev === stage)
      ) {
        if (this.competition.stages.lastStageSize > 1) {
          this.competition.stages.stage_grid[
            this.competition.stages.stage_grid.length - 2
          ].s_competitions = JSON.parse(
            JSON.stringify(
              this.competition.stages.stage_grid[
                this.competition.stages.stage_grid.length - 2
              ].s_competitions.filter((_stage) => _stage !== stage)
            )
          );
          this.competitions
            .find((_comp) => _comp.id === stage)
            .stages.stage_grid.filter(
              (_stage) => !_stage.s_competitions.includes(stage)
            )
            .forEach((_stage) =>
              _stage.s_competitions.forEach((_comp) =>
                this.competition.stages.stage_grid.forEach((_grid, g_idx) => {
                  if (_grid.s_competitions.includes(_comp))
                    this.competition.stages.stage_grid[g_idx].s_competitions =
                      _grid.s_competitions.filter(
                        (_competition) => _competition !== _comp
                      );
                })
              )
            );
        } else {
          this.competitions
            .find((_competition) => _competition.id === stage)
            .stages.stage_grid.forEach((_prevGridStage) =>
              _prevGridStage.s_competitions.forEach((_prevGridStageComp) => {
                if (
                  this.competition.stages.stage_grid.find((_stage) =>
                    _stage.s_competitions.includes(_prevGridStageComp)
                  )
                )
                  this.competition.stages.stage_grid.splice(
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find((_stage) =>
                        _stage.s_competitions.includes(_prevGridStageComp)
                      )
                    ),
                    1
                  );
              })
            );
        }
        this.competition.stages.prev_stages =
          this.competition.stages.prev_stages.filter(
            (_stage) => _stage !== stage
          );
        this.competition.stages.lastStageSize--;
      } else {
        if (this.competition.stages.lastStageSize < 1) {
          this.competition.stages.stage_grid.unshift(
            ...JSON.parse(
              JSON.stringify(
                this.competitions.find((_comp) => _comp.id === stage).stages
                  .stage_grid
              )
            )
          );
        } else {
          this.competitions
            .find((_competition) => _competition.id === stage)
            .stages.stage_grid.filter(
              (_stage) => !_stage.s_competitions.includes(stage)
            )
            .forEach((_stage) => {
              _stage.s_competitions.forEach((_comp) => {
                if (
                  !this.competition.stages.stage_grid[
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find(
                        (_stage) => _stage.s_competitions.includes(stage) - 1
                      )
                    )
                  ].s_competitions.includes(_comp)
                )
                  this.competition.stages.stage_grid[
                    this.competition.stages.stage_grid.indexOf(
                      this.competition.stages.stage_grid.find(
                        (_stage) => _stage.s_competitions.includes(stage) - 1
                      )
                    )
                  ].s_competitions.push(_comp);
              });
            });
          this.competition.stages.stage_grid[
            this.competition.stages.stage_grid.length - 2
          ].s_competitions.push(stage);
        }
        this.competition.stages.prev_stages.push(stage);
        this.competition.stages.lastStageSize += 1;
      }
    },
    checkPassedInput(event) {
      if (event.target.value < 0) event.target.value = 0;
      if (event.target.value > 64) event.target.value = 64;
    },
    defaultGrid() {
      this.competition.stages.stage_grid = [
        {
          title: this.competition.mainData.title.stage.value.value,
          s_competitions: [this.competition.id],
        },
      ];
      this.competition.stages.prev_stages = [this.competition.id];
      this.competition.stages.lastStageSize = 0;
    },
    competitionsInGridSection(competition_id) {
      return (
        [this.competitions.find((comp) => comp.id === competition_id)] || []
      );
    },
    setPassedCompetitors(event, competition) {
      competition.passed_competitors = event.target.value;

      this.updateEvent();
    },
    stageUsed(stage) {
      return (
        this.competition &&
        this.competition.stages.stage_grid
          .filter((_prevGrid) => {
            return (
              this.competition.stages.stage_grid.indexOf(_prevGrid) !==
              this.competition.stages.stage_grid.length - 2
            );
          })
          .some((_grid) => {
            return _grid.s_competitions.includes(stage.id);
          })
      );
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

<style scoped>
* {
  /*box-shadow: inset 0 0 1px 0 #c3d9ff;*/
}
.passedCompetitors__input::-webkit-inner-spin-button,
.passedCompetitors__input::-webkit-outer-spin-button {
  display: none;
}
</style>
