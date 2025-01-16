<template>
  <div class="settingsWrapper">
    <v-btn @click="openSettings" class="mx-2" icon color="var(--accent)">
      <v-icon>{{ timerIcon }}</v-icon>
    </v-btn>
    <div v-if="opened" class="settingsWindow">
      <div class="settingsHeader" @mousedown.prevent="handleDrag" @mouseup.prevent="stopDrag" @mouseleave.prevent="stopDrag">
        <span class="mr-4">Подключение таймера</span>
        <v-hover v-slot:default="{ hover }">
          <v-icon
            @click="openSettings"
            class="ml-auto"
            small
            :color="hover ? $vuetify.theme.themes[appTheme].textDefault : $vuetify.theme.themes[appTheme].accent"
            >{{ closeIcon }}</v-icon
          ></v-hover
        >
      </div>
      <div class="settingsBody">
        <div class="timerConnection" v-for="(c_type, c_idx) in connectionTypes" :key="c_idx">
          <div class="connectionInputs">
            <div class="connectionInput" v-for="(c_input, ci_key) in c_type" :key="ci_key" v-show="ci_key !== 'type'">
              <span
                class="ciLabel"
                :style="{
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              >
                {{ ci_key }}
              </span>
              <input
                class="ciInput"
                :class="[
                  ci_key === 'port' && 'portInput',
                  ci_key === 'host' && 'hostInput',
                  ci_key === 'comPort' && 'comInput',
                  ci_key === 'baudRate' && 'bRateInput',
                ]"
                v-model="c_type[ci_key]"
                :style="{
                  backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              />
            </div>
          </div>
          <div class="deviceActions">
            <v-btn class="sync_btn" @click="syncDevice(c_type)" :color="$vuetify.theme.themes[appTheme].accent" x-small> Sync time </v-btn>
            <v-btn class="print_btn" @click="testPrint(c_type)" :color="$vuetify.theme.themes[appTheme].accent" x-small> Print test </v-btn>
            <v-btn
              class="connect_btn"
              v-if="!connectedDevices.some((device) => device.host == c_type.host && device.port == c_type.port && device.connected)"
              @click="connectDevice(c_type)"
              :color="$vuetify.theme.themes[appTheme].action_green"
              x-small
            >
              Подключить
            </v-btn>
            <v-btn
              class="connect_btn"
              v-if="connectedDevices.some((device) => device.host == c_type.host && device.port == c_type.port && device.connected)"
              @click="disconnectDevice(c_type)"
              :color="$vuetify.theme.themes[appTheme].error"
              x-small
            >
              Отключить
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mdiTimerOutline, mdiMinus } from '@mdi/js';

const { ipcRenderer } = require('electron');

export default {
  name: 'timingDeviceSettings',
  methods: {
    connectDevice(connection) {
      if (connection.type === 'TCP') ipcRenderer.send('StartTCPSocket', connection);
    },
    disconnectDevice(connection) {
      if (connection.type === 'TCP') ipcRenderer.send('DisconnectTCPSocket', connection);
    },
    dragHandler(event) {
      const settingsFrame = document.querySelector('.settingsWindow');

      if (settingsFrame) {
        settingsFrame.style.left = `${settingsFrame.offsetLeft + event.movementX}px`;
        settingsFrame.style.top = `${settingsFrame.offsetTop + event.movementY}px`;
      }
    },
    handleDrag() {
      document.addEventListener('mousemove', this.dragHandler);
    },
    openSettings() {
      this.opened = !this.opened;
      document.removeEventListener('mousemove', this.dragHandler);
    },
    stopDrag() {
      document.removeEventListener('mousemove', this.dragHandler);
    },
    syncDevice(connection) {
      const date = new Date();

      const HH = date.getHours();
      const MM = date.getMinutes();
      const SS = date.getSeconds();
      const DD = date.getDate();
      const XX = date.getMonth() + 1;
      const YY = date.getFullYear().toString().substr(2, 2);

      const dateMsg = `${HH}:${MM}:${SS} ${DD}/${XX}/${YY}`;

      if (connection.type === 'TCP') ipcRenderer.send('SyncTimeTCP', dateMsg);
    },
    testPrint(connection) {
      const date = new Date();

      const HH = date.getHours();
      const MM = date.getMinutes();
      const SS = date.getSeconds();
      const DD = date.getDate();
      const XX = date.getMonth() + 1;
      const YY = date.getFullYear().toString().substr(2, 2);

      const dateMsg = `${HH}:${MM}:${SS} ${DD}/${XX}/${YY}`;

      const testMsg = ['Printer Test Message', dateMsg];

      if (connection.type === 'TCP') ipcRenderer.send('PrintTCPMessage', testMsg);
    },
  },
  data() {
    return {
      closeIcon: mdiMinus,
      opened: false,
      timerIcon: mdiTimerOutline,
      connectionTypes: [
        {
          type: 'TCP',
          host: '192.168.3.127',
          port: 7000,
        },
        // {
        //   type: "COM",
        //   comPort: "COM1",
        //   baudRate: 9600,
        // },
      ],
    };
  },
  computed: {
    ...mapGetters('main', {
      appTheme: 'appTheme',
    }),
    ...mapGetters('timing', { connectedDevices: 'connectedDevices' }),
  },
};
</script>

<style scoped>
.settingsWrapper {
}
.settingsWindow {
  position: fixed;
  z-index: 9999;
  top: 60px;
  left: 320px;
  padding: 12px;
  border-radius: 6px;
  overflow: hidden;
  min-width: 300px;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.75);
  background: var(--background-card);
  border: 1px solid var(--accent);
}
.settingsHeader {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
  cursor: move;
  font-weight: bold;
  font-size: 1.1rem;
  user-select: none;
}
.settingsBody {
}
.timerConnection {
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--standard-background);
}
.timerConnection:last-child {
  margin-bottom: 0;
  border-bottom: none;
}
.connectionInputs {
  flex: 1 0 auto;
  display: flex;
  flex-wrap: nowrap;
}
.deviceActions {
  flex: 1 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 12px 0 8px;
}
.connectionInput {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  margin-right: 12px;
}
.ciLabel {
  font-weight: bold;
  margin-right: 6px;
}
.ciInput {
  padding: 2px 4px;
  border-radius: 6px;
}

/*noinspection CssUnusedSymbol*/
.portInput {
  width: 4rem;
}
/*noinspection CssUnusedSymbol*/
.hostInput {
  width: 10rem;
}
/*noinspection CssUnusedSymbol*/
.comInput {
  width: 5rem;
}
/*noinspection CssUnusedSymbol*/
.bRateInput {
  width: 5rem;
}
.print_btn {
  margin-right: 4px;
  color: var(--text-default);
}
.sync_btn {
  margin-right: 4px;
  color: var(--text-default);
}
.connect_btn {
  margin-left: auto;
  color: var(--text-default);
}
</style>
