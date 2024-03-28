<template>
  <div
    tabindex="0"
    @focus="competition_select = true"
    @blur="competition_select = false"
    style="
      position: relative;
      min-width: 200px;
      max-width: 320px;
      margin-left: 0.5rem;
      border-radius: 4px;
      z-index: 1001;
      outline: none;
    "
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
      color: $vuetify.theme.themes[appTheme].textDefault,
    }"
  >
    <v-hover v-slot:default="{ hover }">
      <div
        style="
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          max-width: 100%;
          overflow: hidden;
          font-weight: bold;
          border-radius: 6px;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.122s, border 0.122s;
        "
        :style="[
          {
            border: `1px solid ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
          },
          hover && {
            backgroundColor:
              $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
            border: `1px solid ${$vuetify.theme.themes[appTheme].subjectBackgroundRGBA}`,
          },
        ]"
      >
        <div
          style="
            flex: 1 0 auto;
            display: flex;
            flex-direction: column;
            white-space: nowrap;
            padding: 0.4rem;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              font-size: 0.75rem;
              flex: 0 0 auto;
              line-height: 1;
            "
            :style="{
              color: $vuetify.theme.themes[appTheme].accent,
            }"
          >
            <div style="margin-right: auto; font-weight: bold">
              {{ competitions.indexOf(competition) + 1 }}
            </div>
            <div>{{ `ID: ${competition && competition.id}` }}</div>
          </div>
          <div style="flex: 0 0 auto; margin-top: 0.2rem">
            {{
              `${event.event_title}. ${
                competition &&
                competition.mainData.title.stage.value &&
                competition.mainData.title.stage.value.value
              }`
            }}
          </div>
        </div>
      </div>
    </v-hover>

    <div
      v-if="competitions.some((_comp) => _comp.id !== competition.id)"
      style="
        position: absolute;
        z-index: 3;
        border-radius: 6px;
        white-space: nowrap;
        top: 0;
        left: 0;
        overflow: hidden;
        min-width: 100%;
        transform: scaleY(0);
        transform-origin: top;
      "
      :style="[
        {
          boxShadow: `0 2px 4px 0 ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA}`,
        },
        competition_select && {
          transform: 'scaleY(1)',
          backgroundColor:
            $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
          border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
        },
      ]"
    >
      <div
        @click="select_competition($event, competition)"
        style="
          padding: 0.4rem 0.8rem;
          font-weight: bold;
          cursor: default;
          user-select: none;
        "
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
        }"
      >
        {{
          `${competitions.indexOf(competition) + 1} ${
            competition &&
            competition.mainData.title.stage.value &&
            competition.mainData.title.stage.value.value
          } ${competition && competition.mainData.title.stage.group}`
        }}
      </div>
      <v-hover
        v-for="(_competition, c_id) in competitions"
        :key="_competition.id"
        v-slot:default="{ hover }"
      >
        <div
          @click="select_competition($event, _competition)"
          style="
            padding: 0.4rem 0.8rem;
            cursor: pointer;
            user-select: none;
            transition: border 0.122s, background-color 0.122s;
          "
          :style="[
            {
              borderTop: `1px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
              borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
            },
            competition.id === _competition.id && {
              backgroundColor:
                $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
            },
            hover && {
              borderTop: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
              borderBottom: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
              backgroundColor:
                $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
            },
            c_id < 1 && { borderTop: `null` },
            c_id >= competitions.length - 1 && { borderBottom: `null` },
          ]"
        >
          {{
            `${competitions.indexOf(_competition) + 1} ${
              _competition.mainData.title.stage.value &&
              _competition.mainData.title.stage.value.value
            } ${_competition && _competition.mainData.title.stage.group}`
          }}
        </div>
      </v-hover>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "competitionSelectMenu",
  props: ["competition", "competitions", "event"],
  methods: {
    select_competition(e, competition) {
      this.$store.commit("main/setCompetition", competition);
      e.target.parentNode.parentNode.blur();
    },
  },
  data() {
    return {
      competition_select: false,
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme",
    }),
  },
};
</script>

<style scoped></style>
