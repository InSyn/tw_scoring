<script>
import { mapGetters, mapActions } from 'vuex';
import { getDisciplineCode, getSportDisciplines } from '../../data/sports';
import { defaultStructure } from '../../store/classes/EventClass';

export default {
  name: 'main_data',
  data() {
    return {
      stage_selector: false,
    };
  },
  computed: {
    ...mapGetters('main', {
      event: 'event',
      appTheme: 'appTheme',
      competition: 'competition',
      socket: 'socket',
    }),
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    defaultStructure() {
      return defaultStructure;
    },
    getCompetitionData() {
      if (!this.competition || !this.competition.mainData) return {};
      return this.competition.mainData;
    },
  },
  methods: {
    ...mapActions('main', {
      input_focus: 'input_focus',
      input_blur: 'input_blur',
    }),
    getSportDisciplines,
    getDisciplineCode,
    selectStage(stage, event) {
      this.competition.mainData.title.stage.value = stage;
      event.target.parentNode.parentNode.blur();
    },
  },
};
</script>

<template>
  <div class="d-flex flex-column justify-space-between">
    <v-row v-for="(mainData, md, md_idx) in getCompetitionData" :key="md" :style="md_idx > 0 && { marginTop: '2px' }" no-gutters style="position: relative">
      <v-col class="d-flex align-center" cols="12" style="position: relative">
        <div class="d-flex align-center flex-grow-1 px-2 py-1" style="position: relative; border-radius: 4px; background-color: var(--background-card)">
          <span class="d-block" style="min-width: 11rem; font-weight: bold">{{ localization[lang].app.event.main_data[md] }}</span>

          <v-dialog v-if="md === 'date'" v-model="mainData.dialog" width="300px">
            <template v-slot:activator="{ on }">
              <v-hover v-slot:default="{ hover }">
                <div
                  :style="[
                    hover && {
                      backgroundColor: `var(--subject-background)`,
                    },
                  ]"
                  class="d-flex justify-center ml-2 pa-1"
                  style="border-radius: 2px; cursor: pointer; width: 100%; background-color: var(--background-deep); transition: box-shadow 92ms"
                  v-on="on"
                >
                  {{ mainData.value }}
                </div>
              </v-hover>
            </template>

            <v-date-picker
              v-model="mainData.value"
              :dark="appTheme === 'dark'"
              width="100%"
              color="var(--accent)"
              header-color="var(--background-card)"
              locale="ru"
            ></v-date-picker>

            <v-btn @click="mainData.dialog = false" class="acceptTime__button mt-2" :style="{ color: 'var(--text-default)' }" color="var(--accent)">
              Принять
            </v-btn>
          </v-dialog>

          <v-dialog v-if="md === 'date'" v-model="mainData.time_dialog" width="300px">
            <template v-slot:activator="{ on }">
              <v-hover v-slot:default="{ hover }">
                <div
                  :style="[
                    hover && {
                      backgroundColor: `var(--subject-background)`,
                    },
                  ]"
                  class="d-flex justify-center ml-2 pa-1"
                  style="border-radius: 2px; cursor: pointer; width: 100%; background-color: var(--background-deep); transition: box-shadow 92ms"
                  v-on="on"
                >
                  {{ mainData.time }}
                </div>
              </v-hover>
            </template>

            <v-time-picker
              v-model="mainData.time"
              :dark="appTheme === 'dark'"
              width="100%"
              color="var(--accent)"
              header-color="var(--background-card)"
              format="24hr"
              locale="ru"
            ></v-time-picker>

            <v-btn @click="mainData.time_dialog = false" class="acceptTime__button mt-2" :style="{ color: 'var(--text-default)' }" color="var(--accent)">
              Принять
            </v-btn>
          </v-dialog>
          <input
            v-if="md !== 'date' && md !== 'discipline'"
            v-model="mainData.value"
            class="ml-2 pa-1"
            style="outline: none; border-radius: 2px; width: 100%; color: var(--text-default)"
            type="text"
            @blur="mainData.focus = false"
            @focus="mainData.focus = true"
          />
          <div v-if="md === 'title'" style="display: flex; align-items: center; flex-wrap: nowrap; min-width: 30%">
            <div style="flex-shrink: 0; margin-left: 1rem; font-weight: bold">
              {{ mainData.stage.title }}
            </div>
            <div
              style="
                position: relative;
                display: flex;
                align-items: center;
                flex: 1 0 auto;
                height: 100%;
                border-radius: 2px;
                margin-left: 0.5rem;
                background-color: var(--background-deep);
                outline: none;
                cursor: pointer;
              "
              tabindex="0"
              @blur="stage_selector = false"
              @focus="stage_selector = true"
            >
              <div
                v-if="stage_selector"
                style="
                  position: absolute;
                  z-index: 1;
                  top: 0;
                  left: 0;
                  min-width: 100%;
                  display: flex;
                  flex-direction: column;
                  background-color: var(--background-card);
                  border: 1px solid var(--accent);
                  border-radius: 4px;
                "
              >
                <v-hover v-for="stage in defaultStructure.stages" :key="stage.id" v-slot:default="{ hover }">
                  <div
                    :style="[
                      hover && {
                        backgroundColor: 'var(--subject-background)',
                      },
                    ]"
                    style="flex: 0 0 auto; padding: 2px 4px"
                    @click="selectStage(stage, $event)"
                  >
                    {{ stage.title }}
                  </div>
                </v-hover>
              </div>
              <div style="padding: 4px 8px; flex: 0 0 auto">
                {{
                  competition.mainData.title.stage.value.id === 'custom'
                    ? competition.mainData.title.stage.value.title[0]
                    : competition.mainData.title.stage.value.title
                }}
              </div>
            </div>
            <div
              v-if="competition.mainData.title.stage && competition.mainData.title.stage.value.id === 'custom'"
              style="display: flex; flex-grow: 1; margin-left: 0.4rem; overflow: hidden"
            >
              <input
                v-model="competition.mainData.title.stage.value.value"
                style="flex: 1 0 auto; padding: 4px 8px; border-radius: 2px; max-width: 100%"
                type="text"
                @blur="mainData.focus = false"
                @focus="mainData.focus = true"
              />
            </div>
          </div>
          <select
            v-if="md === 'discipline'"
            id="group__input"
            v-model="competition.mainData.discipline.value"
            class="ml-2 pa-1"
            style="width: 100%"
            type="text"
          >
            <option v-for="(discipline, idx) in getSportDisciplines(event.sport)" :key="`${idx}_${discipline.code}`" :value="discipline.name_rus">
              {{ discipline.name_rus }}
            </option>
          </select>
          <div
            v-if="md === 'discipline'"
            class="discipline-min ml-2 pa-1"
            style="align-self: stretch; outline: none; border-radius: 2px; width: 6rem"
            type="text"
          >
            {{ getDisciplineCode(competition.mainData.discipline.value) }}
          </div>
          <label v-if="md === 'discipline'" for="group__input" style="font-weight: bold; margin-left: 12px">
            {{ localization[lang].app.event.main_data.group }}
          </label>
          <select
            v-if="md === 'discipline'"
            id="group__input"
            v-model="competition.mainData.title.stage.group"
            class="ml-2 pa-1"
            style="border-radius: 2px; width: 6rem"
            type="text"
          >
            <option v-for="group in ['men', 'women']" :key="group" :value="group">{{ group }}</option>
          </select>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.discipline-min {
  padding: 3px 6px;
  background-color: var(--background-deep);
  border-radius: 2px;
  text-align: center;
  font-weight: bold;
  overflow: hidden;
}
</style>
