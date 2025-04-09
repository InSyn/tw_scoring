<script>
import dayjs from 'dayjs';
import { mapGetters } from 'vuex';

export default {
  name: 'date-time-input',
  props: {
    competitionDate: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      dialogDate: false,
      dialogTime: false,
    };
  },
  computed: {
    ...mapGetters('localization', {
      appLang: 'lang',
    }),
    dateValue: {
      get() {
        console.log(this.competitionDate.value);
        return this.competitionDate.value;
      },
      set(value) {
        console.log(value);
        if (!dayjs(value, 'YYYY-MM-DD', true).isValid()) return;

        this.$emit('input-date', value);
      },
    },
    timeValue: {
      get() {
        console.log(this.competitionDate.time);
        return this.competitionDate.time;
      },
      set(value) {
        console.log(value);
        if (!dayjs(this.timeValue, 'HH:mm', true).isValid()) return;

        this.$emit('input-time', value);
      },
    },
  },
  methods: {
    validateTime() {},
  },
};
</script>

<template>
  <div class="dateTime__control__wrapper">
    <!-- Date Field -->
    <div class="controlInput__wrapper">
      <v-text-field v-model="dateValue" label="Дата" placeholder="YYYY-MM-DD" clearable outlined>
        <!-- Button to open the date picker -->
        <template v-slot:append-outer>
          <v-btn icon @click.stop="dialogDate = true" :style="{ color: 'var(--text-default)' }">
            <v-icon>mdi-calendar</v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <!-- Date Picker in a Menu (or Dialog) -->
      <v-menu v-model="dialogDate" :close-on-content-click="false" max-width="290px" offset-y>
        <v-date-picker
          v-model="dateValue"
          :dark="$store.getters['main/appTheme'] === 'dark'"
          color="var(--accent)"
          header-color="var(--background-card)"
          locale="ru"
          scrollable
          @input="dialogDate = false"
        >
        </v-date-picker>
      </v-menu>
    </div>

    <!-- Time Field -->
    <div class="controlInput__wrapper">
      <v-text-field v-model="timeValue" label="Время" placeholder="HH:MM" clearable outlined @blur="validateTime">
        <!-- Button to open the time picker -->
        <template v-slot:append-outer>
          <v-btn icon @click.stop="dialogTime = true" :style="{ color: 'var(--text-default)' }">
            <v-icon>mdi-clock-outline</v-icon>
          </v-btn>
        </template>
      </v-text-field>

      <!-- Time Picker in a Menu (or Dialog) -->
      <v-menu v-model="dialogTime" :close-on-content-click="false" max-width="290px">
        <v-time-picker
          v-model="timeValue"
          :dark="$store.getters['main/appTheme'] === 'dark'"
          color="var(--accent)"
          header-color="var(--background-card)"
          format="24hr"
          locale="ru"
          @input="dialogTime = false"
        >
        </v-time-picker>
      </v-menu>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dateTime__control__wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .controlInput__wrapper {
    flex: 1 1 8ch;
  }
}
.v-text-field {
  background-color: var(--background-deep);
}
</style>
