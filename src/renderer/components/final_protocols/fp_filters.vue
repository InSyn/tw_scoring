<template>
  <div
    class="d-flex flex-column justify-start"
    style="border-radius: 6px; width: 100%; height: 100%; padding: 16px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div style="font-size: 1.2rem; font-weight:bold;">Настройка фильтров</div>
    <div style="display:flex;flex-wrap: wrap;padding: .5rem 1rem">
      <v-hover
        v-for="race in competition.races"
        :key="race.id"
        v-slot:default="{ hover }"
      >
        <div
          style="display:flex;align-items: center;padding: 4px 8px;margin: 0 4px 4px 0;border-radius: 6px;cursor:pointer;transition: background-color .112s"
          :style="hover && { backgroundColor: `rgba(255,255,255,.2)` }"
          @click="
            competition.protocol_settings.result_protocols.result_races.includes(
              race
            )
              ? (competition.protocol_settings.result_protocols.result_races = competition.protocol_settings.result_protocols.result_races.filter(
                  _race => _race.id !== race.id
                ))
              : competition.protocol_settings.result_protocols.result_races.push(
                  race
                )
          "
        >
          <div
            style="border-radius: 50%;height: 12px;width: 12px;transition: background-color .112s"
            :style="
              (competition.protocol_settings.result_protocols.result_races.includes(
                race
              ) && {
                border: `2px solid ${$vuetify.theme.themes[appTheme].accent}`,
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              }) || {
                border: `2px solid ${$vuetify.theme.themes[appTheme].accent}`,
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA
              }
            "
          ></div>
          <div style="margin-left: .5rem; font-weight:bold;">
            {{ race.title }}
          </div>
        </div></v-hover
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "filters",
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" })
  }
};
</script>

<style scoped></style>
