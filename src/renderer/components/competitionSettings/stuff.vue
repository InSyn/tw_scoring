<template>
  <div style="display: flex">
    <div class="stuffSection__wrapper" style="display: flex; flex-direction: column">
      <div class="stuffSection__header">
        <v-dialog v-model="competition.stuff.settings.jury.change_dialog" overlay-opacity="100%" width="320px">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" small icon :color="$vuetify.theme.themes[appTheme].accent_light">
              <v-icon small>mdi-tools</v-icon>
            </v-btn>
          </template>

          <v-card
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
          >
            <v-card-title class="pa-2" style="font-size: 1.2rem"> Изменить название </v-card-title>

            <div class="pa-2" style="font-size: 1.1rem">
              <input type="text" style="padding: 2px 4px; font-size: 1.1rem" v-model.lazy="competition.stuff.settings.jury.title" />
            </div>

            <v-card-actions class="d-flex justify-end pa-1">
              <v-btn small @click.stop="competition.stuff.settings.jury.change_dialog = false" :color="$vuetify.theme.themes[appTheme].textDefault">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <div :style="{ color: $vuetify.theme.themes[appTheme].textDefault }" style="font-weight: bold; font-size: 1.4rem">
          {{ competition.stuff.settings.jury.title }}
        </div>
        <v-btn @click="addStuff('jury')" text :color="$vuetify.theme.themes[appTheme].accent" style="margin-left: auto">
          <v-icon>mdi-account-plus</v-icon>
        </v-btn>
      </div>
      <div class="stuff__list">
        <personal-item
          v-for="(jury, idx) in competition.stuff.jury"
          :key="idx"
          :competition="competition"
          :jury-obj="jury"
          :index="idx"
          @toggle-abc="toggleABC"
          :drag-index="idx"
          :drag-items="competition.stuff.jury"
          :class="['drag-drop-item', { dragging: dragIndex === idx, dragOver: dragOverIndex === idx }]"
          @dragstart="onDragStart($event, idx)"
          @dragover="onDragOver($event, idx)"
          @drop="onDrop($event, idx, competition.stuff.jury)"
        ></personal-item>
      </div>
    </div>

    <div class="stuffSection__wrapper">
      <div class="stuffSection__header">
        <v-dialog v-model="competition.stuff.settings.judges.change_dialog" overlay-opacity="100%" width="320px">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" small icon :color="$vuetify.theme.themes[appTheme].accent_light">
              <v-icon small>mdi-tools</v-icon>
            </v-btn>
          </template>

          <v-card class="section-container">
            <v-card-title class="pa-2" style="font-size: 1.2rem"> Изменить название </v-card-title>

            <div class="pa-2" style="font-size: 1.1rem">
              <input type="text" style="padding: 2px 4px; font-size: 1.1rem" v-model.lazy="competition.stuff.settings.judges.title" />
            </div>

            <v-card-actions class="d-flex justify-end pa-1">
              <v-btn small @click.stop="competition.stuff.settings.judges.change_dialog = false" :color="$vuetify.theme.themes[appTheme].textDefault">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <div :style="{ color: $vuetify.theme.themes[appTheme].textDefault }" style="font-weight: bold; font-size: 1.4rem">
          {{ competition.stuff.settings.judges.title }}
        </div>
        <v-btn @click="addStuff('judge')" text color="var(--accent)" style="margin-left: auto">
          <v-icon>mdi-account-plus</v-icon>
        </v-btn>
      </div>

      <div class="stuff__list">
        <div class="stuffCard__wrapper" style="flex: 0 0 auto" v-for="(judge, jd) in competition.stuff.judges" :key="jd">
          <div
            v-if="judge.connected !== undefined"
            style="position: absolute; top: 4px; left: 8px; font-weight: bold; font-size: 0.9rem; background-color: var(--background-card)"
            :style="
              judge.connected && {
                color: $vuetify.theme.themes[appTheme].accent,
              }
            "
          >
            Online
          </div>
          <div class="stuffDataField__wrapper" data-fieldType="id">
            <div class="stuffParameter__title">T-ID:</div>
            <input class="stuffParameter__input" type="text" v-model="competition.stuff.judges[jd].id" />
          </div>

          <div class="stuffDataField__wrapper" data-fieldType="judgeTitle">
            <input class="stuffParameter__input" type="text" placeholder="Позиция" v-model="competition.stuff.judges[jd].title" />
          </div>
          <div class="stuffDataField__wrapper" data-fieldType="ffr-id">
            <input class="stuffParameter__input" type="text" placeholder="FFR-ID" v-model="competition.stuff.judges[jd].ffr_id" />
          </div>

          <div class="stuffDataField__wrapper" data-fieldType="lastname">
            <input class="stuffParameter__input" type="text" placeholder="Фамилия" v-model="competition.stuff.judges[jd].lastName" />
          </div>

          <div class="stuffDataField__wrapper" data-fieldType="name">
            <input class="stuffParameter__input" type="text" placeholder="Имя" v-model="competition.stuff.judges[jd].name" />
          </div>

          <div class="stuffDataField__wrapper" data-fieldType="region">
            <input class="stuffParameter__input" type="text" placeholder="Регион" v-model="competition.stuff.judges[jd].location" />
          </div>

          <div class="stuffDataField__wrapper" data-fieldType="category">
            <input class="stuffParameter__input" type="text" placeholder="Категория" v-model="competition.stuff.judges[jd].category" />
          </div>

          <v-col class="stuffActions__wrapper">
            <button
              class="tw-button-tiny"
              style="background-color: var(--background-deep); border-radius: 2px; font-size: 0.8rem; font-weight: bold; cursor: pointer; user-select: none"
              @click="toggleABC({ id: judge.id, stuffType: 'judges' })"
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
                  judge.setABC && {
                    backgroundColor: 'var(--success)',
                    boxShadow: '0 0 2px 2px var(--success)',
                  }
                "
              ></span>
            </button>
            <div v-if="checkCompetitionDiscipline(competition, ['MO'])" class="mogulsRoles__wrapper">
              <div
                :class="['mogulsRole', judge.moguls_role === role && 'mogulsRole-selected']"
                @click="setMogulsRole(judge, role)"
                v-for="role in ['turns', 'jumps']"
                :key="role"
              >
                {{ role }}
              </div>
            </div>
          </v-col>

          <v-btn
            x-small
            icon
            style="position: absolute; top: 2px; right: 4px"
            @click="remove_judge(judge._id)"
            :color="$vuetify.theme.themes[appTheme].action_red"
          >
            <v-icon x-small>mdi-close</v-icon>
          </v-btn>

          <span
            @click="force_disconnect(judge)"
            style="
              display: block;
              cursor: pointer;
              transition: background-color 192ms, box-shadow 192ms;
              position: absolute;
              border-radius: 4px;
              bottom: 8px;
              left: 50%;
              transform: translateX(-50%);
              height: 4px;
              width: 48px;
              background-color: var(--background-deep);
            "
            :style="
              competition.stuff.judges[jd].connected && {
                backgroundColor: $vuetify.theme.themes[appTheme].success,
                boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].success}`,
              }
            "
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import JudgeClass from '../../classes/JudgeClass';
import JuryClass from '../../classes/JuryClass';
import PersonalItem from './personal-item.vue';
import MDragAndDrop from '../mixins/MDragAndDrop';
import DataCellSettingsRow from '../protocols/protocolDataSheetSettings-components/dataCellSettings-row.vue';
import { checkCompetitionDiscipline } from '../../data/sports';

export default {
  name: 'stuff',
  components: { DataCellSettingsRow, PersonalItem },
  mixins: [MDragAndDrop],
  methods: {
    checkCompetitionDiscipline,
    ...mapActions('main', {
      updateEvent: 'updateEvent',
    }),
    async force_disconnect(judge) {
      this.$store.commit('main/force_disconnect', judge.socket_id);

      if (judge.connected) judge.connected = false;
      await this.updateEvent();
    },
    addStuff(stuffType) {
      switch (stuffType) {
        case 'judge': {
          const lastJudgeId = this.competition.stuff.judges.length > 0 ? this.competition.stuff.judges[this.competition.stuff.judges.length - 1].id : 0;

          this.competition.stuff.judges.push(
            new JudgeClass({
              title: `Судья ${lastJudgeId + 1}`,
              id: lastJudgeId + 1,
            })
          );
          break;
        }
        case 'jury': {
          this.competition.stuff[stuffType].push(new JuryClass({ title: `Жюри ${this.competition.stuff[stuffType].length + 1}` }));
        }
      }

      this.$store.dispatch('main/updateEvent');
    },
    remove_judge(judge_id) {
      this.competition.stuff.judges = this.competition.stuff.judges.filter((_judge) => {
        return _judge._id !== judge_id;
      });
      this.competition.competitorsSheet.competitors.forEach((_competitor) => {
        _competitor.marks = _competitor.marks.filter((_mark) => {
          return _mark.judge_id !== judge_id;
        });
      });

      this.$store.dispatch('main/updateEvent');
    },
    setMogulsRole(judge, role) {
      if (judge) {
        judge.moguls_role = role;

        this.updateEvent();
      }
    },
    toggleABC({ id, stuffType }) {
      this.competition.stuff[stuffType].forEach((employee) => {
        if (employee.id === id) {
          employee.setABC = !employee.setABC;
        }
      });

      this.$store.dispatch('main/updateEvent');
    },
  },
  computed: {
    ...mapGetters('main', { competition: 'competition', appTheme: 'appTheme' }),
  },
};
</script>

<style lang="scss">
.stuffSection__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  min-height: 100%;
  margin-right: 8px;

  border-radius: 6px;
  background: var(--background-card);
}
.stuffSection__header {
  display: flex;
  align-items: center;
  padding: 8px 8px 0;
}
.stuff__list {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  margin: 0 8px 8px;
  padding: 4px;
  background: var(--background-deep);
  border-radius: 6px;
}
.stuffCard__wrapper {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  padding-top: 24px;
  background: var(--background-card);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: move;
}
.stuffCard__wrapper:not(:last-child) {
  margin-bottom: 4px;
}
.stuffDataField__wrapper {
  flex: 1 0 auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin: 0 4px 4px 0;
  &[data-fieldType='id'] {
    margin-left: 8px;
  }
}
.stuffDataField__wrapper[data-fieldType='id'] {
  width: 6rem;
}
.stuffDataField__wrapper[data-fieldType='ffr-id'] {
  width: 10rem;
}
.stuffParameter__title {
  flex: 0 0 auto;
  font-weight: bold;
  white-space: nowrap;
}
.stuffParameter__input {
  flex: 1 1 3rem;
  min-width: 0;
  margin-left: 8px;
}
.stuffActions__wrapper {
  flex: 1 0 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 4px;
  border-radius: 2px;
}
.judgesSection {
  border: 1px solid var(--accent);
}
.mogulsRoles__wrapper {
  display: flex;
  padding: 6px;
  margin-left: auto;
}
.mogulsRole {
  margin-right: 6px;
  padding: 4px;

  font-weight: bold;
  border-radius: 2px;
  background: var(--background-card);

  cursor: pointer;
}
.mogulsRole:last-child {
  margin-right: 0;
}

/*noinspection CssUnusedSymbol*/
.mogulsRole.mogulsRole-selected {
  background: var(--accent);
  color: var(--text-default);
}
</style>
