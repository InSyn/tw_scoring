<template>
  <div
    class="xml_export_wrapper"
    style="display:flex;flex-direction:column;border-radius: 6px;width: 100%;height: 100%;padding: 16px;overflow-y: auto"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div class="xml_export_title" style="font-size: 1.2rem; font-weight:bold;">
      Экспорт XML
    </div>
    <div class="xml_export_settings">
      <div style="display:flex;align-items: center">
        <span>Вид соревнования</span><v-select></v-select>
      </div>
    </div>
    <div
      class="xml_export_actions"
      style="margin-top: auto;display:flex;align-items: center"
    >
      <v-btn
        small
        depressed
        @click="$store.dispatch('main/xml_export', objectToXML)"
        :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
        style="margin-left: auto"
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      >
        <v-icon :color="$vuetify.theme.themes[appTheme].action_green"
          >mdi-xml</v-icon
        >эспорт XML</v-btn
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "fonts",
  mounted() {},
  methods: {
    log(data) {
      console.log(data);
    }
  },
  data() {
    return {
      types: ["SB", "FS"]
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      competitions: "competitions",
      stageGrid: "stageGrid"
    }),
    flatGrid() {
      return [].concat(
        ...this.stageGrid.map(stage => [stage.title, ...stage.s_competitors])
      );
    },
    objectToXML() {
      return {
        _declaration: {
          _attributes: {
            version: "1.0",
            encoding: "UTF-8"
          }
        },
        Fisresults: {
          Raceheader: {
            _attributes: {
              Sector: "FS",
              Sex: this.competition.mainData.title.stage.group
            },
            Season: "2022",
            Codex: this.competition.mainData.codex.value,
            Nation: this.competition.mainData.country.value,
            Discipline: this.competition.mainData.discipline.value,
            Category: "FIS",
            Racedate: {
              day: this.competition.mainData.date.value.split("-")[2],
              month: this.competition.mainData.date.value.split("-")[1],
              year: this.competition.mainData.date.value.split("-")[0]
            },
            Eventname: this.competition.mainData.title.value,
            Place: this.competition.mainData.location.value
          },
          FS_race: {
            FS_raceinfo: {},
            FS_classified: {
              ...this.competition.competitorsSheet.competitors.map(
                _competitor => {
                  return {
                    _attributes: { status: "FS_classified" },
                    Bib: _competitor.info_data["bib"],
                    Lastname: _competitor.info_data["surname"],
                    Firstname: _competitor.info_data["name"]
                  };
                }
              )
            }
          }
        }
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.xml_export_wrapper {
  * {
    //border: 1px solid #c3d9ff;
  }
}
</style>
