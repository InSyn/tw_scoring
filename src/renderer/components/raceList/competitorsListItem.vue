<template>
  <div class="competitorRow__wrapper">
    <div v-if="section === 'startList'" class="switchCompetitorOrderControls__wrapper">
      <div class="switchCompetitorOrderArrows__wrapper">
        <div @click.stop="shift(getAthleteObject.id, selectedRace, 'up')" class="switchCompetitorOrder__button">
          <v-icon class="switchCompetitorOrder__icon" color="var(--accent)" small>mdi-chevron-up </v-icon>
        </div>

        <div @click.stop="shift(getAthleteObject.id, selectedRace, 'down')" class="switchCompetitorOrder__button">
          <v-icon class="switchCompetitorOrder__icon" color="var(--accent)" small>mdi-chevron-down </v-icon>
        </div>
      </div>

      <div class="switchCompetitorOrder__number">
        {{ competitorIndex + 1 }}
      </div>
    </div>

    <div @click="competitorRaceInfo_dialogState = true" class="competitorRow__infoData_wrapper">
      <competitor-race-info-dialog
        @rebuild-start-list="competition.rebuildStartList"
        @toggle-dialog-state="toggleRaceInfoDialog"
        :competition="competition"
        :competitor="getAthleteObject"
        :dialog-state-prop="competitorRaceInfo_dialogState"
        :selected-race="selectedRace"
        :section="section"
      ></competitor-race-info-dialog>

      <div
        class="competitorRow__infoData_dataItem"
        v-for="(field, f) in competition.competitorsSheet.header.filter((f) => ['bib', 'name'].includes(f.id))"
        :key="f"
      >
        {{ getAthleteObject ? getAthleteObject.info_data[field.id] : null }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CompetitorRaceInfoDialog from './dialogs/competitorRaceInfo-dialog.vue';
import MDragEventEmitterMixin from '../mixins/MDragEventEmitterMixin';
import EventClass from '../../classes/EventClass';

export default {
  name: 'competitorsListItem',
  components: { CompetitorRaceInfoDialog },
  props: {
    competition: { type: EventClass, default: () => ({}) },
    competitorId: { type: String | Number, default: '' },
    competitorIndex: Number,
    section: String,
    selectedRace: { type: Object, default: () => ({}) },
  },
  mixins: [MDragEventEmitterMixin],
  data() {
    return {
      competitorRaceInfo_dialogState: false,
    };
  },
  computed: {
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    getAthleteObject() {
      return this.competition.competitorsSheet.competitors.find((comp) => comp.id === this.competitorId);
    },
  },
  methods: {
    rebuildStartList(race) {
      this.$emit('rebuild-start-list', race);
    },
    shift(comp_id, race, to) {
      let _compToShift;
      if (to === 'up') {
        if (race.startList.indexOf(comp_id) > 0) {
          _compToShift = race.startList[race.startList.indexOf(comp_id) - 1];
          this.$set(race.startList, race.startList.indexOf(comp_id) - 1, comp_id);
          this.$set(race.startList, race.startList.indexOf(comp_id) + 1, _compToShift);
        }
      } else if (to === 'down') {
        if (race.startList.indexOf(comp_id) < race.startList.length - 1) {
          _compToShift = race.startList[race.startList.indexOf(comp_id) + 1];
          this.$set(race.startList, race.startList.indexOf(comp_id) + 1, comp_id);
          this.$set(race.startList, race.startList.indexOf(comp_id), _compToShift);
        }
      }

      this.this.competition.rebuildStartList(race);
    },
    toggleRaceInfoDialog(state) {
      this.competitorRaceInfo_dialogState = state;
    },
  },
};
</script>

<style scoped lang="scss">
.competitorRow__wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: 34px;

  transition: background-color 112ms;
}
.competitorRow__wrapper:hover {
  background: rgba(255, 255, 255, 0.1);
}
.switchCompetitorOrderControls__wrapper {
  position: relative;
  align-self: stretch;
  display: flex;
  width: 4rem;
  font-weight: bold;
}
.switchCompetitorOrderArrows__wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;

  display: flex;
  flex-direction: column;

  width: 16px;
}
.switchCompetitorOrder__button {
  display: none;
  justify-content: center;
  align-items: center;
  height: 50%;
  cursor: pointer;
}
.switchCompetitorOrder__button:hover {
  background: rgba(255, 255, 255, 0.25);
}
.switchCompetitorOrder__button:hover .switchCompetitorOrder__icon {
  color: var(--text-default) !important;
}
.competitorRow__wrapper:hover .switchCompetitorOrder__button {
  display: flex;
}
.switchCompetitorOrderArrows__wrapper:hover .switchCompetitorOrder__button {
  display: flex;
}
.switchCompetitorOrder__number {
  align-self: center;
  margin: auto;
}
.competitorRow__infoData_wrapper {
  flex: 1 0 auto;
  display: flex;
  flex-wrap: nowrap;
  max-height: 100%;
  cursor: pointer;
}
.competitorRow__infoData_dataItem {
  flex: 0 0 auto;
  display: flex;
  align-items: center;

  padding: 4px 8px;
  overflow: hidden;
}
</style>
