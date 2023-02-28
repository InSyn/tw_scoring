<template>
  <v-col class="pa-2" cols="4"
    ><div
      style="height: 100%; border-radius: 6px; user-select: none"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
      }"
    >
      <div class="pa-2" style="height: 100%">
        <div
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          }"
          style="
            display: flex;
            align-items: stretch;
            padding: 4px;
            font-size: 1.2rem;
            font-weight: bold;
            border-radius: 6px;
          "
        >
          <input
            class="jumpCode__input"
            v-if="competition.is_aerials && selectedCompetitor"
            type="text"
            v-bind:value="
              selectedCompetitor.info_data[
                `jump${competition.selected_race_id + 1}_code`
              ]
            "
            @change="setAeCode($event)"
          />
          <div
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].textDefault,
              color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            }"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.4rem;
              font-weight: bold;
              border-radius: 6px;
              min-width: 3rem;
              text-align: center;
            "
          >
            {{ selectedCompetitor && selectedCompetitor.info_data["bib"] }}
          </div>
          <div
            class="d-flex justify-center align-center"
            style="margin-left: 1rem"
          >
            {{
              selectedCompetitor &&
              selectedCompetitor.info_data["lastname"].toUpperCase()
            }}
          </div>
          <div
            class="d-flex justify-center align-center"
            style="margin-left: 0.5rem"
          >
            {{ selectedCompetitor && selectedCompetitor.info_data["name"] }}
          </div>
          <v-spacer></v-spacer>
          <div
            style="display: flex; flex-direction: column"
            v-if="competition.result_formula.types[0].doubleUp"
          >
            <v-btn
              v-for="(cor_button, cb_idx) in competition.result_formula.types[0]
                .doubleUp_corridors"
              :key="cb_idx"
              @click="
                competition.selected_race &&
                  competition.selected_race.selectedCompetitor &&
                  setToCorridor(
                    competition.selected_race.selectedCompetitor,
                    cb_idx
                  )
              "
              text
              small
              :color="$vuetify.theme.themes[appTheme].success"
              ><v-icon>mdi-play</v-icon></v-btn
            >
          </div>
          <v-btn
            v-else
            @click="
              competition.selected_race &&
                competition.selected_race.selectedCompetitor &&
                setToTrack(competition.selected_race.selectedCompetitor)
            "
            text
            small
            :color="$vuetify.theme.themes[appTheme].success"
            ><v-icon>mdi-play</v-icon></v-btn
          >
        </div>
        <v-row no-gutters class="pt-2" style="height: calc(100% - 3.6rem)">
          <div
            style="
              height: 100%;
              width: 100%;
              overflow: auto;
              border-radius: 6px;
            "
            :style="{
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
          >
            <div class="pa-1" v-if="competition.selected_race">
              <v-hover
                v-slot:default="{ hover }"
                v-for="competitor in competition.selected_race.startList
                  .map((_comp) => {
                    return competition.competitorsSheet.competitors.find(
                      (comp) => comp && comp.id === _comp
                    );
                  })
                  .filter(
                    (_competitor) =>
                      _competitor.id !==
                      competition.selected_race.selectedCompetitor
                  )"
                :key="competitor.id"
              >
                <div
                  class="d-flex flex-nowrap"
                  tabindex="0"
                  @focus="setFocused($event)"
                  @blur="setBlured($event)"
                  @dblclick="setSelectedCompetitor(competitor.id)"
                  @keypress.enter="setSelectedCompetitor(competitor.id)"
                  style="
                    cursor: pointer;
                    outline: none;
                    width: 100%;
                    border-radius: 6px;
                    transition: box-shadow 92ms, border 92ms;
                  "
                  :style="[
                    {
                      border: `1px solid transparent`,
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    },
                    hover && {
                      border: `1px solid ${$vuetify.theme.themes[appTheme].success}`,
                      boxShadow: `inset 0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`,
                    },
                  ]"
                >
                  <div
                    class="d-flex align-center justify-center"
                    style="
                      width: 2.4rem;
                      font-weight: bold;
                      border-radius: 4px;
                      white-space: nowrap;
                    "
                    :style="{
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].textDefault,
                      color:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    }"
                  >
                    {{ competitor.info_data["bib"] }}
                  </div>
                  <div
                    class="pa-1 d-flex flex-nowrap align-center overflow-hidden"
                    style="font-weight: bold; white-space: nowrap"
                  >
                    {{
                      `${competitor.info_data["lastname"]} ${competitor.info_data["name"]}`
                    }}
                  </div>
                </div></v-hover
              >
            </div>
          </div>
        </v-row>
      </div>
    </div></v-col
  >
</template>

<script>
import axios from "axios";

import { mapActions, mapGetters } from "vuex";
export default {
  name: "startList",
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    setAeCode(e) {
      this.selectedCompetitor.info_data[
        `jump${this.competition.selected_race_id + 1}_code`
      ] = e.target.value;

      this.updateEvent();
    },
    setSelectedCompetitor(competitor_id) {
      this.competition.selected_race.selectedCompetitor = competitor_id;

      this.socket &&
        this.socket.connected &&
        (() => {
          this.socket.emit("set_competition_data", this.competition, (res) => {
            console.log(res);
          });
        })();
    },
    setToTrack(competitor_id) {
      if (this.competition.selected_race.onTrack !== null)
        this.competition.selected_race.startList.unshift(
          this.competition.selected_race.onTrack
        );

      this.competition.selected_race.onTrack = competitor_id;
      this.competition.selected_race.startList =
        this.competition.selected_race.startList.filter((_competitor) => {
          return _competitor !== competitor_id;
        });
      this.competition.selected_race.selectedCompetitor = this.competition
        .selected_race.startList[0]
        ? this.competition.selected_race.startList[0]
        : null;
      this.socket &&
        this.socket.connected &&
        this.socket.emit("set_competition_data", this.competition, (res) => {
          console.log(res);
        });

      // this.setCompetitorToTerminals(
      //   this.competition.competitorsSheet.competitors.find(
      //     (_comp) => _comp.id === competitor_id
      //   )
      // );
    },
    setToCorridor(comp_id, cor_idx) {
      if (
        this.competition.result_formula.types[0].doubleUp_competitors[
          cor_idx
        ] !== null
      )
        this.competition.selected_race.startList.unshift(
          this.competition.result_formula.types[0].doubleUp_competitors[cor_idx]
        );

      this.competition.result_formula.types[0].doubleUp_competitors[cor_idx] =
        comp_id;
      this.competition.selected_race.startList =
        this.competition.selected_race.startList.filter((_competitor) => {
          return _competitor !== comp_id;
        });
      this.competition.selected_race.selectedCompetitor = this.competition
        .selected_race.startList[0]
        ? this.competition.selected_race.startList[0]
        : null;

      this.updateEvent();
    },
    setFocused(e) {
      e.target.style.backgroundColor = `${
        this.$vuetify.theme.themes[this.appTheme].subjectBackgroundRGBA
      }`;
    },
    setBlured(e) {
      e.target.style.backgroundColor = `${
        this.$vuetify.theme.themes[this.appTheme].standardBackgroundRGBA
      }`;
    },
    setCompetitorToTerminals(competitor) {
      const compToSend = {
        name: `${this.transliterate(competitor.info_data.name)}`,
        bip: `${competitor.info_data.bib}`,
        short_name: this.transliterate(
          `${competitor.info_data["lastname"]} ${competitor.info_data.name[0]}.`
        ),
        id_fis: "test",
        status: "1",
        temp1: this.competition.selected_race.id,
        temp2: this.competition.selected_race.title,
      };

      axios
        .post("http://192.168.123.1/ags", compToSend)
        .then((res) => {
          return res;
        })
        .catch((error) => {
          return error;
        });
    },
    transliterate(text) {
      let answer = "",
        a = {};

      a["Ё"] = "YO";
      a["Й"] = "I";
      a["Ц"] = "TS";
      a["У"] = "U";
      a["К"] = "K";
      a["Е"] = "E";
      a["Н"] = "N";
      a["Г"] = "G";
      a["Ш"] = "SH";
      a["Щ"] = "SCH";
      a["З"] = "Z";
      a["Х"] = "H";
      a["Ъ"] = "'";
      a["ё"] = "yo";
      a["й"] = "i";
      a["ц"] = "ts";
      a["у"] = "u";
      a["к"] = "k";
      a["е"] = "e";
      a["н"] = "n";
      a["г"] = "g";
      a["ш"] = "sh";
      a["щ"] = "sch";
      a["з"] = "z";
      a["х"] = "h";
      a["ъ"] = "'";
      a["Ф"] = "F";
      a["Ы"] = "I";
      a["В"] = "V";
      a["А"] = "A";
      a["П"] = "P";
      a["Р"] = "R";
      a["О"] = "O";
      a["Л"] = "L";
      a["Д"] = "D";
      a["Ж"] = "ZH";
      a["Э"] = "E";
      a["ф"] = "f";
      a["ы"] = "i";
      a["в"] = "v";
      a["а"] = "a";
      a["п"] = "p";
      a["р"] = "r";
      a["о"] = "o";
      a["л"] = "l";
      a["д"] = "d";
      a["ж"] = "zh";
      a["э"] = "e";
      a["Я"] = "YA";
      a["Ч"] = "CH";
      a["С"] = "S";
      a["М"] = "M";
      a["И"] = "I";
      a["Т"] = "T";
      a["Ь"] = "'";
      a["Б"] = "B";
      a["Ю"] = "YU";
      a["я"] = "ya";
      a["ч"] = "ch";
      a["с"] = "s";
      a["м"] = "m";
      a["и"] = "i";
      a["т"] = "t";
      a["ь"] = "'";
      a["б"] = "b";
      a["ю"] = "yu";

      for (let i in text) {
        if (text.hasOwnProperty(i)) {
          if (a[text[i]] === undefined) {
            answer += text[i];
          } else {
            answer += a[text[i]];
          }
        }
      }
      return answer;
    },
  },
  computed: {
    ...mapGetters("main", {
      competition: "competition",
      appTheme: "appTheme",
      socket: "socket",
    }),
    selectedCompetitor() {
      if (
        this.competition.selected_race &&
        this.competition.selected_race.selectedCompetitor
      )
        return this.competition.competitorsSheet.competitors.find((_comp) => {
          return _comp.id === this.competition.selected_race.selectedCompetitor;
        });

      return null;
    },
  },
};
</script>

<style scoped>
.jumpCode__input {
  min-width: 0;
  width: 6rem;
  margin-right: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-default);
  background: var(--standard-background);
  border: 1px solid var(--text-default);
}
.jumpCode__input:focus {
  background: var(--subject-background);
  border: 1px solid var(--accent);
}
</style>
