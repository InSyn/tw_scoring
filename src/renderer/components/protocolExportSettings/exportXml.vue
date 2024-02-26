<template>
  <div
    class="xmlExport__wrapper"
    style="
      display: flex;
      flex-direction: column;
      border-radius: 6px;
      width: 100%;
      height: 100%;
      padding: 16px;
      overflow-y: auto;
    "
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
    }"
  >
    <div class="xml_export_title" style="font-size: 1.2rem; font-weight: bold">
      {{ `${localization[lang].app.protocols.f_export} XML` }}
    </div>
    <!--    <div class="xml_export_settings">-->
    <!--      <div style="display: flex; align-items: center">-->
    <!--        <span>Competition type</span-->
    <!--        ><select-->
    <!--          style="-->
    <!--            margin-left: 1rem;-->
    <!--            padding: 4px 0.5rem;-->
    <!--            font-weight: bold;-->
    <!--            border-radius: 6px;-->
    <!--            outline: none;-->
    <!--          "-->
    <!--          :style="{-->
    <!--            color: $vuetify.theme.themes[appTheme].textDefault,-->
    <!--            backgroundColor:-->
    <!--              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,-->
    <!--          }"-->
    <!--          v-model="type"-->
    <!--        >-->
    <!--          <option v-for="type in types" :key="type">{{ type }}</option>-->
    <!--        </select>-->
    <!--      </div>-->
    <!--    </div>-->
    <div
      class="xml_export_actions"
      style="
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      "
    >
      <v-btn
        small
        depressed
        @click="xml_export([objectToXML, competition])"
        :color="$vuetify.theme.themes[appTheme].standardBackgroundRGBA"
        :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
      >
        <v-icon
          :color="$vuetify.theme.themes[appTheme].textDefault"
          style="margin-right: 0.5rem"
          >mdi-download</v-icon
        >
        {{ localization[lang].app.protocols.b_save }}</v-btn
      >
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "export_xml",
  methods: {
    ...mapActions("main", {
      xml_export: "xml_export",
    }),
  },
  data() {
    return {
      type: "SB",
      types: ["SB", "FS"],
    };
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      competitions: "competitions",
      stageGrid: "stageGrid",
    }),
    ...mapGetters("protocol_settings", {
      results_protocol: "results_protocol",
      export_mode: "export_mode",
    }),

    objectToXML() {
      const _date = this.competition.mainData.date.value.split("-");
      const date = {
        day: _date[2],
        month: _date[1],
        year: _date[0],
      };
      return {
        _declaration: {
          _attributes: {
            version: "1.0",
            encoding: "UTF-8",
          },
        },
        Fisresults: {
          Raceheader: {
            _attributes: {
              Sector: this.type,
              Sex: this.competition.mainData.title.stage.group,
            },
            Season: +date.month >= 7 ? +date.year + 1 : date.year,
            Codex: this.competition.mainData.codex.value,
            Nation: this.competition.mainData.country.value,
            Discipline: this.competition.mainData.discipline.value,
            Category: "FIS",
            Racedate: {
              day: date.day,
              month: date.month,
              year: date.year,
            },
            Eventname: this.competition.mainData.title.value,
            Place: this.competition.mainData.location.value,
          },
          [`${this.type}_race`]: {
            [`${this.type}_raceinfo`]: {},
            [`${this.type}_classified`]: {
              [`${this.type}_ranked`]: [
                ...this.$store.getters["main/flatGrid"]
                  .filter((val) => val.type === "competitorResult")
                  .map((_competitor) => {
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
                          _competitor.competitor.info_data["year"] || "",
                      },
                      [`${this.type}_result`]: {
                        TotalScore: _competitor.result.value,
                      },
                    };
                  }),
              ],
            },
          },
        },
      };
    },
  },
};
</script>

<style scoped></style>
