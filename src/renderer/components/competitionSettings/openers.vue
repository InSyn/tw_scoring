<template>
  <div class="openers__wrapper">
    <div class="openers__title">
      <div class="openers__title__value">
        {{ localization[lang].app.event.forerunners }}
      </div>
      <v-btn
        @click="addOpener"
        class="openers__title__addOpener__button"
        text
        :color="$vuetify.theme.themes[appTheme].accent"
      >
        <v-icon class="openers__title__addOpener__button__icon">
          mdi-account-plus
        </v-icon>
      </v-btn>
    </div>
    <div class="openers__list__wrapper">
      <div
        v-for="(opener, o) in competition.stuff.openers"
        :key="o"
        class="opener__list__item"
      >
        <div
          class="pa-2"
          style="
            position: relative;
            border-radius: 6px;
            background: var(--card-background);
          "
        >
          <v-btn
            icon
            @click="competition.stuff.openers.splice(o, 1)"
            small
            color="red"
            style="position: absolute; top: 0; right: 0"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
          <v-row no-gutters>
            <v-col class="font-weight-bold pa-1" cols="12">
              <span>{{ `Открывающий ${opener.num}` }}</span>
            </v-col>
            <v-col class="d-flex align-center pa-1" cols="3">
              <div>Номер:</div>
              <input
                @focus="
                  $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                "
                @blur="
                  $event.target.style.borderBottom = `1px solid transparent`
                "
                v-model="opener.bib"
                style="
                  width: 100%;
                  margin-left: 0.5rem;
                  padding: 2px 4px;
                  border-radius: 6px;
                  transition: border-bottom 92ms;
                  border-bottom: 1px solid transparent;
                  background: var(--standard-background);
                  color: var(--text-default);
                "
            /></v-col>
            <v-col class="d-flex align-center pa-1" cols="9">
              <div>Фамилия:</div>
              <input
                @focus="
                  $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                "
                @blur="
                  $event.target.style.borderBottom = `1px solid transparent`
                "
                v-model="opener.lastName"
                style="
                  margin-left: 0.5rem;
                  padding: 2px 4px;
                  transition: border-bottom 92ms;
                  border-bottom: 1px solid transparent;
                  width: 100%;
                  border-radius: 6px;
                  background: var(--standard-background);
                  color: var(--text-default);
                "
            /></v-col>
            <v-col class="d-flex align-center pa-1" cols="6">
              <div>Имя:</div>
              <input
                @focus="
                  $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                "
                @blur="
                  $event.target.style.borderBottom = `1px solid transparent`
                "
                v-model="opener.name"
                style="
                  margin-left: 0.5rem;
                  padding: 2px 4px;
                  transition: border-bottom 92ms;
                  border-bottom: 1px solid transparent;
                  width: 100%;
                  border-radius: 6px;
                  background: var(--standard-background);
                  color: var(--text-default);
                "
            /></v-col>
            <v-col class="d-flex align-center pa-1" cols="6">
              <div>Регион:</div>
              <input
                @focus="
                  $event.target.style.borderBottom = `1px solid ${$vuetify.theme.themes[appTheme].accent}`
                "
                @blur="
                  $event.target.style.borderBottom = `1px solid transparent`
                "
                v-model="opener.location"
                style="
                  margin-left: 0.5rem;
                  padding: 2px 4px;
                  transition: border-bottom 92ms;
                  border-bottom: 1px solid transparent;
                  width: 100%;
                  border-radius: 6px;
                  background: var(--standard-background);
                  color: var(--text-default);
                "
            /></v-col>
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import OpenerClass from "../../store/Classes/OpenerClass";

export default {
  name: "openers",
  methods: {
    addOpener() {
      this.competition.stuff.openers.push(
        new OpenerClass(
          this.competition.stuff.openers.length < 1
            ? this.competition.stuff.openers.length + 1
            : this.competition.stuff.openers[
                this.competition.stuff.openers.length - 1
              ].num + 1
        )
      );
    },
  },
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
  },
};
</script>

<style scoped>
.openers__wrapper {
  padding: 8px;
  border-radius: 6px;
  background: var(--card-background);
}
.openers__title {
  display: flex;
  align-items: center;
}
.openers__title__value {
  font-weight: bold;
  font-size: 1.2rem;
}
.openers__title__addOpener__button {
  margin-left: auto;
}
.openers__list__wrapper {
  margin-top: 8px;
  padding: 8px;
  background: var(--standard-background);
  border-radius: 6px;
}
.opener__list__item {
  flex: 0 0 auto;
  font-size: 0.9rem;
}
.opener__list__item:not(:last-child) {
  margin-bottom: 8px;
}
</style>
