<template>
  <div v-if="competition" class="jumpCodes__wrapper">
    <div class="jumpCodes__title">
      {{ localization[lang].app.menu.aeCodes }}
    </div>

    <ae-codes-filter
      @set-filter-value="setCodesFilterValue"
      @set-full-match-mode="setCodesFilterFullMatchMode"
      :filter-value="codesFilter"
      :is-full-match="codesFilter_fullMatch"
    ></ae-codes-filter>
    <div class="jumpCodes__table">
      <div class="jumpCodes__header">
        <div class="jumpCodes__header__item jumpCode">Код</div>
        <div class="jumpCodes__header__item dd">Женщины</div>
        <div class="jumpCodes__header__item dd">Мужчины</div>
        <div class="jumpCodes__header__item jumpName">Название</div>

        <add-code_dialog
          @add-new-jump-code="addNewJumpCode"
          :ae-codes="getJumpCodesList"
        ></add-code_dialog>
        <v-btn
          class="saveCodes__button"
          color="var(--accent)"
          text
          @click="saveCodesToFile"
          >Сохранить
        </v-btn>
      </div>

      <div class="jumpCodes__body">
        <div
          v-for="jumpCode in getFilteredAeCodes"
          :key="jumpCode['jump']"
          class="jumpCode__wrapper"
        >
          <div class="jumpCodes__item jumpCode">{{ jumpCode.code }}</div>
          <div class="jumpCodes__item dd">
            <input v-model.lazy.trim="jumpCode['value_women']" type="text" />
          </div>
          <div class="jumpCodes__item dd">
            <input v-model.lazy.trim="jumpCode['value_men']" type="text" />
          </div>
          <div class="jumpCodes__item jumpName">
            <input v-model.lazy.trim="jumpCode['jump_name']" type="text" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fs from "fs";
import { mapGetters } from "vuex";
import AddCode_dialog from "./dialogs/addCode-dialog.vue";
import AeCodesFilter from "./jumpCodesFilter.vue";

export default {
  name: "jumpCodes",
  components: { AeCodesFilter, AddCode_dialog },
  methods: {
    addNewJumpCode(codeObj) {
      if (!this.competition.is_aerials && !this.competition.is_moguls) return;

      this.competition.is_aerials
        ? this.competition.ae_codes.push(codeObj)
        : this.competition.mg_codes.push(codeObj);
    },
    saveCodesToFile() {
      if (!this.competition.is_aerials && !this.competition.is_moguls) return;

      fs.writeFile(
        `${process.cwd()}/app_assets/${
          this.competition.is_aerials ? "AE_CODES" : "MG_CODES"
        }.json`,
        JSON.stringify(this.getJumpCodesList),
        { encoding: "utf-8" },
        (err) => {
          if (err) throw new Error(err.message);
        }
      );
    },
    setCodesFilterValue(value) {
      this.codesFilter = value;
    },
    setCodesFilterFullMatchMode(value) {
      this.codesFilter_fullMatch = value;
    },
  },
  data() {
    return {
      codesFilter: "",
      codesFilter_fullMatch: false,
    };
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    ...mapGetters("main", {
      competition: "competition",
    }),
    getJumpCodesList() {
      if (!this.competition.is_aerials && !this.competition.is_moguls)
        return [];

      return this.competition.is_aerials
        ? this.competition.ae_codes
        : this.competition.mg_codes;
    },
    getFilteredAeCodes() {
      if (!this.codesFilter) return this.getJumpCodesList;

      return this.codesFilter_fullMatch
        ? this.getJumpCodesList.filter((code) => code.code === this.codesFilter)
        : this.getJumpCodesList.filter((code) =>
            code.code.includes(this.codesFilter)
          );
    },
  },
};
</script>

<style scoped>
.jumpCodes__wrapper {
  display: flex;
  flex-direction: column;
  max-width: 900px;
  width: 100%;
  padding: 8px 16px;
}

.jumpCodes__title {
  margin-bottom: 8px;
  font-size: 1.4rem;
  font-weight: bold;
}

.jumpCodes__table {
  flex: 1 1 0;
  min-height: 600px;
  background: var(--card-background);
  border-radius: 6px;
  overflow: hidden;
}

.jumpCodes__header {
  display: flex;
  flex-wrap: nowrap;
  height: 32px;
  font-weight: bold;
  background: var(--subject-background);
  border-bottom: 2px solid var(--subject-background);
}
.jumpCodes__header__item {
  justify-content: center;
  align-content: center;
  padding: 2px 4px;
}

.saveCodes__button {
  max-height: 100%;
  margin-left: 8px;
}

.jumpCodes__body {
  height: calc(100% - 32px);
  overflow-y: auto;
}

.jumpCode__wrapper {
  display: flex;
  flex-wrap: nowrap;
}

.jumpCode__wrapper:not(:last-child) {
  border-bottom: 1px solid var(--subject-background);
}

.jumpCodes__item {
  padding: 3px 6px;
}

.jumpCode {
  flex: 0 0 6rem;
  display: flex;
  align-items: center;
  font-weight: bold;
}

.dd {
  flex: 0 0 15rem;
  display: flex;
  align-items: center;
}
.jumpName {
  flex: 0 0 15rem;
  display: flex;
  align-items: center;
}

input {
  min-width: 0;
  width: 100%;
  padding: 3px 6px;
  background: var(--standard-background);
  color: var(--text-default);
  border-radius: 4px;
  font-weight: bold;
}

input:focus {
  background: var(--subject-background);
}
</style>
