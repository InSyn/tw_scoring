<template>
  <div class="jumpCodes__wrapper" v-if="competition">
    <div class="jumpCodes__title">
      {{ localization[lang].app.menu.aeCodes }}
    </div>

    <div class="jumpCodes__table">
      <div class="jumpCodes__header">
        <div class="jumpCode">Код</div>
        <div class="dd">Женщины</div>
        <div class="dd">Мужчины</div>

        <add-code_dialog :ae-codes="competition.ae_codes"></add-code_dialog>
        <v-btn
          class="saveCodes__button"
          @click="saveCodesToFile"
          color="var(--accent)"
          text
          >Сохранить</v-btn
        >
      </div>

      <div class="jumpCodes__body">
        <div
          class="jumpCode__wrapper"
          v-for="jumpCode in competition.ae_codes"
          :key="jumpCode['jump']"
        >
          <div class="jumpCode">{{ jumpCode.code }}</div>
          <div class="dd">
            <input type="text" v-model.lazy.trim="jumpCode['value_women']" />
          </div>
          <div class="dd">
            <input type="text" v-model.lazy.trim="jumpCode['value_men']" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import AddCode_dialog from "./dialogs/addCode_dialog";
import fs from "fs";

export default {
  name: "aeCodes",
  components: { AddCode_dialog },
  methods: {
    saveCodesToFile() {
      fs.writeFile(
        `${process.cwd()}/app_assets/AE_CODES.json`,
        JSON.stringify(this.competition.ae_codes),
        { encoding: "utf-8" },
        (err) => {
          if (err) console.error(err);
        }
      );
    },
  },
  computed: {
    ...mapGetters("localization", {
      lang: "lang",
      localization: "localization",
    }),
    ...mapGetters("main", {
      competition: "competition",
    }),
  },
};
</script>

<style scoped>
.jumpCodes__wrapper {
  padding: 8px 16px;
  height: 100%;
}
.jumpCodes__title {
  margin-bottom: 16px;
  font-size: 1.4rem;
  font-weight: bold;
}
.jumpCodes__table {
  height: 80vh;
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
  border-bottom: 1px solid var(--subject-background);
}
.jumpCode__wrapper:last-child {
  border-bottom: none;
}
.jumpCode {
  flex: 0 0 6rem;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  font-weight: bold;
}
.dd {
  flex: 0 0 15rem;
  display: flex;
  align-items: center;
  padding: 2px;
}
.dd input {
  min-width: 0;
  width: 100%;
  padding: 4px;
  font-weight: bold;
  background: var(--standard-background);
  color: var(--text-default);
}
.dd input:focus {
  background: var(--subject-background);
}
</style>
