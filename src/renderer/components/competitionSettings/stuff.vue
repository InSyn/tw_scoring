<template>
  <div style="min-height: 100%">
    <div style="display: flex">
      <div class="stuffSection__wrapper">
        <div class="stuffSection__header">
          <v-dialog
            v-model="competition.stuff.settings.jury.change_dialog"
            overlay-opacity="100%"
            width="320px"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                small
                icon
                :color="$vuetify.theme.themes[appTheme].accent_light"
              >
                <v-icon small>mdi-tools</v-icon>
              </v-btn>
            </template>

            <v-card
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
            >
              <v-card-title class="pa-2" style="font-size: 1.2rem">
                Изменить название
              </v-card-title>

              <div class="pa-2" style="font-size: 1.1rem">
                <input
                  type="text"
                  style="
                    padding: 2px 4px;
                    font-size: 1.1rem;
                    border-radius: 2px;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  v-model.lazy="competition.stuff.settings.jury.title"
                />
              </div>

              <v-card-actions class="d-flex justify-end pa-1">
                <v-btn
                  small
                  @click.stop="
                    competition.stuff.settings.jury.change_dialog = false
                  "
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                >
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <div
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            style="font-weight: bold; font-size: 1.4rem"
          >
            {{ competition.stuff.settings.jury.title }}
          </div>
          <v-btn
            @click="addStuff('jury')"
            text
            :color="$vuetify.theme.themes[appTheme].accent"
            style="margin-left: auto"
          >
            <v-icon>mdi-account-plus</v-icon>
          </v-btn>
        </div>
        <div class="stuff__list">
          <div
            v-for="(jury, jr) in competition.stuff.jury"
            :key="jr"
            class="stuffCard__wrapper"
            style=""
            :style="
              jury.connected !== undefined && {
                border: `1px solid ${$vuetify.theme.themes[appTheme].accent}`,
              }
            "
          >
            <div class="stuffDataField__wrapper" data-fieldType="position">
              <div class="stuffParameter__title">Позиция</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.jury[jr].title"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="lastname">
              <div class="stuffParameter__title">Фамилия</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.jury[jr].lastName"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="name">
              <div class="stuffParameter__title">Имя</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.jury[jr].name"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="region">
              <div class="stuffParameter__title">Регион</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.jury[jr].location"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="category">
              <div class="stuffParameter__title">Кат.</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.jury[jr].category"
              />
            </div>

            <div v-if="jury.id === 'chief'" class="stuffActions__wrapper">
              <div
                @click="toggleABC(jury.id)"
                style="
                  display: flex;
                  flex-wrap: nowrap;
                  align-items: center;
                  padding: 4px 8px;
                  background: var(--standard-background);
                  border-radius: 6px;
                  font-size: 1rem;
                  font-weight: bold;
                  cursor: pointer;
                  user-select: none;
                "
              >
                ABC
                <div
                  style="
                    margin-left: 1rem;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    transition: 122ms;
                  "
                  :style="
                    (jury.setABC && {
                      backgroundColor: $vuetify.theme.themes[appTheme].success,
                      boxShadow: `0 0 2px 2px ${$vuetify.theme.themes[appTheme].success}`,
                    }) || {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                      boxShadow: `0 0 0 0 ${$vuetify.theme.themes[appTheme].success}`,
                    }
                  "
                ></div>
              </div>
            </div>

            <div
              v-if="jury.connected !== undefined"
              style="
                position: absolute;
                top: 4px;
                left: 8px;
                font-weight: bold;
                font-size: 0.9rem;
              "
              :style="[
                { color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA },
                jury.connected && {
                  color: $vuetify.theme.themes[appTheme].accent,
                },
              ]"
            >
              Online
            </div>

            <div
              v-if="jury.connected !== undefined"
              style="
                position: absolute;
                top: 4px;
                right: 32px;
                color: var(--accent);
                font-size: 1.25rem;
                font-weight: bold;
                letter-spacing: 2px;
              "
            >
              CJ
            </div>

            <v-btn
              small
              icon
              style="position: absolute; top: 2px; right: 4px"
              :disabled="jury.connected !== undefined"
              @click="
                competition.stuff.jury.splice(
                  competition.stuff.jury.indexOf(jury),
                  1
                )
              "
              :color="$vuetify.theme.themes[appTheme].action_red"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>
            <span
              v-if="jury.connected !== undefined"
              style="
                display: block;
                transition: background-color 192ms, box-shadow 192ms;
                position: absolute;
                border-radius: 4px;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                height: 4px;
                width: 48px;
              "
              :style="
                competition.stuff.jury[jr].connected
                  ? {
                      backgroundColor: $vuetify.theme.themes[appTheme].success,
                      boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].success}`,
                    }
                  : {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                      boxShadow: `none`,
                    }
              "
            ></span>
          </div>
        </div>
      </div>

      <div class="stuffSection__wrapper">
        <div class="stuffSection__header">
          <v-dialog
            v-model="competition.stuff.settings.judges.change_dialog"
            overlay-opacity="100%"
            width="320px"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                small
                icon
                :color="$vuetify.theme.themes[appTheme].accent_light"
              >
                <v-icon small>mdi-tools</v-icon>
              </v-btn>
            </template>

            <v-card
              :style="{
                backgroundColor:
                  $vuetify.theme.themes[appTheme].cardBackgroundRGBA,
                color: $vuetify.theme.themes[appTheme].textDefault,
              }"
            >
              <v-card-title class="pa-2" style="font-size: 1.2rem">
                Изменить название
              </v-card-title>

              <div class="pa-2" style="font-size: 1.1rem">
                <input
                  type="text"
                  style="
                    padding: 2px 4px;
                    font-size: 1.1rem;
                    border-radius: 2px;
                  "
                  :style="{
                    backgroundColor:
                      $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                    color: $vuetify.theme.themes[appTheme].textDefault,
                  }"
                  v-model.lazy="competition.stuff.settings.judges.title"
                />
              </div>

              <v-card-actions class="d-flex justify-end pa-1">
                <v-btn
                  small
                  @click.stop="
                    competition.stuff.settings.judges.change_dialog = false
                  "
                  :color="$vuetify.theme.themes[appTheme].textDefault"
                >
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <div
            :style="{ color: $vuetify.theme.themes[appTheme].textDefault }"
            style="font-weight: bold; font-size: 1.4rem"
          >
            {{ competition.stuff.settings.judges.title }}
          </div>
          <v-btn
            @click="addStuff('judge')"
            text
            :color="$vuetify.theme.themes[appTheme].accent"
            style="margin-left: auto"
          >
            <v-icon>mdi-account-plus</v-icon>
          </v-btn>
        </div>

        <div class="stuff__list">
          <div
            class="stuffCard__wrapper"
            v-for="(judge, jd) in competition.stuff.judges"
            :key="jd"
          >
            <div
              v-if="judge.connected !== undefined"
              style="
                position: absolute;
                top: 4px;
                left: 8px;
                font-weight: bold;
                font-size: 0.9rem;
              "
              :style="[
                { color: $vuetify.theme.themes[appTheme].cardBackgroundRGBA },
                judge.connected && {
                  color: $vuetify.theme.themes[appTheme].accent,
                },
              ]"
            >
              Online
            </div>
            <div class="stuffDataField__wrapper" data-fieldType="id">
              <div class="stuffParameter__title">ID:</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.judges[jd].id"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="judgeTitle">
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.judges[jd].title"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="lastname">
              <div class="stuffParameter__title">Фамилия</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.judges[jd].lastName"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="name">
              <div class="stuffParameter__title">Имя</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.judges[jd].name"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="region">
              <div class="stuffParameter__title">Регион</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.judges[jd].location"
              />
            </div>

            <div class="stuffDataField__wrapper" data-fieldType="category">
              <div class="stuffParameter__title">Кат.</div>
              <input
                class="stuffParameter__input"
                type="text"
                v-model="competition.stuff.judges[jd].category"
              />
            </div>

            <v-col class="stuffActions__wrapper">
              <div
                @click="toggleABC(judge.id)"
                style="
                  display: flex;
                  flex-wrap: nowrap;
                  align-items: center;
                  padding: 4px 8px;
                  background: var(--standard-background);
                  border-radius: 6px;
                  font-size: 1rem;
                  font-weight: bold;
                  cursor: pointer;
                  user-select: none;
                "
              >
                ABC
                <div
                  style="
                    margin-left: 1rem;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    transition: 122ms;
                  "
                  :style="
                    (judge.setABC && {
                      backgroundColor: $vuetify.theme.themes[appTheme].success,
                      boxShadow: `0 0 2px 2px ${$vuetify.theme.themes[appTheme].success}`,
                    }) || {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].subjectBackgroundRGBA,
                      boxShadow: `0 0 0 0 ${$vuetify.theme.themes[appTheme].success}`,
                    }
                  "
                ></div>
              </div>
              <div v-if="competition.is_moguls" class="mogulsRoles__wrapper">
                <div
                  :class="[
                    'mogulsRole',
                    judge.moguls_role === role && 'mogulsRole-selected',
                  ]"
                  @click="setMogulsRole(judge, role)"
                  v-for="role in ['turns', 'jumps']"
                  :key="role"
                >
                  {{ role }}
                </div>
              </div>
            </v-col>

            <v-btn
              small
              icon
              style="position: absolute; top: 2px; right: 4px"
              @click="remove_judge(judge._id)"
              :color="$vuetify.theme.themes[appTheme].action_red"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>

            <span
              @click="force_disconnect(judge)"
              style="
                display: block;
                cursor: pointer;
                transition: background-color 192ms, box-shadow 192ms;
                position: absolute;
                border-radius: 4px;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                height: 4px;
                width: 48px;
              "
              :style="
                competition.stuff.judges[jd].connected
                  ? {
                      backgroundColor: $vuetify.theme.themes[appTheme].success,
                      boxShadow: `0 0 3px 1px ${$vuetify.theme.themes[appTheme].success}`,
                    }
                  : {
                      backgroundColor:
                        $vuetify.theme.themes[appTheme].standardBackgroundRGBA,
                      boxShadow: `none`,
                    }
              "
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import JudgeClass from "../../store/Classes/JudgeClass";
import JuryClass from "../../store/Classes/JuryClass";

export default {
  name: "stuff",
  methods: {
    ...mapActions("main", {
      updateEvent: "updateEvent",
    }),
    async force_disconnect(judge) {
      await this.$store.commit("main/force_disconnect", judge.socket_id);

      if (judge.connected) judge.connected = false;
      await this.updateEvent();
    },
    addStuff(stuffType) {
      switch (stuffType) {
        case "judge": {
          this.competition.stuff.judges.push(
            new JudgeClass(
              `Судья ${this.competition.stuff.judges.length + 1}`,
              this.competition.stuff.judges.length > 0
                ? this.competition.stuff.judges[
                    this.competition.stuff.judges.length - 1
                  ].id + 1
                : 1
            )
          );
          break;
        }
        case "jury": {
          this.competition.stuff[stuffType].push(new JuryClass());
        }
      }

      this.$store.dispatch("main/updateEvent");
    },
    remove_judge(judge_id) {
      this.competition.stuff.judges = this.competition.stuff.judges.filter(
        (_judge) => {
          return _judge._id !== judge_id;
        }
      );
      this.competition.competitorsSheet.competitors.forEach((_competitor) => {
        _competitor.marks = _competitor.marks.filter((_mark) => {
          return _mark.judge_id !== judge_id;
        });
      });

      this.$store.dispatch("main/updateEvent");
    },
    setMogulsRole(judge, role) {
      if (judge) {
        judge.moguls_role = role;

        this.updateEvent();
      }
    },
    toggleABC(id) {
      const stuff = this.competition.stuff;
      for (const stuffKey in stuff) {
        if (Array.isArray(stuff[stuffKey]))
          stuff[stuffKey].forEach((employee) => {
            if (employee["setABC"] !== undefined && employee.id === id) {
              employee["setABC"] = !employee["setABC"];
            }
          });
      }

      this.$store.dispatch("main/updateEvent");
    },
  },
  computed: {
    ...mapGetters("main", { competition: "competition", appTheme: "appTheme" }),
  },
};
</script>

<style scoped>
.stuffSection__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  min-height: 100%;
  margin-right: 8px;

  border-radius: 6px;
  background: var(--card-background);
}
.stuffSection__header {
  display: flex;
  align-items: center;
  padding: 8px 8px 0;
}
.stuff__list {
  margin: 8px;
  padding: 8px;
  background: var(--standard-background);
  border-radius: 6px;
}
.stuffCard__wrapper {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  padding-top: 24px;
  background: var(--card-background);
  border-radius: 6px;
  font-size: 0.9rem;
}
.stuffCard__wrapper:not(:last-child) {
  margin-bottom: 8px;
}
.stuffDataField__wrapper {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  padding: 4px 8px;
}
.stuffParameter__title {
  font-weight: bold;
}
.stuffDataField__wrapper[data-fieldType="id"] {
  max-width: 8rem;
}
.stuffParameter__input {
  width: 100%;
  padding: 3px 6px;
  margin-left: 8px;

  color: var(--text-default);
  background: var(--standard-background);
  font-weight: bold;

  border-radius: 6px;
  border-bottom: 1px solid transparent;

  transition: border-bottom-color 92ms;
}
.stuffParameter__input:focus {
  border-bottom: 1px solid var(--accent);
}
.stuffActions__wrapper {
  flex: 1 0 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px;
  border-radius: 6px;
}
.judgesSection {
  border: 1px solid var(--accent);
}
.mogulsRoles__wrapper {
  display: flex;
  padding: 6px;
  margin-left: auto;
}
.mogulsRole {
  margin-right: 6px;
  padding: 4px;

  font-weight: bold;
  border-radius: 6px;
  background: var(--card-background);

  cursor: pointer;
}
.mogulsRole:last-child {
  margin-right: 0;
}

/*noinspection CssUnusedSymbol*/
.mogulsRole.mogulsRole-selected {
  background: var(--accent);
  color: var(--text-default);
}
</style>
