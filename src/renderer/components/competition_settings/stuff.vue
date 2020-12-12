<template>
  <div style="min-height: 100%;">
    <v-row no-gutters style="height: 100%;">
      <v-col class="pr-2" cols="6">
        <div
          style="min-height: 100%;"
          :style="{
            borderRadius: `6px`,
            background: styles.cardBackground
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
              ><v-icon>mdi-plus</v-icon></v-btn
            >
          </div>
          <div class="flex-column pa-2">
            <v-row
              class="align-center px-2 pb-4 pt-6 mb-2"
              style="position: relative; font-size: 0.9rem; border-radius: 6px"
              :style="[
                { background: styles.subjectBackground },
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
                    backgroundColor: styles.cardBackground,
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
                    backgroundColor: styles.cardBackground,
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
                    backgroundColor: styles.cardBackground,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.jury[jr].surName"
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
                    backgroundColor: styles.cardBackground,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.jury[jr].loc"
              /></v-col>
              <v-icon
                v-if="jury.connected !== undefined"
                style="position:absolute; top: 4px; right: 24px"
                :color="$vuetify.theme.themes[appTheme].accent"
                >mdi-alpha-j</v-icon
              >
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
                        backgroundColor: styles.standardBackground,
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
            background: styles.cardBackground,
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
                      : 0
                  )
                )
              "
              class="mr-4"
              icon
              :color="$vuetify.theme.themes[appTheme].accent"
              ><v-icon>mdi-plus</v-icon></v-btn
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
              :style="{ background: styles.subjectBackground }"
              no-gutters
              v-for="(judge, jd) in competition.stuff.judges"
              :key="jd"
            >
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
                    backgroundColor: styles.cardBackground,
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
                    backgroundColor: styles.cardBackground,
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
                    backgroundColor: styles.cardBackground,
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
                    backgroundColor: styles.cardBackground,
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
                    backgroundColor: styles.cardBackground,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].surName"
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
                    backgroundColor: styles.cardBackground,
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="text"
                  v-model="competition.stuff.judges[jd].location"
              /></v-col>
              <v-btn
                small
                icon
                style="position:absolute; top: 2px; right: 4px"
                @click="
                  competition.stuff.judges.splice(
                    competition.stuff.judges.indexOf(judge),
                    1
                  )
                "
                color="red"
              >
                <v-icon small>mdi-close</v-icon></v-btn
              >
              <span
                style="display: block; transition: background-color 192ms, box-shadow 192ms; position:absolute; border-radius: 4px; bottom: 8px; left: 50%; transform: translateX(-50%); height: 4px; width: 48px;"
                :style="
                  competition.stuff.judges[jd].connected
                    ? {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].success,
                        boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].success}`
                      }
                    : {
                        backgroundColor: styles.standardBackground,
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
  computed: {
    ...mapGetters("main", ["competition", "appTheme"]),
    ...mapGetters("roles", ["JudgeClass", "JuryClass"]),
    styles() {
      return {
        cardBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].cardBackground.r
        },
        ${this.$vuetify.theme.themes[this.appTheme].cardBackground.g},
        ${this.$vuetify.theme.themes[this.appTheme].cardBackground.b},
        ${this.$vuetify.theme.themes[this.appTheme].cardBackground.a})`,
        standardBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].standardBackground.r
        },
        ${this.$vuetify.theme.themes[this.appTheme].standardBackground.g},
        ${this.$vuetify.theme.themes[this.appTheme].standardBackground.b},
        ${this.$vuetify.theme.themes[this.appTheme].standardBackground.a})`,
        subjectBackground: `rgba(${
          this.$vuetify.theme.themes[this.appTheme].subjectBackground.r
        },
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.g},
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.b},
        ${this.$vuetify.theme.themes[this.appTheme].subjectBackground.a})`
      };
    }
  }
};
</script>

<style scoped></style>
