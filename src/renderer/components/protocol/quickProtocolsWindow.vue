<script>
import { mapActions, mapGetters } from 'vuex';
import CompetitionSelectMenu from '../appComponents/competitionSelectMenu.vue';
import TwSelect from '../ui/tw-select.vue';
import MMovableElement from '../mixins/MMovableElement';
import html2pdf from 'html2pdf.js';
import { ProtocolDocument } from '../../classes/Protocol/ProtocolDocument';
import { mmToPx, getProtocolPdfOptions } from '../../utils/protocolTemplate-utils';
import { mdiFileDocumentMultipleOutline, mdiMinus, mdiTrashCan } from '@mdi/js';

const { ipcRenderer } = require('electron');

export default {
    name: 'QuickProtocolsWindow',
    mixins: [MMovableElement],
    components: { CompetitionSelectMenu, TwSelect },
    data() {
        return {
            opened: false,
            selectedTemplateId: null,
            icons: {
                panel: mdiFileDocumentMultipleOutline,
                close: mdiMinus,
                remove: mdiTrashCan,
            },
        };
    },
    computed: {
        ...mapGetters('main', {
            competition: 'competition',
            competitions: 'competitions',
            event: 'event',
            appTheme: 'appTheme',
        }),
        ...mapGetters('protocols', {
            protocolTemplates: 'getTemplates',
            quickResolved: 'getResolvedQuickAccess',
        }),
        quickEntries() {
            return this.quickResolved || [];
        },
        templateOptions() {
            return (this.protocolTemplates || []).map((tpl) => ({
                id: tpl.id,
                name: tpl.name,
            }));
        },
    },
    methods: {
        ...mapActions('protocols', ['initializeTemplates', 'addQuickAccess', 'removeQuickAccess']),
        toggle() {
            this.opened = !this.opened;
            if (!this.opened) this.stopDrag();
        },
        handleAddTemplate() {
            if (!this.selectedTemplateId) return;
            this.addQuickAccess({ templateId: this.selectedTemplateId });
            this.selectedTemplateId = null;
        },
        handleRemove(quickId) {
            this.removeQuickAccess({ quickId });
        },
        canRunQuick(item) {
            if (!item || !item.template) return false;
            if (!this.competition) return false;

            const hasRaces = Array.isArray(this.competition.races) && this.competition.races.length > 0;
            const competitors =
                this.competition.competitorsSheet && Array.isArray(this.competition.competitorsSheet.competitors)
                    ? this.competition.competitorsSheet.competitors
                    : [];
            const hasCompetitors = competitors.length > 0;

            return hasRaces && hasCompetitors;
        },
        getCompetitionTitle() {
            try {
                const title =
                    this.competition &&
                    this.competition.mainData &&
                    this.competition.mainData.title &&
                    this.competition.mainData.title.value;
                if (!title || typeof title !== 'string') return 'competition';
                return title.trim().split(' ').join('_');
            } catch (err) {
                console.error('[PROTOCOL] Failed to extract competition title for quick protocol:', err);
                return 'competition';
            }
        },
        async saveQuickPdf(quickItem) {
            if (!this.canRunQuick(quickItem)) return;

            const template = quickItem.template;
            if (!template) return;

            try {
                const protocol = ProtocolDocument.fromJSON(template);
                const html = protocol.render();
                const adjustedHeight = Math.floor(mmToPx(protocol.config.page.height));
                const options = getProtocolPdfOptions(protocol, adjustedHeight);

                const worker = html2pdf().set(options).from(html);
                const blob = await worker.outputPdf('blob');

                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${protocol.name || 'Protocol'}_${this.getCompetitionTitle()}.pdf`;
                link.click();
            } catch (err) {
                console.error('[PROTOCOL] Error saving quick protocol PDF:', err);
            }
        },
        async printQuickProtocol(quickItem) {
            if (!this.canRunQuick(quickItem)) return;

            const template = quickItem.template;
            if (!template) return;

            try {
                const protocol = ProtocolDocument.fromJSON(template);
                const html = protocol.render();
                const pageConfig = protocol.config && protocol.config.page ? protocol.config.page : null;

                ipcRenderer.send('print-protocol-html', {
                    html,
                    title: protocol.name || 'Protocol',
                    pageConfig,
                });
            } catch (err) {
                console.error('[PROTOCOL] Error sending quick protocol to print:', err);
            }
        },
    },
    created() {
        this.initializeTemplates();
    },
};
</script>

<template>
    <div class="quickProtocolsWrapper">
        <v-btn @click="toggle" class="mx-2" icon color="var(--accent)">
            <v-icon>{{ icons.panel }}</v-icon>
        </v-btn>

        <div v-show="opened" ref="movableContainer" class="quickProtocolsWindow" tabindex="0">
            <div class="quickProtocolsWindow__header" tabindex="0">
                <div ref="dragZone" class="quickProtocolsWindow__title">
                    <v-icon small class="mr-2">{{ icons.panel }}</v-icon>
                    <span>Быстрые протоколы</span>
                </div>

                <competition-select-menu v-if="competition" :event="event" :competitions="competitions"
                    :competition="competition" display-mode="stageGroup" />

                <v-hover v-slot:default="{ hover }">
                    <v-icon @click="toggle" class="ml-2" small
                        :color="hover ? $vuetify.theme.themes[appTheme].textDefault : $vuetify.theme.themes[appTheme].accent">
                        {{ icons.close }}
                    </v-icon>
                </v-hover>
            </div>

            <div class="quickProtocolsWindow__body">
                <div class="quickProtocolsWindow__addRow">
                    <tw-select v-model="selectedTemplateId" :items="templateOptions" item-value-key="id"
                        item-text-key="name" placeholder="Новый шаблон" class="quickProtocolsWindow__select" />
                    <button class="tw-button-small" :disabled="!selectedTemplateId" @click="handleAddTemplate">
                        Добавить
                    </button>
                </div>

                <div v-if="!quickEntries.length" class="quickProtocolsWindow__empty">
                    <p>Нет быстрых протоколов.</p>
                    <button class="tw-button-small" :disabled="!templateOptions.length"
                        @click="selectedTemplateId = templateOptions[0] && templateOptions[0].id">
                        Добавить из шаблонов
                    </button>
                </div>

                <ul v-else class="quickProtocolsWindow__list">
                    <li v-for="item in quickEntries" :key="item.id" class="quickProtocolsWindow__item">
                        <div class="quickProtocolsWindow__itemMain">
                            <div class="quickProtocolsWindow__itemTitle">
                                {{ item.title || (item.template && item.template.name) || 'Шаблон' }}
                            </div>
                        </div>
                        <div class="quickProtocolsWindow__itemActions">
                            <button class="tw-button-small" :disabled="!canRunQuick(item)"
                                :title="!canRunQuick(item) ? 'Требуется активное соревнование с гонками и участниками' : ''"
                                @click="saveQuickPdf(item)">
                                PDF
                            </button>
                            <button class="tw-button-small" :disabled="!canRunQuick(item)"
                                :title="!canRunQuick(item) ? 'Требуется активное соревнование с гонками и участниками' : ''"
                                @click="printQuickProtocol(item)">
                                Печать
                            </button>
                            <v-icon class="ml-2" small @click="handleRemove(item.id)">{{ icons.remove }}</v-icon>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.quickProtocolsWrapper {
    & * {
        outline: transparent;
    }

    .quickProtocolsWindow {
        position: absolute;
        z-index: 9999;
        top: 60px;
        left: 420px;
        display: flex;
        flex-direction: column;
        min-width: 360px;
        max-width: 520px;
        min-height: 320px;
        max-height: 520px;
        padding: 0.75rem;
        border-radius: 4px;
        box-shadow: var(--container-shadow-s), 0 0 0 1px var(--background-card-nested);
        transition: box-shadow 64ms;
        background-color: var(--background-card);

        &:hover {
            box-shadow: var(--container-shadow-m);
        }

        &:focus-within {
            box-shadow: var(--container-shadow-m), 0 0 0 1px var(--accent);
        }

        .quickProtocolsWindow__header {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            cursor: move;
            font-weight: bold;
            user-select: none;

            .quickProtocolsWindow__title {
                display: flex;
                align-items: center;
                margin-right: 12px;
            }
        }

        .quickProtocolsWindow__body {
            display: flex;
            flex-direction: column;
            flex: 1 1 0;
            overflow: hidden;

            .quickProtocolsWindow__addRow {
                display: flex;
                align-items: center;
                margin-bottom: 8px;

                .quickProtocolsWindow__select {
                    flex: 1 1 auto;
                    min-width: 0;
                    margin-right: 6px;
                }
            }

            .quickProtocolsWindow__empty {
                flex: 0 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-size: 0.9rem;
                opacity: 0.85;

                p {
                    margin-bottom: 8px;
                }
            }

            .quickProtocolsWindow__list {
                flex: 1 1 auto;
                min-height: 120px;
                max-height: 260px;
                margin: 0;
                padding: 0;
                list-style: none;
                overflow-y: auto;

                .quickProtocolsWindow__item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.4rem 0.5rem;
                    border-radius: 3px;
                    background-color: var(--background-card-nested);
                    margin-bottom: 4px;
                    font-size: 0.9rem;

                    .quickProtocolsWindow__itemMain {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .quickProtocolsWindow__itemTitle {
                            font-weight: bold;
                            max-width: 220px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }

                    .quickProtocolsWindow__itemActions {
                        display: flex;
                        align-items: center;
                    }
                }
            }
        }
    }
}
</style>
