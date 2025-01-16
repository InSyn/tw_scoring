<template>
  <div class="teamCompetitor__wrapper">
    {{ `${competitor.info_data['bib']} ${competitor.info_data['lastname'].toUpperCase()} ${competitor.info_data['name']}` }}
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
  margin: 0 6px 6px 0;
  padding: 4px 8px;
  font-weight: bold;
  border-radius: 6px;
  background: var(--background-card);
}
</style>
