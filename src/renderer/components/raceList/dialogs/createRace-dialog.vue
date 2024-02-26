<template>
  <v-dialog
    width="720"
    v-model="dialogState"
    @keydown.enter.prevent="createRace"
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="createRace__button" color="var(--success)" text>
        {{ localization[lang].app.races.create_race }}
      </v-btn>
    </template>

    <div class="createRace__dialog__wrapper">
      <div class="createRace__dialog__header">
        <div class="createRace__dialog__title">
          {{
            `${competition.mainData.title.value}/
                  ${competition.mainData.discipline.value}/ ${
              dialogRaceTitle ||
              localization[lang].app.races.race + (competition.races.length + 1)
            }`
          }}

          <v-btn
            class="createRace__dialog__closeButton"
            @click="closeCreateRaceDialog()"
            color="var(--action-red)"
            icon
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="createRace__dialog__raceTitle__wrapper">
          <label for="title" class="createRace__dialog__raceTitle__label">
            {{ localization[lang].app.races.d_title }}
          </label>
          <input
            id="title"
            class="createRace__dialog__raceTitle__input"
            type="text"
            :placeholder="`${localization[lang].app.races.race} ${
              competition.races.length + 1
            }`"
            v-model="dialogRaceTitle"
          />
        </div>
      </div>

      <div class="createRace__dialog__body">
        <div class="createRace__dialog__menu">
          <div class="createRace__dialog__menu__addAll__wrapper">
            <v-btn
              @click="addAll()"
              class="createRace__dialog__menu__addAll__button"
              color="var(--success)"
              :disabled="filtered_list.length < 1"
              small
              text
            >
              <v-icon
                class="createRace__dialog__menu__addAll__button__icon"
                size="24"
                >mdi-playlist-check
              </v-icon>
              {{ localization[lang].app.races.d_add_all }}
            </v-btn>
          </div>

          <div class="createRace__dialog__menu__addFromPrevResults__wrapper">
            <v-btn
              @click="addStartListFromRace(dialogRaceStartListFrom)"
              class="createRace__dialog__menu__addFromPrevResults__button"
              color="var(--accent-light)"
              small
              text
              >{{ localization[lang].app.races.d_prev_race_order }}
              <v-icon
                class="createRace__dialog__menu__addFromPrevResults__button__icon"
                size="24"
                >mdi-arrow-down
              </v-icon>
            </v-btn>

            <div
              @focus="dialogRaceStartListFromSelector = true"
              @blur="dialogRaceStartListFromSelector = false"
              class="createRace__dialog__menu__addFromPrevResults__select__wrapper"
              ref="raceSelector"
              tabindex="0"
            >
              <div
                :class="[
                  'createRace__dialog__menu__addFromPrevResults__select__label',
                  competition.races.length === 0 &&
                    'createRace__dialog__menu__addFromPrevResults__select__label-inactive',
                ]"
              >
                {{
                  dialogRaceStartListFrom
                    ? dialogRaceStartListFrom.title
                    : localization[lang].app.dialogs.d_choose
                }}
              </div>

              <div
                v-if="dialogRaceStartListFromSelector"
                class="createRace__dialog__menu__addFromPrevResults__select__list"
              >
                <div
                  v-if="competition.races.length < 1"
                  class="createRace__dialog__menu__addFromPrevResults__select__item-empty"
                >
                  No available races
                </div>

                <div
                  v-for="race in competition.races"
                  :key="race.id"
                  @click="selectRaceStartListFrom(race)"
                  class="createRace__dialog__menu__addFromPrevResults__select__item"
                >
                  {{ race.title }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="createRace__dialog__competitorsMenu">
          <div class="createRace__dialog__competitorsList__wrapper list-left">
            <div class="createRace__dialog__competitorsList__title">
              {{ localization[lang].app.races.d_available }}
            </div>
            <div class="createRace__dialog__competitorsList">
              <div
                @click="addToStartList(competitor)"
                class="createRace__dialog__competitorsList__item"
                v-for="(competitor, c) in filtered_list"
                :key="c"
              >
                <div class="createRace__dialog__competitorsList__item__name">
                  {{
                    `${
                      competitor.info_data["bib"]
                        ? competitor.info_data["bib"]
                        : " "
                    } ${
                      competitor.info_data["lastname"]
                        ? competitor.info_data["lastname"]
                        : " "
                    } ${
                      competitor.info_data["name"]
                        ? competitor.info_data["name"]
                        : " "
                    }`
                  }}
                </div>

                <v-icon
                  class="createRace__dialog__competitorsList__item__moveButton__icon"
                  color="var(--success)"
                >
                  mdi-arrow-right
                </v-icon>
              </div>
            </div>
          </div>

          <div class="createRace__dialog__competitorsList__wrapper list-right">
            <div class="createRace__dialog__competitorsList__title">
              {{ localization[lang].app.races.d_prev_race_order }}
            </div>
            <div class="createRace__dialog__competitorsList">
              <div
                @click="declineAddToStartList(competitorToRace)"
                class="createRace__dialog__competitorsList__item"
                v-for="(competitorToRace, c_r) in dialogCompetitors"
                :key="c_r"
              >
                <v-icon
                  class="createRace__dialog__competitorsList__item__moveButton__icon"
                  color="var(--action-darkYellow)"
                >
                  mdi-arrow-left
                </v-icon>

                <div class="createRace__dialog__competitorsList__item__name">
                  {{
                    `${
                      competitorToRace.info_data["bib"]
                        ? competitorToRace.info_data["bib"]
                        : " "
                    } ${
                      competitorToRace.info_data["lastname"]
                        ? competitorToRace.info_data["lastname"]
                        : " "
                    } ${
                      competitorToRace.info_data["name"]
                        ? competitorToRace.info_data["name"]
                        : " "
                    }`
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="createRace__dialog__footer">
        <div class="createRace__dialog__competitorsNumber__wrapper">
          {{ localization[lang].app.races.d_num_of_competitors }}:
          <span class="createRace__dialog__competitorsNumber__value">
            {{ dialogCompetitors.length }}
          </span>
        </div>

        <v-btn
          @click="createRace"
          class="createRace__dialog__createRace__button"
          color="var(--success)"
          text
        >
          {{ localization[lang].app.dialogs.d_create }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import RaceClass from "../../../store/Classes/RaceClass";
import { mapGetters } from "vuex";
import RoundClass from "../../../store/Classes/DM/RoundClass";

export default {
  name: "createRace-dialog",
  props: ["competition"],
  methods: {
    addAll() {
      this.filtered_list.forEach((competitor) =>
        this.dialogCompetitors.push(competitor)
      );
    },
    addStartListFromRace(race) {
      if (race && this.dialogRaceStartListFrom)
        this.dialogCompetitors = race._startList.map((_competitor) =>
          this.competition.competitorsSheet.competitors.find(
            (competitor) => competitor.id === _competitor
          )
        );
    },
    addToStartList(competitor) {
      this.dialogCompetitors.push(competitor);
    },
    closeCreateRaceDialog() {
      this.dialogCompetitors = [];
      this.dialogRaceTitle = "";
      this.dialogRaceStartListFromSelector = false;
      this.dialogState = false;
    },
    createRace() {
      let race,
        params = {
          title: this.dialogRaceTitle,
          type: this.competition.structure.types[
            this.competition.structure.selected.type
          ],
          discipline:
            this.competition.structure.disciplines[
              this.competition.structure.selected.discipline
            ],
          competitors: this.dialogCompetitors.map((competitor) => {
            return competitor.id;
          }),
        };

      if (this.competition.dualMoguls_mode) {
        params = { ...params, stageTitle: "Раунд" };
        race = new RoundClass(params);
      } else {
        race = new RaceClass(params);
      }

      this.competition.races.push(race);
      this.selectRace(race);

      this.dialogState = false;
      this.dialogRaceTitle = null;
      this.dialogCompetitors = [];

      this.$store.dispatch("main/updateEvent");

      return race;
    },
    declineAddToStartList(competitorToRace) {
      this.dialogCompetitors.splice(
        this.dialogCompetitors.indexOf(competitorToRace),
        1
      );
    },
    selectRace(race) {
      this.$emit("select-race", race);
    },
    selectRaceStartListFrom(race) {
      this.dialogRaceStartListFrom = race;

      this.$refs["raceSelector"].blur();
    },
  },
  data() {
    return {
      dialogState: false,
      dialogRaceTitle: "",
      dialogCompetitors: [],
      dialogRaceStartListFrom: null,
      dialogRaceStartListFromSelector: false,
    };
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    filtered_list() {
      return this.competition.competitorsSheet.competitors.filter(
        (competitor) => {
          return !this.dialogCompetitors.includes(competitor);
        }
      );
    },
  },
};
</script>

<style scoped>
.createRace__button {
  margin-left: 8px;
}
.createRace__dialog__wrapper {
  background-color: var(--card-background);
  color: var(--text-default);
}
.createRace__dialog__header {
  margin-bottom: 16px;
}
.createRace__dialog__title {
  display: flex;
  align-items: center;
  padding: 8px;

  font-size: 1.4rem;
  font-weight: bold;
}
.createRace__dialog__closeButton {
  margin-left: auto;
}
.createRace__dialog__raceTitle__wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 8px;
}
.createRace__dialog__raceTitle__label {
  font-size: 1.2rem;
  font-weight: bold;
}
.createRace__dialog__raceTitle__input {
  margin-left: 8px;
  padding: 2px 4px;

  color: var(--text-default);
  background-color: var(--standard-background);
  border-radius: 6px;
  font-size: 1.2rem;
}
.createRace__dialog__body {
  margin-bottom: 8px;
}
.createRace__dialog__menu {
  display: flex;
  padding: 8px;
}

.createRace__dialog__menu__addAll__wrapper {
  flex: 1 1 0;
  display: flex;
  align-items: center;
}
.createRace__dialog__menu__addAll__button {
  margin-right: 16px;
}
.createRace__dialog__menu__addAll__button__icon {
  margin-right: 0.5rem;
}

.createRace__dialog__menu__addFromPrevResults__wrapper {
  flex: 1 1 0;
  display: flex;
  align-items: center;
}
.createRace__dialog__menu__addFromPrevResults__button {
  margin-right: 8px;
}
.createRace__dialog__menu__addFromPrevResults__button__icon {
  margin-left: 0.5rem;
}
.createRace__dialog__menu__addFromPrevResults__select__wrapper {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;

  height: 100%;
  border-radius: 6px;

  color: var(--text-default);
  background-color: var(--standard-background);
  outline: none;
  cursor: pointer;
}
.createRace__dialog__menu__addFromPrevResults__select__label {
  padding: 4px 8px;
  flex: 0 0 auto;
  color: var(--text-default);
  font-size: 1.2rem;
  font-weight: bold;
}

/*noinspection CssUnusedSymbol*/
.createRace__dialog__menu__addFromPrevResults__select__label-inactive {
  color: var(--subject-background);
}
.createRace__dialog__menu__addFromPrevResults__select__list {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  min-width: 100%;
  overflow: hidden;

  background-color: var(--card-background);
  border-radius: 6px;
  border: 1px solid var(--accent);
}
.createRace__dialog__menu__addFromPrevResults__select__item-empty {
  padding: 4px 8px;
  white-space: nowrap;
  color: var(--text-default);
}
.createRace__dialog__menu__addFromPrevResults__select__item {
  flex: 0 0 auto;
  padding: 4px 8px;
  font-size: 1.2rem;
  white-space: nowrap;
  color: var(--text-default);
}
.createRace__dialog__menu__addFromPrevResults__select__item:hover {
  background: var(--subject-background);
}

.createRace__dialog__competitorsMenu {
  display: flex;
  flex-wrap: nowrap;
  padding: 8px;
}
.createRace__dialog__competitorsList__wrapper {
  flex: 1 0 0;
}
.createRace__dialog__competitorsList__wrapper.list-left {
  margin-right: 4px;
}
.createRace__dialog__competitorsList__wrapper.list-right {
  margin-left: 4px;
}
.createRace__dialog__competitorsList__title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
  padding: 4px 8px;
}
.createRace__dialog__competitorsList {
  height: 320px;
  overflow-y: auto;

  background-color: var(--standard-background);
}
.list-left .createRace__dialog__competitorsList {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}
.list-right .createRace__dialog__competitorsList {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}
.createRace__dialog__competitorsList__item {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;

  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}
.list-right .createRace__dialog__competitorsList__item {
  padding-left: 28px;
}
.createRace__dialog__competitorsList__item:hover {
  background: var(--subject-background);
}
.createRace__dialog__competitorsList__item__name {
  font-weight: bold;
}
.createRace__dialog__competitorsList__item__moveButton__icon {
  position: absolute;
  display: none;
  font-size: 2rem;
}

/*noinspection CssMissingComma*/
.createRace__dialog__competitorsList__item:hover
  .createRace__dialog__competitorsList__item__moveButton__icon {
  display: block;
}
.list-left .createRace__dialog__competitorsList__item__moveButton__icon {
  right: 2px;
}
.list-right .createRace__dialog__competitorsList__item__moveButton__icon {
  left: 0;
}
.createRace__dialog__footer {
  display: flex;
  padding: 8px;
}
.createRace__dialog__competitorsNumber__wrapper {
  display: flex;
  align-items: center;
  padding: 4px 1rem;

  background-color: var(--standard-background);
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: bold;
}
.createRace__dialog__competitorsNumber__value {
  margin-left: 1rem;
}
.createRace__dialog__createRace__button {
  margin-left: auto;
}
</style>
