<script>
import MDragEventEmitterMixin from '../mixins/MDragEventEmitterMixin';
import { mapActions } from 'vuex';

export default {
  name: 'personal-item',
  props: {
    competition: {
      type: Object,
      required: true,
      default: () => {},
    },
    juryObj: { type: Object, default: () => {} },
    index: Number,
  },
  mixins: [MDragEventEmitterMixin],
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    setChief(juryObj) {
      if (juryObj.id === 'chief') return;

      this.competition.stuff.jury.forEach((jury, idx) => (jury.id = idx + 1));
      juryObj.id = 'chief';

      this.updateEvent();
    },
  },
};
</script>

<template>
  <div
    class="stuffCard__wrapper"
    style="flex: 0 0 auto"
    :style="{ border: !juryObj.connected ? '1px solid var(--background-deep)' : '1px solid var(--accent)' }"
  >
    <div class="stuffDataField__wrapper" data-fieldType="position">
      <input class="stuffParameter__input" type="text" placeholder="Позиция" draggable="false" v-model="competition.stuff.jury[index].title" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="category">
      <input class="stuffParameter__input" type="text" placeholder="Категория" draggable="false" v-model="competition.stuff.jury[index].category" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="lastname">
      <input class="stuffParameter__input" type="text" placeholder="Фамилия" draggable="false" v-model="competition.stuff.jury[index].lastName" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="name">
      <input class="stuffParameter__input" type="text" placeholder="Имя" draggable="false" v-model="competition.stuff.jury[index].name" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="region">
      <input class="stuffParameter__input" type="text" placeholder="Регион" draggable="false" v-model="competition.stuff.jury[index].location" />
    </div>

    <div class="stuffActions__wrapper">
      <button
        class="tw-button-tiny"
        style="background-color: var(--background-deep); font-size: 0.8rem; font-weight: bold; cursor: pointer; user-select: none"
        @click="$emit('toggle-abc', { id: juryObj.id, stuffType: 'jury' })"
      >
        <span>ABC</span>
        <span
          style="
            display: inline-block;
            margin-left: 1rem;
            height: 8px;
            width: 8px;
            border-radius: 50%;
            transition: 92ms;
            background-color: var(--subject-background);
            box-shadow: none;
          "
          :style="
            juryObj.setABC && {
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 2px 2px var(--success)',
            }
          "
        ></span>
      </button>
    </div>

    <div
      v-if="juryObj.connected"
      style="position: absolute; top: 4px; left: 8px; font-weight: bold; font-size: 0.9rem; color: var(--background-card)"
      :style="[
        juryObj.connected && {
          color: 'var(--accent)',
        },
      ]"
    >
      Online
    </div>

    <button
      class="tw-button-tiny transparent"
      style="position: absolute; top: 4px; right: 32px"
      :style="{ color: juryObj.id === 'chief' ? 'var(--accent)' : 'var(--background-deep)' }"
      @click="setChief(juryObj)"
    >
      Chief
    </button>

    <v-btn
      x-small
      icon
      style="position: absolute; top: 2px; right: 4px"
      @click="competition.stuff.jury.splice(competition.stuff.jury.indexOf(juryObj), 1)"
      color="var(--error)"
    >
      <v-icon x-small>mdi-close</v-icon>
    </v-btn>
    <span
      v-if="juryObj.connected !== undefined"
      style="
        display: block;
        transition: background-color 192ms, box-shadow 192ms;
        position: absolute;
        border-radius: 4px;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        height: 4px;
        width: 48px;
        background-color: var(--background-deep);
        box-shadow: none;
      "
      :style="
        competition.stuff.jury[index].connected && {
          backgroundColor: 'var(--success)',
          boxShadow: '0 0 3px 1px var(--success)',
        }
      "
    ></span>
  </div>
</template>

<style scoped></style>
