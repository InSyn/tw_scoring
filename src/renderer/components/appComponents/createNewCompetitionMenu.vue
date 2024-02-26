<template>
  <v-dialog
    @keydown.enter.prevent="createNewCompetition()"
    v-if="competition"
    v-model="create_competition_dialog.state"
    class="createNewCompetitionMenu__dialog"
    width="540"
    overlay-color="var(--accent)"
    overlay-opacity="0.1"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="createNewCompetitionMenu__button"
        @click="initCreateDialog()"
        v-on="on"
        style="margin-left: 2rem"
        icon
        :color="$vuetify.theme.themes[appTheme].accent"
      >
        <v-icon>{{ newCompetitionIcon }}</v-icon>
      </v-btn>
    </template>
    <div
      class="createNewCompetitionMenu__wrapper"
      :style="{
        backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        color: $vuetify.theme.themes[appTheme].textDefault,
      }"
    >
      <div class="createNewCompetitionMenu__title">Создание соревнования</div>
      <div
        style="
          display: flex;
          flex-direction: column;
          border-radius: 6px;
          margin: 0 8px;
        "
        :style="{
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
        }"
      >
        <div
          tabindex="1"
          style="
            flex: 0 0 auto;
            display: flex;
            flex-wrap: wrap;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            margin: 8px 8px 8px 8px;
            outline: none;
          "
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          }"
        >
          <div
            style="
              font-size: 1.1rem;
              font-weight: bold;
              width: 100%;
              padding: 4px 0 8px 0;
            "
          >
            Настройка нового соревнования
          </div>
          <div
            v-for="input in create_competition_dialog.data"
            :key="input.id"
            v-show="input.hasOwnProperty('value')"
            class="competitionConstructorInput"
            style="display: flex; flex-direction: column; margin: 0.2rem 0.5rem"
          >
            <div
              style="
                flex: 0 0 auto;
                font-size: 0.8rem;
                line-height: 1.2;
                padding: 2px 6px 0 6px;
                margin-left: 6px;
                margin-right: auto;
                border-radius: 6px 6px 0 0;
                transition: background-color 122ms;
              "
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
            >
              {{ input.title }}
            </div>
            <div style="display: flex; align-items: center; flex: 0 0 auto">
              <div
                v-if="input.id === 'stage'"
                tabindex="0"
                @focus="
                  (e) => {
                    input.stage_selector = true;
                    e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].accent}`;
                  }
                "
                @blur="
                  (e) => {
                    input.stage_selector = false;
                    e.target.parentNode.parentNode.children[0].style.backgroundColor = `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`;
                  }
                "
                style="
                  position: relative;
                  flex: 1 0 auto;
                  padding: 4px 8px;
                  border-radius: 6px;
                  outline: none;
                  cursor: pointer;
                  overflow: visible;
                  width: 14rem;
                "
                :style="{
                  color: $vuetify.theme.themes[appTheme].textDefault,
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                }"
              >
                <div
                  v-if="input.stage_selector"
                  style="
                    position: absolute;
                    z-index: 1;
                    top: 0;
                    left: 0;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    border-radius: 6px;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                    border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                  }"
                >
                  <v-hover
                    v-for="(stage, s_idx) in competition.structure.stages"
                    :key="stage.id"
                    v-slot:default="{ hover }"
                  >
                    <div
                      @click="input.selectStage(stage, $event)"
                      style="flex: 0 0 auto; padding: 4px 8px"
                      :style="[
                        {
                          color: $vuetify.theme.themes[appTheme].textDefault,
                        },
                        s_idx === 0 && { borderRadius: `6px 6px 0 0` },
                        s_idx === competition.structure.stages.length - 1 && {
                          borderRadius: `0 0 6px 6px`,
                        },
                        hover && {
                          backgroundColor:
                            $vuetify.theme.themes[appTheme]
                              .subjectBackgroundRGBA,
                        },
                      ]"
                    >
                      {{ stage.title }}
                    </div>
                  </v-hover>
                </div>
                <div>
                  {{ input.value && input.value.title }}
                </div>
              </div>
              <input
                v-else
                @focus="handleInputState($event, 'focus')"
                @blur="handleInputState($event, 'blur')"
                type="text"
                v-model="
                  typeof input.value === 'object'
                    ? input.value && input.value.value
                    : input.value
                "
                size="24"
                style="
                  border-radius: 6px;
                  padding: 4px 8px;
                  border: 1px solid transparent;
                  transition: border 122ms;
                "
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              />
              <input
                v-if="input.hasOwnProperty('min')"
                v-model="input.min"
                @focus="handleInputState($event, 'focus')"
                @blur="handleInputState($event, 'blur')"
                type="text"
                size="8"
                style="
                  border-radius: 6px;
                  padding: 4px 8px;
                  margin-left: 0.4rem;
                  border: 1px solid transparent;
                  transition: border 122ms;
                "
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              />
              <input
                v-if="
                  input.id === 'stage' &&
                  input.value &&
                  input.value.id === 'custom'
                "
                v-model="input.value.value"
                @focus="handleInputState($event, 'focus')"
                @blur="handleInputState($event, 'blur')"
                type="text"
                size="16"
                style="
                  border-radius: 6px;
                  padding: 4px 8px;
                  margin-left: 0.4rem;
                  border: 1px solid transparent;
                  transition: border 122ms;
                "
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              />
            </div>
          </div>
        </div>
        <div
          style="
            display: flex;
            flex-wrap: wrap;
            flex: 0 0 auto;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            margin: 0 8px 8px 8px;
          "
          :style="{
            backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          }"
        >
          <v-btn
            v-for="(check, ch_idx) in create_competition_dialog.checks"
            :key="ch_idx"
            @click="check.state = !check.state"
            style="
              flex: 0 1 calc(50% - 8px);
              display: flex;
              justify-content: flex-start;
              align-items: center;
              flex-wrap: nowrap;
              cursor: pointer;
              margin: 0 8px 4px 0;
            "
            :color="$vuetify.theme.themes[appTheme].success"
            text
            small
          >
            <div
              style="
                flex: 0 0 auto;
                border-radius: 50%;
                width: 10px;
                height: 10px;
                transition: box-shadow 0.122s, background-color 0.122s;
              "
              :style="[
                {
                  boxShadow: `0 0 0 2px ${$vuetify.theme.themes[appTheme].textDefault}`,
                },
                check.state && {
                  boxShadow: `0 0 2px 1px ${$vuetify.theme.themes[appTheme].success}`,
                  backgroundColor: $vuetify.theme.themes[appTheme].success,
                },
              ]"
            ></div>
            <div
              style="margin-left: 0.5rem"
              :style="{
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
            >
              {{ check.title }}
            </div>
          </v-btn>
        </div>
      </div>

      <v-card-actions
        style="
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: nowrap;
        "
      >
        <v-btn
          text
          small
          @click="create_competition_dialog.state = false"
          :color="$vuetify.theme.themes[appTheme].error"
        >
          {{ localization[lang].app.dialogs.d_cancel }}
        </v-btn>
        <v-btn
          small
          @click="createNewCompetition()"
          :color="$vuetify.theme.themes[appTheme].success"
        >
          {{ localization[lang].app.dialogs.d_create }}
        </v-btn>
      </v-card-actions>
    </div>
  </v-dialog>
</template>

<script>
import { mdiFolderPlus } from "@mdi/js";
import EventClass from "../../store/Classes/EventClass";
import { mapGetters } from "vuex";

export default {
  name: "createNewCompetitionMenu",
  props: ["competition"],
  methods: {
    createNewCompetition() {
      for (let $check in this.create_competition_dialog.checks)
        if (this.create_competition_dialog.checks[$check].state)
          this.create_competition_dialog.checks[$check].check();

      this.$store.commit(
        "main/createCompetition",
        new EventClass(...this.create_competition_dialog.data)
      );

      this.create_competition_dialog.data.forEach((_field) => {
        if (
          _field.id === "judges" ||
          _field.id === "jury" ||
          _field.id === "competitors"
        )
          _field[_field.id] = [];

        if (_field.id === "competitorsSheet") _field["headers"] = [];
      });

      this.create_competition_dialog.state = false;

      if (this.$route.name !== "competitionSettings")
        this.$router.push("/competition_settings");
    },
    handleInputState(event, type) {
      switch (type) {
        case "focus":
          for (let childrenKey in event.target.parentNode.children) {
            typeof event.target.parentNode.children[childrenKey] === "object"
              ? (event.target.parentNode.children[
                  childrenKey
                ].style.border = `1px solid ${
                  this.$vuetify.theme.themes[this.appTheme].accent
                }`)
              : 0;
          }
          event.target.parentNode.parentNode.children[0].style.backgroundColor = `${
            this.$vuetify.theme.themes[this.appTheme].accent
          }`;
          break;
        case "blur":
          for (let childrenKey in event.target.parentNode.children) {
            typeof event.target.parentNode.children[childrenKey] === "object"
              ? (event.target.parentNode.children[
                  childrenKey
                ].style.border = `1px solid transparent`)
              : 0;
          }
          event.target.parentNode.parentNode.children[0].style.backgroundColor = `${
            this.$vuetify.theme.themes[this.appTheme].standardBackgroundRGBA
          }`;
          break;
        default:
          return null;
      }
    },
    initCreateDialog() {
      this.create_competition_dialog.data.forEach((_field) => {
        if (this.competition.mainData.hasOwnProperty(_field.id)) {
          _field.value = this.competition.mainData[_field.id].value;
        } else if (_field.id === "stage")
          _field.value = JSON.parse(
            JSON.stringify(this.competition.mainData["title"].stage.value)
          );
        if (_field.hasOwnProperty("min"))
          _field.min = this.competition.mainData[_field.id].min;
      });
    },
  },
  data() {
    return {
      newCompetitionIcon: mdiFolderPlus,
      create_competition_dialog: {
        state: false,
        data: [
          { id: "title", title: "Competition title", value: null },
          {
            id: "discipline",
            title: "Дисциплина",
            value: null,
            min: null,
          },

          {
            id: "stage",
            title: "Этап",
            value: null,
            stage_selector: false,
            selectStage: (stage, event) => {
              this.create_competition_dialog.data.find(
                (field) => field.id === "stage"
              ).value = stage;
              event.target.parentNode.parentNode.parentNode.parentNode.parentNode.focus();
            },
          },

          { id: "country", title: "Страна", value: null },
          { id: "location", title: "Место", value: null },
          { id: "provider", title: "Организация", value: null },
          { id: "providerTiming", title: "Дата-сервис", value: null },
          { id: "codex", title: "Codex", value: null },

          { id: "competitorsSheet", headers: [] },
          { id: "competitors", competitors: [] },
          { id: "judges", judges: [] },
          { id: "jury", jury: [] },
        ],
        checks: {
          judgesFromPrevStage: {
            state: true,
            title: "Перенести судей",
            check: () => {
              for (let $judge of this.competition.stuff.judges) {
                this.create_competition_dialog.data
                  .find((_data) => _data.id === "judges")
                  ["judges"].push(JSON.parse(JSON.stringify($judge)));
              }
            },
          },
          juryFromPrevStage: {
            state: true,
            title: "Перенести жюри",
            check: () => {
              for (let $jury of this.competition.stuff.jury) {
                this.create_competition_dialog.data
                  .find((_data) => _data.id === "jury")
                  ["jury"].push(JSON.parse(JSON.stringify($jury)));
              }
            },
          },
          competitorsSheetFromPrevStage: {
            state: true,
            title: "Перенести таблицу участников",
            check: () => {
              for (let $header of this.competition.competitorsSheet.header) {
                this.create_competition_dialog.data
                  .find((_data) => _data.id === "competitorsSheet")
                  ["headers"].push(JSON.parse(JSON.stringify($header)));
              }
            },
          },
          competitorsFromPrevStage: {
            state: false,
            title: "Перенести участников",
            check: () => {
              for (let $competitor of this.competition.competitorsSheet
                .competitors) {
                this.create_competition_dialog.data
                  .find((_data) => _data.id === "competitors")
                  ["competitors"].push(JSON.parse(JSON.stringify($competitor)));
              }
            },
          },
        },
      },
    };
  },
  computed: {
    ...mapGetters("main", { appTheme: "appTheme" }),
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
  },
};
</script>

<style scoped>
.createNewCompetitionMenu__title {
  padding: 8px;
  font-size: 1.4rem;
  font-weight: bold;
}
</style>
