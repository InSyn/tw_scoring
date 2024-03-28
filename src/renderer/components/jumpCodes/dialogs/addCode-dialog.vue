<template>
  <v-dialog v-model="dialogState" width="480">
    <template v-slot:activator="{ on }">
      <v-btn class="addCode__button" v-on="on" color="var(--success)" text>
        Добавить
      </v-btn>
    </template>

    <div class="addCodeDialog__wrapper">
      <div class="addCodeDialog__title">Добавление кода прыжка</div>

      <div class="addCodeDialog__body">
        <div class="input__wrapper">
          <div class="input__title">Код</div>
          <input class="codeName__input" v-model="code" type="text" />
        </div>

        <div class="input__wrapper">
          <div class="input__title">Ж</div>
          <input class="codeValue__input" v-model="womenValue" type="text" />
        </div>

        <div class="input__wrapper">
          <div class="input__title">М</div>
          <input class="codeValue__input" v-model="menValue" type="text" />
        </div>

        <div class="input__wrapper">
          <div class="input__title">Название</div>
          <input class="codeName__input" v-model="jumpName" type="text" />
        </div>
      </div>

      <div class="addCodeDialog__actions">
        <v-btn color="var(--success)" @click="addCode" small text>
          Применить
        </v-btn>

        <v-btn
          class="ml-2"
          color="var(--text-default)"
          @click="closeDialog"
          small
        >
          Отмена
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
export default {
  name: "addCode_dialog",
  props: ["jumpCodes"],
  methods: {
    addCode() {
      this.$emit("add-new-jump-code", {
        code: this.code,
        jump_name: this.jumpName,
        value_women: this.womenValue,
        value_men: this.menValue,
      });

      this.closeDialog();
    },
    closeDialog() {
      this.code = "";
      this.jumpName = "";
      this.womenValue = "";
      this.menValue = "";

      this.dialogState = false;
    },
  },
  data() {
    return {
      dialogState: false,
      code: "",
      jumpName: "",
      womenValue: "",
      menValue: "",
    };
  },
};
</script>

<style scoped>
.addCode__button {
  margin-left: auto;
  max-height: 100%;
}
.addCodeDialog__wrapper {
  background: var(--card-background);
  border-radius: 6px;
  overflow: hidden;
}
.addCodeDialog__title {
  padding: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}
.addCodeDialog__body {
  display: flex;
  padding: 8px;
}
.input__wrapper {
  margin-right: 1rem;
}
.input__wrapper:last-child {
  margin-right: 0;
}
.input__title {
  font-weight: bold;
  padding: 2px 4px 4px;
}
input {
  min-width: 0;
  padding: 4px;
  color: var(--text-default);
  background: var(--standard-background);
  border-radius: 6px;
}
.codeName__input {
  width: 5rem;
}
.codeValue__input {
  width: 4rem;
  font-weight: bold;
}
.addCodeDialog__actions {
  display: flex;
  justify-content: flex-end;
  padding: 4px;
}
</style>
