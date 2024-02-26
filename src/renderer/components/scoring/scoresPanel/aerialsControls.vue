<template>
  <div class="aerialsControls__wrapper">
    <input
      @change="setAeCode($event)"
      v-bind:value="getJumpCode(competitorOnTrack)"
      class="aeCode__input"
      type="text"
    />

    <div
      v-if="showDD"
      :key="code || 'empty-code'"
      class="jumpCoefficient__value"
    >
      {{ getJumpCoefficient(competitorOnTrack) }}
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "aerialsControls",
  props: ["competition", "competitorOnTrack", "showDD"],
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    setAeCode(e) {
      if (e.target.value) {
        this.competitorOnTrack.info_data[
          `jump${this.competition.selected_race_id + 1}_code`
        ] = e.target.value;

        this.code = e.target.value;

        this.updateEvent();
      }
    },
    getJumpCode(competitor) {
      const competitorJumpCode =
        competitor.info_data[
          `jump${this.competition.selected_race_id + 1}_code`
        ];
      if (!competitorJumpCode) return "";

      return competitorJumpCode;
    },
    getJumpCoefficient(competitor) {
      const jumpCode = this.competition.ae_codes.find(
        (aeCode) => aeCode.code === this.getJumpCode(competitor)
      );
      if (!jumpCode) {
        return 1;
      }

      const group = competitor.info_data["group"]
        ? competitor.info_data["group"]
        : this.competition.mainData.title.stage.group || "men";

      const jumpCodeCoefficient = jumpCode[`value_${group}`];
      if (!jumpCodeCoefficient) return 1;

      return parseFloat(jumpCodeCoefficient).toFixed(2);
    },
  },
  data() {
    return {
      code: "",
    };
  },
  computed: {},
};
</script>

<style scoped>
.aerialsControls__wrapper {
  display: flex;
  /*margin-top: 8px;*/
}
.aeCode__input {
  margin-right: 8px;
  min-width: 0;
  width: 8rem;
  padding: 4px 8px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px var(--text-default);
  transition: box-shadow 92ms;
}
.aeCode__input:focus {
  box-shadow: inset 0 0 0 1px var(--accent);
}
.jumpCoefficient__value {
  min-width: 4rem;
  padding: 4px 1rem;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 6px;
  font-weight: bold;
}
</style>
