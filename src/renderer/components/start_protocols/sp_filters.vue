<template>
  <div
    class="d-flex flex-column justify-start"
    style="border-radius: 6px; width: 100%; height: 100%; padding: 16px"
    :style="{
      backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
    }"
  >
    <div style="font-size: 1.2rem; font-weight:bold;margin-bottom: 1rem">
      Настройка фильтров
    </div>
    <div style="display:flex;flex-wrap: wrap">
      <div
        style="display:flex;flex-wrap: nowrap;align-items: stretch;padding: .5rem 4px"
      >
        <div
          style="flex: 0 0 auto; display:flex;align-items: center;padding: 2px 4px;font-weight:bold;"
        >
          Выбрать заезд
        </div>
        <div
          style="flex: 0 1 auto;display:flex;align-items: center;flex-wrap: wrap;margin-left: 1rem;padding: 4px .5rem 4px 4px;border-radius: 6px;min-width: 4rem"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].standardBackgroundRGBA
          }"
        >
          <v-hover
            v-for="race in competition.races"
            :key="race.id"
            v-slot:default="{ hover }"
          >
            <div
              style="flex: 0 0 auto;display:flex;align-items: center;padding: 4px 8px;margin-left: .5rem;border-radius: 6px;cursor:pointer;transition: background-color .112s"
              :style="hover && { backgroundColor: `rgba(255,255,255,.2)` }"
              @click="
                competition.protocol_settings.start_protocols.filters
                  .race_filter === race
                  ? (competition.protocol_settings.start_protocols.filters.race_filter = null)
                  : (competition.protocol_settings.start_protocols.filters.race_filter = race)
              "
            >
              <div
                style="border-radius: 50%;height: 12px;width: 12px;transition: background-color .112s"
                :style="
                  (competition.protocol_settings.start_protocols.filters
                    .race_filter === race && {
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
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "filters",
  mounted() {
    this.competition.protocol_settings.start_protocols.filters.race_filter = null;
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" })
  }
};
</script>

<style scoped></style>
