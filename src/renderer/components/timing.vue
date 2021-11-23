<template>
  <div class="timing_wrapper" style="height: 100%">
    <div
      class="intermediates"
      style="display:flex;flex-direction: column;flex-wrap: wrap;height: 100%;"
      :style="{ width: `${Math.ceil(intermediates.length / 2) * 350}px` }"
    >
      <div
        class="intermediate_wrapper"
        v-for="int in intermediates"
        :key="int.id"
        style="flex: 1 0 50%;display:flex;flex-direction: column"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          borderWidth: '2px 2px 0 0',
          borderStyle: 'solid solid solid solid',
          borderColor: `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA} ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA} transparent transparent`
        }"
      >
        <div
          @click="times.push({ id: int.id, time: new Date(Date.now()) })"
          class="int_title"
          style="font-weight: bold;font-size: 1.05rem;padding: 4px 8px;height: 2rem;"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
          }"
        >
          {{ int.title }}
        </div>
        <div
          class="ints"
          style="display:flex;flex-direction: column;height: calc(100% - 2rem)"
          :style="{}"
        >
          <div
            style="flex: 0 0 auto;display:flex;flex-wrap: nowrap;height: 1.8rem;"
          >
            <div
              style="width: 2rem"
              :style="{
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              }"
            ></div>
            <div
              style="width: 4rem"
              :style="{
                backgroundColor: $vuetify.theme.themes[appTheme].accent
              }"
            >
              bib
            </div>
            <div
              :style="[
                int.title === 'Finish'
                  ? { width: 'calc(100% - 50%)' }
                  : { width: 'calc(100% - 6rem)' },
                { backgroundColor: $vuetify.theme.themes[appTheme].accent }
              ]"
            >
              time
            </div>
            <div
              v-if="int.title === 'Finish'"
              :style="[
                { width: 'calc(100% - 50% - 6rem)' },
                { backgroundColor: $vuetify.theme.themes[appTheme].accent }
              ]"
            >
              result
            </div>
          </div>
          <div
            style="flex: 0 0 auto;height:calc(100% - 1.8rem);overflow-y:auto;"
          >
            <div
              v-for="time in times.filter(_time => _time.id === int.id)"
              style="flex: 0 0 auto;display:flex;flex-wrap: nowrap"
            >
              <div style="width: 2rem;padding: 2px 4px"></div>
              <div style="width: 4rem;padding: 2px 4px">
                <input
                  style="width: 100%;height: 100%;font-weight: bold;"
                  :style="{
                    color: $vuetify.theme.themes[appTheme].textDefault
                  }"
                  type="number"
                />
              </div>
              <div
                style="padding: 2px 4px"
                :style="
                  int.title === 'Finish'
                    ? { width: 'calc(100% - 50%)' }
                    : { width: 'calc(100% - 6rem)' }
                "
              >
                {{
                  `${time.time.getHours()}:${time.time.getMinutes()}:${time.time.getSeconds()}.${time.time.getMilliseconds()}`
                }}
              </div>
              <div
                v-if="int.title === 'Finish'"
                style="padding: 2px 4px"
                :style="{ width: 'calc(100% - 50% - 6rem)' }"
              >
                {{ getDiff() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "timing",
  getDiff(time_Start, time_Finish) {
    return (time_Finish - time_Start) / 1000;
  },
  data() {
    return {
      intermediates: [
        { id: 0, title: "Start" },
        { id: 2, title: "Int1" },
        { id: 3, title: "Int2" },
        { id: 1, title: "Finish" }
      ],
      times: [
        { id: 0, time: new Date(Date.now()), bib: "101" },
        { id: 0, time: new Date(Date.now()), bib: "102" },
        { id: 1, time: new Date(Date.now()), bib: "101" },
        { id: 1, time: new Date(Date.now()), bib: "102" },
        { id: 2, time: new Date(Date.now()), bib: "101" },
        { id: 2, time: new Date(Date.now()), bib: "102" }
      ]
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme"
    })
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #3b70a9;*/
}
</style>
