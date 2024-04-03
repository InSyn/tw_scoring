<template>
  <div class="d-flex flex-column justify-space-between">
    <v-row
      v-for="(mainData, md, md_idx) in competition.mainData"
      :key="md"
      :style="md_idx > 0 && { marginTop: '.5rem' }"
      no-gutters
      style="position: relative"
    >
      <v-col class="d-flex align-center" cols="12" style="position: relative">
        <div
          :style="[
            {
              backgroundColor:
                $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
            },
          ]"
          class="d-flex align-center flex-grow-1 px-2 py-1"
          style="
            position: relative;
            transition: background-color 128ms;
            border-radius: 6px;
          "
        >
          <span class="d-block" style="min-width: 11rem; font-weight: bold">{{
            localization[lang].app.event.main_data[md]
          }}</span>

          <v-dialog
            v-if="md === 'date'"
            v-model="mainData.dialog"
            width="300px"
          >
            <template v-slot:activator="{ on }">
              <v-hover v-slot:default="{ hover }">
                <div
                  :style="[
                    {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    },
                    hover && {
                      boxShadow: `inset 0 -2px 2px ${$vuetify.theme.themes[appTheme].accent}`,
                    },
                  ]"
                  class="d-flex justify-center ml-2 pa-1"
                  style="
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                    transition: box-shadow 128ms;
                  "
                  v-on="on"
                  v-html="mainData.value"
                ></div>
              </v-hover>
            </template>

            <v-date-picker
              v-model="mainData.value"
              :dark="appTheme === 'dark'"
              width="100%"
              :color="$vuetify.theme.themes[appTheme].accent"
              :header-color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
              locale="ru"
            ></v-date-picker>

            <v-btn
              @click="mainData.dialog = false"
              class="acceptTime__button mt-2"
              :style="{ color: 'var(--text-default)' }"
              color="var(--accent)"
            >
              Accept
            </v-btn>
          </v-dialog>

          <v-dialog
            v-if="md === 'date'"
            v-model="mainData.time_dialog"
            width="300px"
          >
            <template v-slot:activator="{ on }">
              <v-hover v-slot:default="{ hover }">
                <div
                  :style="[
                    {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    },
                    hover && {
                      boxShadow: `inset 0 -2px 2px ${$vuetify.theme.themes[appTheme].accent}`,
                    },
                  ]"
                  class="d-flex justify-center ml-2 pa-1"
                  style="
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                    transition: box-shadow 128ms;
                  "
                  v-on="on"
                  v-html="mainData.time"
                ></div>
              </v-hover>
            </template>

            <v-time-picker
              v-model="mainData.time"
              :dark="appTheme === 'dark'"
              width="100%"
              :color="$vuetify.theme.themes[appTheme].accent"
              :header-color="$vuetify.theme.themes[appTheme].cardBackgroundRGBA"
              format="24hr"
              locale="ru"
            ></v-time-picker>

            <v-btn
              @click="mainData.time_dialog = false"
              class="acceptTime__button mt-2"
              :style="{ color: 'var(--text-default)' }"
              color="var(--accent)"
            >
              Accept
            </v-btn>
          </v-dialog>
          <input
            v-if="md !== 'date'"
            v-model="mainData.value"
            :style="[
              {
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              },
            ]"
            class="ml-2 pa-1"
            style="outline: none; border-radius: 6px; width: 100%"
            type="text"
            @blur="mainData.focus = false"
            @focus="mainData.focus = true"
          />
          <div
            v-if="md === 'title'"
            style="
              display: flex;
              align-items: center;
              flex-wrap: nowrap;
              min-width: 30%;
            "
          >
            <div style="flex-shrink: 0; margin-left: 1rem; font-weight: bold">
              {{ mainData.stage.title }}
            </div>
            <div
              :style="{
                color: $vuetify.theme.themes[appTheme].textDefault,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              }"
              style="
                position: relative;
                display: flex;
                align-items: center;
                flex: 1 0 auto;
                height: 100%;
                border-radius: 6px;
                margin-left: 0.5rem;
                outline: none;
                cursor: pointer;
              "
              tabindex="0"
              @blur="stage_selector = false"
              @focus="stage_selector = true"
            >
              <div
                v-if="stage_selector"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                  border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
                }"
                style="
                  position: absolute;
                  z-index: 1;
                  top: 0;
                  left: 0;
                  min-width: 100%;
                  display: flex;
                  flex-direction: column;
                  border-radius: 6px;
                "
              >
                <v-hover
                  v-for="(stage, s_idx) in competition.structure.stages"
                  :key="stage.id"
                  v-slot:default="{ hover }"
                >
                  <div
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
                          $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
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
                  competition.mainData.title.stage.value.id === "custom"
                    ? competition.mainData.title.stage.value.title[0]
                    : competition.mainData.title.stage.value.title
                }}
              </div>
            </div>
            <div
              v-if="
                competition.mainData.title.stage &&
                competition.mainData.title.stage.value.id === 'custom'
              "
              style="
                display: flex;
                flex-grow: 1;
                margin-left: 0.4rem;
                overflow: hidden;
              "
            >
              <input
                v-model="competition.mainData.title.stage.value.value"
                :style="{
                  backgroundColor:
                    $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
                style="
                  flex: 1 0 auto;
                  padding: 4px 8px;
                  border-radius: 6px;
                  max-width: 100%;
                "
                type="text"
                @blur="mainData.focus = false"
                @focus="mainData.focus = true"
              />
            </div>
          </div>
          <input
            v-if="md === 'discipline'"
            v-model="mainData.min"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            class="ml-2 pa-1"
            style="outline: none; border-radius: 6px; width: 6rem"
            type="text"
            @blur="mainData.focus = false"
            @focus="mainData.focus = true"
          />
          <label
            v-if="md === 'discipline'"
            for="group__input"
            style="font-weight: bold; margin-left: 12px"
          >
            {{ localization[lang].app.event.main_data.group }}
          </label>
          <input
            v-if="md === 'discipline'"
            id="group__input"
            v-model="competition.mainData.title.stage.group"
            :style="{
              color: $vuetify.theme.themes[appTheme].textDefault,
              backgroundColor:
                $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
            }"
            class="ml-2 pa-1"
            style="outline: none; border-radius: 6px; width: 6rem"
            type="text"
            @blur="mainData.focus = false"
            @focus="mainData.focus = true"
          />
          <span
            :style="[
              { backgroundColor: $vuetify.theme.themes[appTheme].accent },
              mainData.focus
                ? { transform: 'scaleX(1)' }
                : { transform: 'scaleX(0)' },
            ]"
            class="d-block"
            style="
              position: absolute;
              bottom: 0;
              left: 4px;
              width: calc(100% - 8px);
              border-bottom-left-radius: 50%;
              border-bottom-right-radius: 50%;
              height: 2px;
              transform-origin: left;
              transition: transform 192ms;
            "
          ></span>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "main_data",
  methods: {
    ...mapActions("main", {
      input_focus: "input_focus",
      input_blur: "input_blur",
    }),
    selectStage(stage, event) {
      this.competition.mainData.title.stage.value = stage;
      event.target.parentNode.parentNode.blur();
    },
  },
  data() {
    return {
      stage_selector: false,
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
      competition: "competition",
      socket: "socket",
    }),
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
  },
};
</script>

<style scoped>
* {
  /*border: 1px solid;*/
}
</style>
