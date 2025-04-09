<script>
import { setDeepValue } from '../../../utils/utils';
import { mapGetters } from 'vuex';

export default {
  name: 'competition-date-dialog',
  methods: { setDeepValue },
  props: {
    value: {
      type: String,
      default: new Date().toISOString().substring(0, 10),
    },
  },
  data() {
    return {
      state: false,
    };
  },
  computed: {
    ...mapGetters('main', { appTheme: 'appTheme' }),
  },
};
</script>

<template>
  <v-dialog v-model="state" width="300px">
    <template v-slot:activator="{ on }">
      <div class="dateDialog__control" v-on="on">
        {{ value }}
      </div>
    </template>

    <v-date-picker
      :value="value"
      @input="$emit('input', $event)"
      :dark="appTheme === 'dark'"
      width="100%"
      color="var(--accent)"
      header-color="var(--background-card)"
      locale="ru"
    ></v-date-picker>

    <v-btn @click="state = false" class="acceptTime__button mt-2" :style="{ color: 'var(--text-default)' }" color="var(--accent)"> Принять </v-btn>
  </v-dialog>
</template>

<style lang="scss" scoped>
.dateDialog__control {
  display: flex;
  justify-content: center;
  padding: 0.3rem 0.5rem;
  background-color: var(--background-deep);
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 92ms;
  &:hover {
    background-color: var(--subject-background);
  }
}
</style>
