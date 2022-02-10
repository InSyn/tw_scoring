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
        <span>Вид соревнования</span
        ><select
          style="margin-left: 1rem; padding: 4px .5rem;font-weight:bold;border-radius: 6px;outline: none"
          :style="{
            color: $vuetify.theme.themes[appTheme].textDefault,
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
          v-model="type"
          ><option v-for="type in types" :key="type">{{ type }}</option>
        </select>
      </div>
    </div>
    <div
      class="xml_export_actions"
      style="margin-top: auto;display:flex;align-items: center"
    >
      <v-btn
        small
        depressed
        @click="$store.dispatch('main/xml_export', [objectToXML, competition])"
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
      type: "FS",
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
    objectToXML() {
      console.log("<!--");
      console.log(
        this.$store.getters["main/flatGrid"].filter(
          val => val.type === "competitorResult"
        )
      );
      console.log("--!>");
      const date = {
        day: this.competition.mainData.date.value.split("-")[2],
        month: this.competition.mainData.date.value.split("-")[1],
        year: this.competition.mainData.date.value.split("-")[0]
      };
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
              Sector: this.type,
              Sex: this.competition.mainData.title.stage.group
            },
            Season: +date.month >= 7 ? +date.year + 1 : date.year,
            Codex: this.competition.mainData.codex.value,
            Nation: this.competition.mainData.country.value,
            Discipline: this.competition.mainData.discipline.value,
            Category: "FIS",
            Racedate: {
              day: date.day,
              month: date.month,
              year: date.year
            },
            Eventname: this.competition.mainData.title.value,
            Place: this.competition.mainData.location.value
          },
          [`${this.type}_race`]: {
            [`${this.type}_raceinfo`]: {},
            [`${this.type}_classified`]: {
              [`${this.type}_ranked`]: [
                ...this.$store.getters["main/flatGrid"]
                  .filter(val => val.type === "competitorResult")
                  .map(_competitor => {
                    return {
                      _attributes: { status: "QLF" },
                      Rank: _competitor.s_rank,
                      Bib: _competitor.competitor.info_data["bib"],
                      Competitor: {
                        Fiscode:
                          _competitor.competitor.info_data["fiscode"] || "",
                        Lastname:
                          _competitor.competitor.info_data["lastname"] || "",
                        Firstname:
                          _competitor.competitor.info_data["name"] || "",
                        Sex: this.competition.mainData.title.stage.group,
                        Nation:
                          _competitor.competitor.info_data["nation"] || "",
                        Yearofbirth:
                          _competitor.competitor.info_data["year"] || ""
                      },
                      [`${this.type}_result`]: {
                        TotalScore: _competitor.result
                      }
                    };
                  })
              ]
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
