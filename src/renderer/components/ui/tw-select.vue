<script>
export default {
    name: 'tw-select',
    props: {
        value: {
            type: [String, Number, Object, Boolean],
            default: null,
        },
        items: {
            type: Array,
            default: () => [],
        },
        itemValueKey: {
            type: String,
            default: 'value',
        },
        itemTextKey: {
            type: String,
            default: 'label',
        },
        placeholder: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isOpen: false,
        };
    },
    computed: {
        normalizedItems() {
            return (this.items || []).map((raw, idx) => {
                if (!raw || typeof raw !== 'object') {
                    return {
                        key: idx,
                        value: raw,
                        label: raw != null ? String(raw) : '',
                        raw,
                    };
                }

                const value = raw[this.itemValueKey];
                const label =
                    raw[this.itemTextKey] != null && raw[this.itemTextKey] !== ''
                        ? raw[this.itemTextKey]
                        : value != null
                            ? String(value)
                            : '';

                return {
                    key: raw.id != null ? raw.id : idx,
                    value,
                    label,
                    raw,
                };
            });
        },
        selectedItem() {
            return this.normalizedItems.find((item) => this.isSameValue(item.value, this.value)) || null;
        },
        displayText() {
            if (this.selectedItem && this.selectedItem.label) return this.selectedItem.label;
            return '';
        },
    },
    methods: {
        isSameValue(a, b) {
            return a === b;
        },
        open() {
            if (this.disabled || !this.normalizedItems.length) return;
            this.isOpen = true;
        },
        close() {
            this.isOpen = false;
        },
        toggle() {
            if (this.isOpen) this.close();
            else this.open();
        },
        selectItem(item) {
            if (!item) return;
            if (this.disabled) {
                this.close();
                return;
            }
            const nextValue = item.value;
            if (!this.isSameValue(nextValue, this.value)) {
                this.$emit('input', nextValue);
                this.$emit('change', nextValue);
            }
            this.close();
        },
        handleBlur() {
            this.close();
        },
        handleKeydown(event) {
            if (this.disabled) return;
            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                this.toggle();
            }
            if (event.key === 'Escape') {
                this.close();
            }
        },
    },
};
</script>

<template>
    <div class="twSelect" :class="{ 'twSelect--disabled': disabled }" tabindex="0" @click.stop="toggle"
        @keydown="handleKeydown" @blur="handleBlur">
        <div class="twSelect__current">
            <span class="twSelect__text">
                {{ displayText || placeholder }}
            </span>
            <span class="twSelect__icon">▾</span>
        </div>

        <div class="twSelect__dropdown" :class="{ 'twSelect__dropdown--open': isOpen }">
            <div v-for="item in normalizedItems" :key="item.key" class="twSelect__item"
                :class="{ 'twSelect__item--selected': isSameValue(item.value, value) }"
                @mousedown.prevent.stop="selectItem(item)">
                {{ item.label }}
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use './../../assets/styles/shared/selectableListItem' as *;

.twSelect {
    position: relative;
    display: inline-flex;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    border-radius: 4px;
    background-color: var(--background-deep);
    cursor: pointer;
    user-select: none;
    outline: none;

    &--disabled {
        opacity: 0.5;
        cursor: default;
    }

    &__current {
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border: 1px solid transparent;
        transition: background-color 92ms, border-color 92ms;

        .twSelect--disabled & {
            cursor: default;
        }
    }

    &:hover:not(.twSelect--disabled),
    &:focus-within:not(.twSelect--disabled) {
        .twSelect__current {
            background-color: var(--subject-background);
            border-color: var(--accent);
        }
    }

    &__text {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.9rem;
    }

    &__icon {
        flex: 0 0 auto;
        margin-left: 6px;
        font-size: 0.7rem;
        opacity: 0.7;
    }

    &__dropdown {
        position: absolute;
        z-index: 4;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 2px;
        border-radius: 4px;
        background-color: var(--background-card);
        box-shadow: 0 2px 4px 0 var(--standard-background);
        max-height: 220px;
        overflow-y: auto;
        transform-origin: top;
        transform: scaleY(0);
        opacity: 0;
        transition: transform 92ms ease-out, opacity 92ms, box-shadow 92ms;
    }

    &__dropdown--open {
        transform: scaleY(1);
        opacity: 1;
    }

    &__item {
        @include selectable-list-item;
        padding: 0.35rem 0.6rem;
        font-size: 0.9rem;

        &--selected {
            background-color: var(--accent) !important;
            color: var(--text-default) !important;
        }
    }
}
</style>
