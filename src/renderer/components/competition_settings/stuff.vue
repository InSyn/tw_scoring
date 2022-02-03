<template>
  <div style="min-height: 100%;">
    <v-row no-gutters style="height: 100%;">
      <v-col class="pr-2" cols="6">
        <div
          style="min-height: 100%;"
          :style="{
            borderRadius: `6px`,
            background: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
          }"
        >
          <div class="d-flex justify-center align-center">
            <div
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              style="font-weight: bold; font-size: 1.2rem"
            >
              Жюри
            </div>
            <v-btn
              @click="competition.stuff.jury.push(new JuryClass())"
              class="mr-4"
              icon
              :color="$vuetify.theme.themes[appTheme].accent"
              style="margin-left: 1rem;"
              ><v-icon>mdi-account-plus</v-icon></v-btn
            >
          </div>
          <div class="flex-column pa-2">
            <v-row
              class="align-center px-2 pb-4 pt-6 mb-2"
              style="position: relative; font-size: 0.9rem; border-radius: 6px"
              :style="[
                {
                  background:
                    $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
                },
                jury.connected !== undefined && {
                  border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                }
              ]"
              no-gutters
              v-for="(jury, jr) in competition.stuff.jury"
              :key="jr"
            >
              <v-col class="d-flex align-center pa-1" cols="12"
                ><div>Должность:</div>
                <input
                  :readonly="jury.connected !== undefined"
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.jury[jr].title"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="12"
                ><div>Имя:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.jury[jr].name"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="12"
                ><div>Фамилия:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.jury[jr].lastName"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="12"
                ><div>Город:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.jury[jr].loc"
              /></v-col>
              <div
                v-if="jury.connected !== undefined"
                style="position:absolute;top: 4px;left: 8px; font-weight:bold;font-size: 0.9rem"
                :style="[
                  { color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA },
                  jury.connected && {
                    color: $vuetify.theme.themes[appTheme].accent
                  }
                ]"
              >
                online
              </div>
              <div style="position:absolute; top: 4px; right: 32px">
                <v-icon
                  v-if="jury.connected !== undefined"
                  style="width: 0.6rem;"
                  :color="$vuetify.theme.themes[appTheme].accent"
                  >mdi-alpha-c</v-icon
                >
                <v-icon
                  v-if="jury.connected !== undefined"
                  style="width: 0.6rem;"
                  :color="$vuetify.theme.themes[appTheme].accent"
                  >mdi-alpha-j</v-icon
                >
              </div>
              <v-btn
                small
                icon
                style="position:absolute; top: 2px; right: 4px"
                :disabled="jury.connected !== undefined"
                @click="
                  competition.stuff.jury.splice(
                    competition.stuff.jury.indexOf(jury),
                    1
                  )
                "
                color="red"
              >
                <v-icon small>mdi-close</v-icon></v-btn
              >
              <span
                v-if="jury.connected !== undefined"
                style="display: block; transition: background-color 192ms, box-shadow 192ms; position:absolute; border-radius: 4px; bottom: 8px; left: 50%; transform: translateX(-50%); height: 4px; width: 48px;"
                :style="
                  competition.stuff.jury[jr].connected
                    ? {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].success,
                        boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].success}`
                      }
                    : {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        boxShadow: `none`
                      }
                "
              ></span>
            </v-row>
          </div>
        </div>
      </v-col>
      <v-col class="pr-2" cols="6">
        <div
          style="min-height: 100%;"
          :style="{
            borderRadius: `6px`,
            background: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`
          }"
        >
          <div
            class="d-flex justify-center align-center"
            style="position:relative;"
          >
            <div
              :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
              style="font-weight: bold; font-size: 1.2rem"
            >
              Судьи
            </div>
            <v-btn
              @click="
                competition.stuff.judges.push(
                  new JudgeClass(
                    'Судья',
                    competition.stuff.judges.length > 0
                      ? competition.stuff.judges[
                          competition.stuff.judges.length - 1
                        ].id + 1
                      : 1
                  )
                )
              "
              icon
              :color="$vuetify.theme.themes[appTheme].accent"
              style="margin-left: 1rem;"
              ><v-icon>mdi-account-plus</v-icon></v-btn
            >
            <v-icon
              class="pa-2"
              :color="$vuetify.theme.themes[appTheme].accent"
              style="position:absolute; top: 0; right: 0;"
              >mdi-account-group-outline</v-icon
            >
          </div>
          <div class="flex-column px-2">
            <v-row
              class="align-center px-2 pb-4 pt-6 mb-2"
              style="position: relative; font-size: 0.9rem; border-radius: 6px"
              :style="{
                background:
                  $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
              }"
              no-gutters
              v-for="(judge, jd) in competition.stuff.judges"
              :key="jd"
              ><div
                v-if="judge.connected !== undefined"
                style="position:absolute;top: 4px;left: 8px; font-weight:bold;font-size: 0.9rem"
                :style="[
                  { color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA },
                  judge.connected && {
                    color: $vuetify.theme.themes[appTheme].accent
                  }
                ]"
              >
                online
              </div>
              <v-col class="d-flex align-center pa-1" cols="3"
                ><div class="font-weight-bold">ID:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].id"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="9"
                ><input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].title"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="6"
                ><div>Имя:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].name"/></v-col
              ><v-col class="d-flex align-center pa-1" cols="6"
                ><div>Категория:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].category"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="12"
                ><div>Фамилия:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].lastName"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="8"
                ><div>Город:</div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].location"
              /></v-col>
              <v-col class="d-flex align-center pa-1" cols="4"
                ><div style="display:flex;align-items: center">
                  <v-icon small :color="$vuetify.theme.themes[appTheme].accent"
                    >mdi-remote</v-icon
                  >
                  ID:
                </div>
                <input
                  @focus="
                    $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                  "
                  @blur="
                    $event.target.style.borderBottom = `1px solid transparent`
                  "
                  class="pa-1 ml-1 font-weight-bold"
                  style="width: 100%; border-radius: 6px; border-bottom: 1px solid transparent; transition: border-bottom-color 192ms"
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].remoteId"
              /></v-col>
              <v-btn
                small
                icon
                style="position:absolute; top: 2px; right: 4px"
                @click="remove_judge(judge._id)"
                color="red"
              >
                <v-icon small>mdi-close</v-icon></v-btn
              >
              <span
                @click="force_disconnect(judge.socket_id)"
                style="display: block; cursor:pointer; transition: background-color 192ms, box-shadow 192ms; position:absolute; border-radius: 4px; bottom: 8px; left: 50%; transform: translateX(-50%); height: 4px; width: 48px;"
                :style="
                  competition.stuff.judges[jd].connected
                    ? {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].success,
                        boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].success}`
                      }
                    : {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme]
                            .standardBackgroundRGBA,
                        boxShadow: `none`
                      }
                "
              ></span>
            </v-row>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "stuff",
  methods: {
    force_disconnect(socket_id) {
      this.$store.commit("main/force_disconnect", socket_id);
    },
    remove_judge(judge_id) {
      this.competition.stuff.judges = this.competition.stuff.judges.filter(
        _judge => {
          return _judge._id !== judge_id;
        }
      );
      this.competition.competitorsSheet.competitors.forEach(_competitor => {
        _competitor.marks = _competitor.marks.filter(_mark => {
          return _mark.judge_id !== judge_id;
        });
      });
      console.log(`Judge ${judge_id} removed`);
    },
    log(data) {
      console.log(data);
    }
  },
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
    ...mapGetters("roles", { JudgeClass: "JudgeClass", JuryClass: "JuryClass" })
  }
};
</script>

<style scoped></style>
