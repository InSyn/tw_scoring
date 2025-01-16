<template>
  <v-dialog width="320" v-model="dialogState">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="createCompetitor__dialog__button" color="var(--accent-light)" text small tile>
        <v-icon class="createCompetitor__dialog__button__icon" color="var(--text-default)" small> mdi-account-plus </v-icon>
        {{ localization[lang].app.competitors.create_competitor }}
      </v-btn>
    </template>

    <div class="createCompetitor__dialog__wrapper">
      <div class="createCompetitor__dialog__header">
        {{ localization[lang].app.competitors.d_new_competitor }}

        <v-btn @click="closeCreateCompetitorDialog()" class="createCompetitor__dialog__header__button-close" color="var(--action-red)" small icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="createCompetitor__dialog__body">
        <div class="createCompetitor__dialog__dataItem" v-for="(field, fd) in competition.competitorsSheet.header" :key="fd">
          <div class="createCompetitor__dialog__dataItem__label">
            {{ field.title }}
          </div>

          <input v-model="dialogNewCompetitor[fd]" class="createCompetitor__dialog__dataItem__input" type="text" />
        </div>
      </div>

      <div class="createCompetitor__dialog__footer">
        <v-btn @click="createCompetitor(dialogNewCompetitor)" class="createCompetitor__dialog__footer__button-createCompetitor" color="var(--accent)" text small
          >{{ localization[lang].app.dialogs.d_create }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import CompetitorClass from '../../../store/classes/CompetitorClass';

export default {
  name: 'createCompetitor-dialog',
  props: ['competition'],
  methods: {
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    closeCreateCompetitorDialog() {
      this.dialogState = false;
      this.dialogNewCompetitor = [];
    },

    createCompetitor(data) {
      let fields = [];
      this.competition.competitorsSheet.header.map((col) => fields.push([col.id, data[this.competition.competitorsSheet.header.indexOf(col)] || '']));
      this.competition.competitorsSheet.competitors.push(new CompetitorClass(fields));

      this.dialogState = false;
      this.dialogNewCompetitor = [];

      this.updateEvent();
    },
  },
  data() {
    return {
      dialogState: false,
      dialogNewCompetitor: [],
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
.createCompetitor__dialog__button {
}
.createCompetitor__dialog__button__icon {
  margin-right: 0.5rem;
}
.createCompetitor__dialog__wrapper {
  color: var(--text-default);
  background: var(--background-card);
}
.createCompetitor__dialog__header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;

  font-size: 1.2rem;
  font-weight: bold;
}
.createCompetitor__dialog__header__button-close {
  margin-left: auto;
}
.createCompetitor__dialog__body {
  max-height: 320px;
  margin-bottom: 8px;
  padding: 8px;
  overflow-y: auto;
  color: var(--text-default);
}
.createCompetitor__dialog__dataItem {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.createCompetitor__dialog__dataItem:last-child {
  margin-bottom: 0;
}
.createCompetitor__dialog__dataItem__label {
  flex: 1 1 0;
  font-weight: bold;
}
.createCompetitor__dialog__dataItem__input {
  flex: 2 0 0;
  margin-left: 8px;
  padding: 2px 4px;

  color: var(--text-default);
  background: var(--standard-background);

  border: 1px solid transparent;
  border-radius: 6px;
  transition: border 112ms;
}
.createCompetitor__dialog__dataItem__input:focus {
  border: 1px solid var(--accent);
}
.createCompetitor__dialog__footer {
  display: flex;
  align-items: center;
  padding: 8px;
}
.createCompetitor__dialog__footer__button-createCompetitor {
  margin-left: auto;
}
</style>
