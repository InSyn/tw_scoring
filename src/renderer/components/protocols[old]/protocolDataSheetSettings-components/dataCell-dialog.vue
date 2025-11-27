<template>
  <div class="dialogButton__wrapper">
    <v-dialog v-model="fieldSettings_dialog" width="500">
      <template v-slot:activator="{ on, attrs }">
        <div v-on="on" v-bind="attrs" class="dataCell__dialog__button">
          {{ `${dataField.params[propertyKey].title || 'пусто'}` }}
        </div>
      </template>
      <v-card style="color: var(--text-default); background-color: var(--background-card)">
        <v-card-title style="padding: 8px 16px">
          {{ localization[lang].app.protocols.cell_settings }}
          <v-btn @click="fieldSettings_dialog = false" style="margin-left: auto" icon>
            <v-icon color="red"> mdi-close </v-icon>
          </v-btn>
        </v-card-title>

        <div style="display: flex; flex-wrap: wrap; padding: 0 16px">
          <div style="width: 100%">
            {{ localization[lang].app.protocols.current_val }}
            <v-btn @click="clearField(fieldProperty)" text small color="var(--accent)" style="margin-left: 1rem">
              {{ localization[lang].app.dialogs.d_clear }}
            </v-btn>
          </div>

          <div v-if="fieldProperty.id" style="width: 100%; display: flex; font-weight: bold">
            <input
              type="text"
              v-model="fieldProperty.id"
              style="border-radius: 6px; padding: 2px 4px; background-color: var(--standard-background); color: var(--text-default)"
            />
            <input
              type="text"
              v-model="fieldProperty.title"
              style="
                margin-left: 1rem;
                border-radius: 6px;
                padding: 2px 4px;
                font-weight: bold;
                background-color: var(--standard-background);
                color: var(--text-default);
              "
            />
          </div>
          <div v-else>
            {{ localization[lang].app.protocols.empty_cell }}
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; max-height: 600px; padding: 8px 16px; overflow-y: auto">
          <div
            v-for="(standard_header, sh_idx) in competition.protocol_settings.result_protocols[protocolFields]"
            :key="sh_idx"
            @click="setField(fieldProperty, standard_header)"
            style="display: flex; flex-wrap: nowrap; flex: 0 0 auto; width: 18rem; margin: 0 0.5rem 0.5rem 0; cursor: pointer; background-color: var(--accent)"
          >
            <div
              style="
                flex: 0 0 auto;
                width: 6rem;
                font-weight: bold;
                padding: 4px 0.5rem;
                background-color: var(--accent);
                color: var(--text-default);
                white-space: nowrap;
              "
            >
              {{ `${standard_header.params.cell_1.id}:` }}
            </div>
            <div
              style="
                flex: 1 0 auto;
                font-weight: bold;
                padding: 4px 0.5rem;
                background-color: var(--text-default);
                color: var(--background-card);
                white-space: nowrap;
              "
            >
              {{ `${standard_header.params.cell_1.title}` }}
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'dataCell-dialog',
  props: ['competition', 'dataField', 'fieldProperty', 'propertyKey', 'protocolFields'],
  methods: {
    clearField(field) {
      field.id = null;
      field.title = null;
      field.handler = function () {
        return 0;
      };

      return field;
    },
    setField(field, header) {
      field.id = header.params.cell_1.id;
      field.title = header.params.cell_1.title;
      field.handler = header.params.cell_1.handler;
    },
  },
  data() {
    return {
      fieldSettings_dialog: false,
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
  },
};
</script>

<style scoped>
.dialogButton__wrapper {
  flex: 1 1 8rem;
}

.dataCell__dialog__button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-right: 6px;
  padding: 4px 6px;

  font-weight: bold;
  background: var(--standard-background);
  border-radius: 2px;
  cursor: pointer;

  transition: background 112ms;
}

.dataCell__dialog__button:hover {
  background: var(--subject-background);
}
</style>
