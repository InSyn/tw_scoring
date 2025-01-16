<script>
import TwFileInput from '../ui/tw-file-input.vue';
import mainData from '../competitionSettings/mainData.vue';
import { getDisciplineCode } from '../../data/sports';

export default {
  name: 'competitionImport',
  components: { TwFileInput },
  data() {
    return {
      dialogState: false,
      loadedCompetitions: [],
    };
  },
  methods: {
    openFile(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;

        try {
          const jsonData = JSON.parse(fileContent);
          if (jsonData) {
            this.loadedCompetitions = jsonData.competitions || [];
          }
        } catch (error) {
          console.error('File is not valid JSON:', error);
        }
      };
      reader.onerror = (error) => {
        console.warn('Error reading file:', error);
      };
      reader.readAsText(file);
    },
    importCompetition(competition) {
      this.$emit('import-competition', competition);
    },
    getCompetitionInfo(competition) {
      return `${competition.mainData && competition.mainData.title.value} ${
        competition.mainData && competition.mainData.discipline.value && getDisciplineCode(competition.mainData.discipline.value)
      } ${competition.mainData && competition.mainData.title.stage.group}`;
    },
  },
};
</script>

<template>
  <v-dialog v-model="dialogState" class="" width="540">
    <template v-slot:activator="{ on }">
      <button class="tw-button" @click="dialogState = true" v-on="on">Импорт</button>
    </template>
    <div class="import__wrapper section-container">
      <h3 class="import__title">Импорт соревнования</h3>
      <div class="import__body">
        <div class="loadedCompetition__wrapper" v-for="competition in loadedCompetitions" :key="competition.id">
          <div class="loadedCompetition__title">{{ getCompetitionInfo(competition) }}</div>
          <button class="tw-button-small" @click="importCompetition(competition)">ИМПОРТИРОВАТЬ</button>
        </div>
      </div>
      <div class="import__actions">
        <tw-file-input accept=".json,.twe" button-label="Выберите сохранённое событие" @input="openFile"></tw-file-input>
      </div>
    </div>
  </v-dialog>
</template>

<style scoped lang="scss">
.tw-button {
  margin-top: auto;
}
.import__wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px;
  .import__title {
    flex-shrink: 0;
  }
  .import__body {
    flex-shrink: 0;
    min-height: 320px;
    padding: 8px;
    background: var(--background-deep);
    border-radius: 4px;

    .loadedCompetition__wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .loadedCompetition__title {
        font-weight: bold;
      }
    }
  }
  .import__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
