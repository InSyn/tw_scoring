<template>
  <div class="dataRow__wrapper">
    <div class="switchArrows__wrapper">
      <v-btn
        class="switchArrow__button"
        @click="shift(dataField, 'up')"
        icon
        color="var(--text-default)"
      >
        <v-icon
          class="switchArrow__button__icon"
          color="var(--standard-background)"
        >
          mdi-chevron-up
        </v-icon>
      </v-btn>
      <v-btn
        class="switchArrow__button"
        @click="shift(dataField, 'down')"
        icon
        color="var(--text-default)"
      >
        <v-icon
          class="switchArrow__button__icon"
          color="var(--standard-background)"
        >
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </div>

    <data-cell-dialog
      :competition="competition"
      :data-field="dataField"
      :field-property="dataField.params['cell_1']"
      property-key="cell_1"
      :protocol-fields="protocolFields"
    ></data-cell-dialog>
    <data-cell-dialog
      :competition="competition"
      :data-field="dataField"
      :field-property="dataField.params['cell_2']"
      property-key="cell_2"
      :protocol-fields="protocolFields"
    ></data-cell-dialog>

    <v-spacer></v-spacer>

    <data-cell-width-control
      :cell-params="
        competition.protocol_settings.result_protocols[protocolFields][
          fieldIndex
        ].params
      "
    ></data-cell-width-control>

    <font-size-control
      :cell-params="
        competition.protocol_settings.result_protocols[protocolFields][
          fieldIndex
        ].params
      "
    ></font-size-control>

    <data-cell-text-align-control
      :cell-params="
        competition.protocol_settings.result_protocols[protocolFields][
          fieldIndex
        ].params
      "
    ></data-cell-text-align-control>

    <font-weight-control
      :cell-params="
        competition.protocol_settings.result_protocols[protocolFields][
          fieldIndex
        ].params
      "
    ></font-weight-control>

    <delete-icon
      class="deleteIcon"
      @click.native="remove_field(dataField.id)"
    ></delete-icon>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import DataCellDialog from "./dataCell-dialog.vue";
import DataFieldWidthIcon from "../../../assets/icons/dataFieldWidth-icon.vue";
import DeleteIcon from "../../../assets/icons/delete-icon.vue";
import DataCellWidthControl from "./dataCellWidth-control.vue";
import FontSizeControl from "./fontSize-control.vue";
import FontWeightControl from "./fontWeight-control.vue";
import DataCellTextAlignControl from "./dataCellTextAlign-control.vue";

export default {
  name: "dataCellSettings-row",
  components: {
    DataCellTextAlignControl,
    FontWeightControl,
    FontSizeControl,
    DataCellWidthControl,
    DeleteIcon,
    DataFieldWidthIcon,
    DataCellDialog,
  },
  props: [
    "competition",
    "dataField",
    "fieldIndex",
    "protocolFields",
    "selectedFields",
  ],
  computed: {
    ...mapGetters("localization", {
      localization: "localization",
      lang: "lang",
    }),
    ...mapGetters("protocol_settings", {
      resultsProtocol: "results_protocol",
    }),
  },
  methods: {
    remove_field(field_id) {
      this.competition.protocol_settings.result_protocols[this.protocolFields] =
        this.competition.protocol_settings.result_protocols[
          this.protocolFields
        ].filter((protocol_field) => protocol_field.id !== field_id);
    },
    shift(field, to) {
      const fields =
        this.competition.protocol_settings.result_protocols[
          this.protocolFields
        ];
      let next_field;

      if (to === "up") {
        if (fields.indexOf(field) > 0) {
          next_field =
            this.competition.protocol_settings.result_protocols.fields[
              fields.indexOf(field) - 1
            ];
          this.$set(fields, fields.indexOf(field) - 1, field);
          this.$set(fields, fields.indexOf(field) + 1, next_field);
        }
      } else if (to === "down") {
        if (fields.indexOf(field) < fields.length - 1) {
          next_field =
            this.competition.protocol_settings.result_protocols.fields[
              fields.indexOf(field) + 1
            ];
          this.$set(fields, fields.indexOf(field) + 1, field);
          this.$set(fields, fields.indexOf(field), next_field);
        }
      }
    },
  },
};
</script>

<style scoped>
.dataRow__wrapper {
  position: relative;
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;

  min-height: 28px;
  margin-bottom: 2px;
  padding: 4px 6px 4px 18px;
  overflow: hidden;

  font-size: 0.9rem;
  background: var(--card-background);
  border-radius: 6px;
}
.dataRow__wrapper:last-child {
  margin-bottom: 0;
}
.switchArrows__wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;

  flex: 0 0 0;

  width: 16px;
  margin-right: 4px;
}
.switchArrow__button {
  height: 50%;
  width: 100%;

  border-radius: 0;
}
.switchArrow__button:hover .switchArrow__button__icon {
  color: var(--text-default) !important;
}
.switchArrow__button__icon {
  font-size: 16px !important;
  height: 10px !important;
  color: var(--standard-background);

  transition: background-color 0ms, color 92ms !important;
}

.deleteIcon {
  min-width: 2rem;
  font-size: 1.4rem;
  margin: auto 0 auto 8px;
  color: var(--standard-background);
  cursor: pointer;

  transition: color 92ms;
}
.deleteIcon:hover {
  color: var(--error);
}
</style>
