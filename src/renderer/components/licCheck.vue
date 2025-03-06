<template>
  <div class="licensePage__wrapper">
    <div v-if="loading" class="licensePage__loader">
      {{ localization[lang].app.license.activation }}
    </div>

    <div
      v-else
      :style="[
        {
          border: `2px solid ${$vuetify.theme.themes[appTheme].cardBackgroundRGBA}`,
          backgroundColor: $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
        },
        license.state ? { border: `2px solid ${$vuetify.theme.themes[appTheme].success}` } : { border: `2px solid ${$vuetify.theme.themes[appTheme].error}` },
      ]"
      style="border-radius: 6px; transition: all 122ms"
    >
      <div style="font-weight: bold; font-size: 1.2rem; padding: 8px">
        {{ localization[lang].app.license.activation_title }}
      </div>

      <div style="margin-top: 8px; padding: 8px 16px">
        <div style="display: flex; align-items: center; min-width: 400px">
          <div style="flex: 0 0 auto">
            {{ localization[lang].app.license.user }}
          </div>
          <input
            v-model="licenseData.user"
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
            style="flex: 0 0 auto; margin-left: auto; padding: 3px 6px; border-radius: 6px"
            type="text"
          />
        </div>

        <div style="display: flex; align-items: center; min-width: 400px; margin-top: 12px">
          <div style="flex: 0 0 auto">
            {{ localization[lang].app.license.serial }}
          </div>
          <input
            v-model="licenseData.serial"
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
            style="flex: 0 1 32ch; margin-left: auto; padding: 3px 6px; border-radius: 6px"
            type="text"
          />
        </div>

        <div style="display: flex; align-items: center; margin-top: 6px; min-width: 400px">
          <div style="flex: 0 0 auto; font-weight: bold">
            {{ localization[lang].app.license.key }}
          </div>
          <input
            v-model="licenseData.key"
            :style="{
              backgroundColor: $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
              color: $vuetify.theme.themes[appTheme].textDefault,
            }"
            style="flex: 0 1 32ch; margin-left: auto; padding: 3px 6px; border-radius: 6px"
            type="text"
          />
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap; align-items: center; margin-top: 8px; padding: 8px">
        <v-btn @click="validateProduct(licenseData)" class="white--text" :color="$vuetify.theme.themes[appTheme].accent" small>
          {{ localization[lang].app.license.enter }}
        </v-btn>

        <v-btn @click="activateProduct()" class="ml-auto" color="var(--success)" text small>
          {{ localization[lang].app.license.activate }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { v4 as uuid } from 'uuid';

const { ipcRenderer } = require('electron');
export default {
  name: 'lic_check',
  data() {
    return {
      licenseData: {
        user: '',
        serial: '',
        key: '',
      },
      loading: true,
    };
  },
  computed: {
    ...mapGetters('key', {
      license_panel: 'license_panel',
      system_data: 'system_data',
    }),
    ...mapGetters('localization', {
      lang: 'lang',
      localization: 'localization',
    }),
    ...mapGetters('main', {
      _licData: '_licData',
      appTheme: 'appTheme',
    }),
    license() {
      if (this._licData.state) {
        setTimeout(() => {
          if (this.$route.name === 'licCheck') this.$router.push({ name: 'competitionSettings' });
        }, 750);
      }
      return this._licData;
    },
  },
  methods: {
    ...mapActions('main', {
      licChecked: 'licChecked',
    }),
    ...mapActions('key', {
      register_key: 'register_key',
      check_lic: 'check_lic',
    }),
    async activateProduct() {
      try {
        await this.register_key({
          key: this.licenseData.key,
          serial:
            this.licenseData.serial.toString().split(':').length > 1
              ? this.licenseData.serial
              : `${this.licenseData.serial}:${this.system_data.platform === 'win32' ? this.system_data.system.uuid : this.system_data.uuid.os}`,
        });
      } catch (e) {
        if (e) throw new Error(e.message);
      }
    },
    async validateProduct(data) {
      const serialKey = data.serial ? data.serial.toString() : this.licenseData.serial.toString();
      const serialNumber =
        serialKey.split(':').length > 1
          ? serialKey
          : `${serialKey}:${this.system_data.platform === 'win32' ? this.system_data.system.uuid : this.system_data.uuid.os}`;

      const license_data = {
        user: data.user ? data.user : this.licenseData.user,
        key: data.key ? data.key : this.licenseData.key,
        serial: serialNumber,
        salt: uuid(),
      };

      if (await this.check_lic(license_data)) {
        await this.licChecked(license_data);

        ipcRenderer.send('save-key', license_data);
        localStorage.setItem('license', JSON.stringify(license_data));
        localStorage.setItem('authorized', 'true');
      }

      this.loading = false;
    },
  },

  mounted() {
    if (!!localStorage.getItem('license')) {
      this.licenseData = JSON.parse(localStorage.getItem('license'));
      this.validateProduct(this.licenseData);
    }

    ipcRenderer.on('checked-key', (event, licenseData) => {
      for (let licenseDataKey in licenseData) {
        if (licenseData[licenseDataKey]) {
          this.licenseData[licenseDataKey] = licenseData[licenseDataKey];
        }
      }

      if (!!localStorage.getItem('authorized') !== true) {
        this.validateProduct(licenseData);
      } else {
        this.licChecked({ ...this.licenseData, state: true });
        this.loading = false;
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.licensePage__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 1rem 2rem;
}
.licensePage__loader {
  padding: 8px;
  border-radius: 6px;
  font-weight: bold;
  background-color: var(--background-card);
  border: 1px solid var(--accent);
}

input,
textarea {
  &:focus {
    box-shadow: 0 0 0 1px #3b70a9;
  }
}

.loader {
  animation: loader infinite alternate 1536ms;
}

@keyframes loader {
  0% {
    background-color: #232323;
  }
  100% {
    background-color: #3b70a9;
  }
}
</style>
