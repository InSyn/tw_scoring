<template>
  <div
    class="timing_wrapper"
    style="height: 100%;display:flex;flex-wrap: nowrap"
  >
    <div
      class="intermediates"
      style="flex: 0 0 auto;display:flex;flex-direction: column;flex-wrap: wrap;height: 100%;"
    >
      <div
        class="intermediate_wrapper"
        v-for="int in intermediates"
        :key="int.id"
        style="flex: 0 0 auto;min-height: 200px;height: 50%;max-height: 100%;width: 240px;display:flex;flex-direction: column;resize: vertical;overflow-y:auto"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
          borderWidth: '2px 2px 0 0',
          borderStyle: 'solid solid solid solid',
          borderColor: `${$vuetify.theme.themes[appTheme].standardBackgroundRGBA} ${$vuetify.theme.themes[appTheme].standardBackgroundRGBA} transparent transparent`
        }"
      >
        <div
          @click="times.push(new TimeClass('', int.id, new Date(Date.now())))"
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
              @dblclick="time.isValid = !time.isValid"
              v-for="(time, t_idx) in times.filter(
                _time => _time.int_id === int.id
              )"
              :key="t_idx"
              style="flex: 0 0 auto;display:flex;flex-wrap: nowrap"
            >
              <div
                style="display:flex;align-items: center;width: 2rem;padding: 2px 4px"
              >
                <div
                  style="height: 1rem;width: 1rem;border-radius: 50%"
                  :style="[
                    !time.isValid && {
                      backgroundColor: $vuetify.theme.themes[appTheme].error
                    },
                    time.isValid &&
                      !time.bib && {
                        backgroundColor:
                          $vuetify.theme.themes[appTheme].action_yellow
                      },
                    time.isValid &&
                      time.bib && {
                        backgroundColor: $vuetify.theme.themes[appTheme].success
                      }
                  ]"
                ></div>
              </div>
              <div style="width: 4rem;padding: 2px 4px">
                <input
                  v-model.lazy="time.bib"
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
                {{ getDiff(time.time, time.time + 7243) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="result_info_wrapper"
      style="display:flex;flex-direction: column;flex-wrap: nowrap;margin-left: auto;width: 240px;height: 100%;overflow-y: auto"
    >
      <div
        class="history_wrapper"
        style="flex: 0 0 auto;width: 100%;height: 35%;overflow-y: auto;resize: vertical"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
        }"
      >
        <div
          style="height: 2rem;padding: 2px 4px;font-weight: bold;"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
          }"
        >
          История
        </div>
        <div style="height:calc(100% - 2rem);">
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
                { width: 'calc(100% - 6rem)' },
                { backgroundColor: $vuetify.theme.themes[appTheme].accent }
              ]"
            >
              result
            </div>
          </div>
        </div>
      </div>
      <div
        class="results_wrapper"
        style="flex: 0 0 auto;width: 100%;height: 35%;overflow-y: auto;resize: vertical"
        :style="{
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA
        }"
      >
        <div
          style="height: 2rem;padding: 2px 4px;font-weight: bold;"
          :style="{
            backgroundColor:
              $vuetify.theme.themes[appTheme].subjectBackgroundRGBA
          }"
        >
          Результаты
        </div>
        <div style="height:calc(100% - 2rem);">
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
                { width: 'calc(100% - 6rem)' },
                { backgroundColor: $vuetify.theme.themes[appTheme].accent }
              ]"
            >
              result
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
  methods: {
    getDiff(time_Start, time_Finish) {
      return (time_Finish - time_Start) / 1000;
    }
  },
  data() {
    return {
      intermediates: [
        { id: 0, title: "Start" },
        { id: 2, title: "Int1" },
        { id: 3, title: "Int2" },
        { id: 1, title: "Finish" }
      ],
      times: []
    };
  },
  computed: {
    ...mapGetters("main", {
      appTheme: "appTheme"
    }),
    ...mapGetters("timing", {
      TimeClass: "TimeClass"
    })
  }
};
</script>

<style scoped>
* {
  /*border: 1px solid #3b70a9;*/
}
</style>
