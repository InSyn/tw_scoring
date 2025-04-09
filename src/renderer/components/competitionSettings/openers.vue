<template>
  <div class="openers__wrapper" style="flex: 0 0 auto">
    <div class="openers__title">
      <div class="openers__title__value">
        {{ localization[lang].app.event.forerunners }}
      </div>
      <v-btn @click="addOpener" class="openers__title__addOpener__button" text :color="$vuetify.theme.themes[appTheme].accent">
        <v-icon class="openers__title__addOpener__button__icon"> mdi-account-plus </v-icon>
      </v-btn>
    </div>
    <div class="openers__list__wrapper">
      <div v-for="(opener, idx) in competition.stuff.openers" :key="idx" class="opener__list__item">
        <div class="pa-1" style="position: relative; border-radius: 4px; background: var(--background-card)">
          <v-btn icon @click="competition.stuff.openers.splice(idx, 1)" small color="red" style="position: absolute; top: 0; right: 0">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
          <v-row no-gutters>
            <v-col class="font-weight-bold pa-1" cols="12">
              <span>{{ `Открывающий ${idx + 1}` }}</span>
            </v-col>
            <v-col class="d-flex align-center pa-1" cols="3">
              <input style="width: 100%; margin-left: 0.5rem; padding: 2px 4px" type="text" placeholder="Н/Н" v-model="opener.bib" />
            </v-col>
            <v-col class="d-flex align-center pa-1" cols="9">
              <input style="margin-left: 0.5rem; padding: 2px 4px; width: 100%" type="text" placeholder="Фамилия" v-model="opener.lastName" />
            </v-col>
            <v-col class="d-flex align-center pa-1" cols="6">
              <input style="margin-left: 0.5rem; padding: 2px 4px; width: 100%" type="text" placeholder="Имя" v-model="opener.name" />
            </v-col>
            <v-col class="d-flex align-center pa-1" cols="6">
              <input style="margin-left: 0.5rem; padding: 2px 4px; width: 100%" type="text" placeholder="Регион" v-model="opener.location" />
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import OpenerClass from '../../classes/OpenerClass';

export default {
  name: 'openers',
  methods: {
    addOpener() {
      this.competition.stuff.openers.push(
        new OpenerClass(
          this.competition.stuff.openers.length < 1
            ? this.competition.stuff.openers.length + 1
            : this.competition.stuff.openers[this.competition.stuff.openers.length - 1].num + 1
        )
      );
    },
  },
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
    ...mapGetters('main', { competition: 'competition', appTheme: 'appTheme' }),
  },
};
</script>

<style scoped>
.openers__wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 4px;
  background: var(--background-card);
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
  flex: 1 1 0;
  margin-top: 8px;
  padding: 4px;
  background: var(--background-deep);
  border-radius: 4px;
}
.opener__list__item {
  flex: 0 0 auto;
  font-size: 0.9rem;
}
.opener__list__item:not(:last-child) {
  margin-bottom: 4px;
}
</style>
