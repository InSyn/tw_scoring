<template>
  <div v-if="competition" class="protocolsPage__wrapper">
    <start_protocols v-if="!competition.protocol_settings.protocol_type"></start_protocols>
    <final_protocols v-else :protocol-type="competition.protocol_settings.protocol_type"></final_protocols>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import start_protocols from './start_protocols.vue';
import final_protocols from './protocols.vue';
export default {
  name: 'protocols',
  components: {
    start_protocols,
    final_protocols,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('main', {
      appTheme: 'appTheme',
      competition: 'competition',
    }),
  },
};
</script>

<style scoped>
.protocolsPage__wrapper {
  flex: 1 1 0;
}
</style>
