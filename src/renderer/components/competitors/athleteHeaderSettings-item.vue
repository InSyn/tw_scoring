<script>
import { mapGetters } from 'vuex';
import MDragEventEmitterMixin from '../mixins/MDragEventEmitterMixin';

export default {
  name: 'athleteHeaderSettings-item',
  props: { competition: { type: Object, default: () => {} }, dataItem: { type: Object, default: () => {} }, idx: Number, columnsToDel: Array },
  mixins: [MDragEventEmitterMixin],
  computed: {
    ...mapGetters('localization', {
      localization: 'localization',
      lang: 'lang',
    }),
  },
};
</script>

<template>
  <div class="competitorsSheetSettings__dialog__dataItem__wrapper">
    <div class="competitorsSheetSettings__dialog__dataItem__container">
      <label for="ID" class="competitorsSheetSettings__dialog__dataItem__label">ID: </label>
      <input
        id="ID"
        class="competitorsSheetSettings__dialog__dataItem__input"
        :value="competition.competitorsSheet.header[idx].id"
        @change="$emit('set-data-value', $event.target.value, competition.competitorsSheet.header[idx], 'id')"
      />
    </div>

    <div class="competitorsSheetSettings__dialog__dataItem__container">
      <label for="Title" class="competitorsSheetSettings__dialog__dataItem__label">Title: </label>
      <input
        id="Title"
        class="competitorsSheetSettings__dialog__dataItem__input"
        :value="competition.competitorsSheet.header[idx].title"
        @change="$emit('set-data-value', $event.target.value, competition.competitorsSheet.header[idx], 'title')"
      />
    </div>

    <v-btn
      class="competitorsSheetSettings__dialog__dataItem__button"
      @click.prevent="$emit('add-col-to-del', competition.competitorsSheet.header[idx])"
      color="var(--action-red)"
      :disabled="dataItem.id === 'bib' || dataItem.id === 'name'"
      text
      x-small
      >{{ localization[lang].app.dialogs.d_delete }}
    </v-btn>

    <div v-if="columnsToDel.includes(dataItem)" class="competitorsSheetSettings__dialog__dataItem__overlay-deleting">
      <v-btn
        class="competitorsSheetSettings__dialog__dataItem__overlay-deleting__button-delete"
        @click="$emit('remove-col-to-del', competition.competitorsSheet.header[idx])"
        text
        small
        >{{ localization[lang].app.dialogs.d_cancel }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
