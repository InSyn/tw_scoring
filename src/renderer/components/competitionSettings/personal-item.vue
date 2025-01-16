<script>
import MDragEventEmitterMixin from '../mixins/MDragEventEmitterMixin';

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
};
</script>

<template>
  <div
    class="stuffCard__wrapper"
    :style="
      juryObj.connected !== undefined && {
        border: '1px solid var(--accent)',
      }
    "
  >
    <div class="stuffDataField__wrapper" data-fieldType="position">
      <div class="stuffParameter__title">Позиция</div>
      <input class="stuffParameter__input" type="text" v-model="competition.stuff.jury[index].title" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="lastname">
      <div class="stuffParameter__title">Фамилия</div>
      <input class="stuffParameter__input" type="text" v-model="competition.stuff.jury[index].lastName" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="name">
      <div class="stuffParameter__title">Имя</div>
      <input class="stuffParameter__input" type="text" v-model="competition.stuff.jury[index].name" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="region">
      <div class="stuffParameter__title">Регион</div>
      <input class="stuffParameter__input" type="text" v-model="competition.stuff.jury[index].location" />
    </div>

    <div class="stuffDataField__wrapper" data-fieldType="category">
      <div class="stuffParameter__title">Кат.</div>
      <input class="stuffParameter__input" type="text" v-model="competition.stuff.jury[index].category" />
    </div>

    <div v-if="juryObj.id === 'chief'" class="stuffActions__wrapper">
      <div
        @click="$emit('toggle-abc', juryObj.id)"
        style="
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          padding: 4px 8px;
          background: var(--background-deep);
          border-radius: 6px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          user-select: none;
        "
      >
        ABC
        <div
          style="
            margin-left: 1rem;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            transition: 122ms;
            background-color: var(--subject-background);
            box-shadow: none;
          "
          :style="
            juryObj.setABC && {
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 2px 2px var(--success)',
            }
          "
        ></div>
      </div>
    </div>

    <div
      v-if="juryObj.connected !== undefined"
      style="position: absolute; top: 4px; left: 8px; font-weight: bold; font-size: 0.9rem; color: var(--background-card)"
      :style="[
        juryObj.connected && {
          color: 'var(--accent)',
        },
      ]"
    >
      Online
    </div>

    <div
      v-if="juryObj.connected !== undefined"
      style="position: absolute; top: 4px; right: 32px; color: var(--accent); font-size: 1.25rem; font-weight: bold; letter-spacing: 2px"
    >
      CJ
    </div>

    <v-btn
      small
      icon
      style="position: absolute; top: 2px; right: 4px"
      :disabled="juryObj.connected !== undefined"
      @click="competition.stuff.jury.splice(competition.stuff.jury.indexOf(juryObj), 1)"
      color="var(--error)"
    >
      <v-icon small>mdi-close</v-icon>
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
