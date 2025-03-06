<template>
  <div v-if="competitor && competitor.info_data" class="teamCompetitor__wrapper">
    {{ `${competitor.info_data['bib'] || '-'} ${competitor.info_data['name'] || '[Empty name]'}` }}
  </div>
</template>

<script>
export default {
  name: 'teamCompetitor',
  props: ['competitor'],
};
</script>

<style scoped>
.teamCompetitor__wrapper {
  flex: 0 0 auto;
  margin: 0 4px 4px 0;
  padding: 4px 8px;
  font-weight: bold;
  border-radius: 4px;
  background: var(--background-card);
}
</style>
