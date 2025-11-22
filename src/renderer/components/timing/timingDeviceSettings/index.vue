<script>
import { mapGetters } from 'vuex';
import { mdiTimerOutline, mdiMinus } from '@mdi/js';
import TimerPanel from '../timerPanel.vue';
import MMovableElement from '../../mixins/MMovableElement';

const { ipcRenderer } = require('electron');

export default {
  name: 'timingDeviceSettings',
  mixins: [MMovableElement],
  components: { TimerPanel },
  data() {
    return {
      closeIcon: mdiMinus,
      opened: false,
      timerIcon: mdiTimerOutline,
      connectionTypes: [
        {
          type: 'TCP',
          ip: '192.168.3.127',
          port: 7000,
        },
        // {
        //   type: "COM",
        //   comPort: "COM1",
        //   baudRate: 9600,
        // },
      ],

      show_deviceSettings: true,
    };
  },
  computed: {
    ...mapGetters('main', {
      appTheme: 'appTheme',
    }),
    ...mapGetters('timing', { connectedDevices: 'connectedDevices' }),
  },
  methods: {
    connectDevice(connection) {
      if (connection.type === 'TCP') ipcRenderer.send('StartTCPSocket', { host: connection.ip, port: connection.port });
    },
    disconnectDevice(connection) {
      if (connection.type === 'TCP') ipcRenderer.send('DisconnectTCPSocket', { host: connection.ip, port: connection.port });
    },
    openSettings() {
      this.opened = !this.opened;
      if (!this.opened) this.stopDrag();
    },
    syncDevice(connection) {
      const date = new Date();

      const HH = date.getHours();
      const MM = date.getMinutes();
      const SS = date.getSeconds();
      const DD = date.getDate();
      const XX = date.getMonth() + 1;
      const YY = date.getFullYear().toString().slice(-2);

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
      const YY = date.getFullYear().toString().slice(-2);

      const dateMsg = `${HH}:${MM}:${SS} ${DD}/${XX}/${YY}`;

      const testMsg = ['Printer Test Message', dateMsg];

      if (connection.type === 'TCP') ipcRenderer.send('PrintTCPMessage', testMsg);
    },
  },
};
</script>

<template>
  <div class="settingsWrapper">
    <v-btn @click="openSettings" class="mx-2" icon color="var(--accent)">
      <v-icon>{{ timerIcon }}</v-icon>
    </v-btn>
    <div v-show="opened" ref="movableContainer" class="settingsWindow" tabindex="0">
      <div class="settingsHeader" ref="dragZone" tabindex="0">
        <span class="mr-4">Таймер</span>
        <v-hover v-slot:default="{ hover }">
          <v-icon
            @click="openSettings"
            class="ml-auto"
            small
            :color="hover ? $vuetify.theme.themes[appTheme].textDefault : $vuetify.theme.themes[appTheme].accent"
            >{{ closeIcon }}</v-icon
          >
        </v-hover>
      </div>
      <div class="settingsBody" v-if="show_deviceSettings">
        <div class="timerConnection" v-for="(c_type, c_idx) in connectionTypes" :key="c_idx">
          <div class="connectionInputs">
            <div class="connectionInput" v-for="(c_input, ci_key) in c_type" :key="ci_key" v-show="ci_key !== 'type'">
              <span
                class="ciLabel"
                :style="{
                  color: $vuetify.theme.themes[appTheme].textDefault,
                }"
              >
                {{ ci_key.toUpperCase() }}
              </span>
              <input
                class="ciInput"
                :class="[
                  ci_key === 'port' && 'portInput',
                  ci_key === 'ip' && 'ipInput',
                  ci_key === 'comPort' && 'comInput',
                  ci_key === 'baudRate' && 'bRateInput',
                ]"
                v-model="c_type[ci_key]"
              />
            </div>
          </div>
          <div class="deviceActions">
            <button class="tw-button-small sync_btn" @click="syncDevice(c_type)">Sync time</button>
            <button class="tw-button-small print_btn" @click="testPrint(c_type)">Print test</button>
            <button
              class="tw-button-small connect_btn"
              v-if="!connectedDevices.some((device) => device.host == c_type.ip && device.port == c_type.port && device.connected)"
              @click="connectDevice(c_type)"
            >
              Подключить
            </button>
            <button
              class="tw-button-small transparent danger connect_btn"
              v-if="connectedDevices.some((device) => device.host == c_type.ip && device.port == c_type.port && device.connected)"
              @click="disconnectDevice(c_type)"
            >
              Отключить
            </button>
          </div>
        </div>
      </div>
      <span class="toggleDeviceSettings__control" @click.stop="show_deviceSettings = !show_deviceSettings">{{
        `${show_deviceSettings ? 'СКРЫТЬ ' : ''}УСТРОЙСТВА`
      }}</span>

      <timer-panel></timer-panel>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settingsWrapper {
  .settingsWindow {
    position: absolute;
    z-index: 9999;
    top: 60px;
    left: 320px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    resize: vertical;
    min-height: 250px;
    padding: 0.75rem;
    border-radius: 4px;
    outline: transparent;
    box-shadow: var(--container-shadow-s), 0 0 0 1px var(--background-card-nested);
    transition: box-shadow 64ms;

    &::before {
      position: absolute;
      content: '';
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: var(--background-card);
      border-radius: 4px;
      transition: background-color 64ms, box-shadow 64ms;
    }
    &:hover {
      box-shadow: var(--container-shadow-m);
    }
    &:focus-within {
      box-shadow: var(--container-shadow-m), 0 0 0 1px var(--accent);
    }

    .settingsHeader {
      flex: 0 0 auto;
      position: relative;
      display: flex;
      align-items: baseline;
      margin-bottom: 12px;
      cursor: move;
      font-weight: bold;
      font-size: 1.1rem;
      outline: transparent;
      user-select: none;
    }
    .settingsBody {
      position: relative;
      flex: 0 0 auto;
      margin-bottom: 0.75rem;
    }
    .toggleDeviceSettings__control {
      position: relative;
      display: inline-block;
      text-align: center;
      opacity: 0.25;
      cursor: pointer;
      transition: opacity 64ms;
      &:hover {
        opacity: 1;
      }
    }
  }
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

/*noinspection CssUnusedSymbol*/
.portInput {
  width: 5ch;
}
/*noinspection CssUnusedSymbol*/
.ipInput {
  width: 12ch;
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
}
.sync_btn {
  margin-right: 4px;
}
.connect_btn {
  margin-left: auto;
}
</style>
