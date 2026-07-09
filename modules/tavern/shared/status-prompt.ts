import jsYaml from '../../../libs/js-yaml.mjs';
import type {
    TavernStatusBlock,
    TavernStatusDocument,
    TavernStatusField,
    TavernStatusGaugeField,
    TavernStatusItemField,
    TavernStatusSubject,
    TavernStatusTab,
    TavernStatusTagField,
    TavernStatusTextField,
} from './status-state';

type YamlValue = null | boolean | number | string | YamlValue[] | { [key: string]: YamlValue | undefined };

function normalizePromptText(value: unknown = ''): string {
    return String(value ?? '').replace(/\r\n/g, '\n').trim();
}

function numberOrUndefined(value: unknown): number | undefined {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
}

function addText(target: Record<string, YamlValue | undefined>, key: string, value: unknown) {
    const text = normalizePromptText(value);
    if (text) {target[key] = text;}
}

function addNumber(target: Record<string, YamlValue | undefined>, key: string, value: unknown) {
    const numeric = numberOrUndefined(value);
    if (numeric !== undefined) {target[key] = numeric;}
}

function addNonZeroNumber(target: Record<string, YamlValue | undefined>, key: string, value: unknown) {
    const numeric = numberOrUndefined(value);
    if (numeric !== undefined && numeric !== 0) {target[key] = numeric;}
}

function addBoolean(target: Record<string, YamlValue | undefined>, key: string, value: unknown) {
    if (value === true) {target[key] = true;}
}

function stripUndefined<T extends Record<string, YamlValue | undefined>>(value: T): Record<string, YamlValue> {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Record<string, YamlValue>;
}

function statusFieldToPromptValue(field: TavernStatusField, block: TavernStatusBlock): Record<string, YamlValue> {
    const output: Record<string, YamlValue | undefined> = {};
    if (block.form === 'gauge') {
        const gauge = field as TavernStatusGaugeField;
        addText(output, 'name', gauge.name);
        addNumber(output, 'value', gauge.value);
        addNonZeroNumber(output, 'min', gauge.min);
        addNumber(output, 'max', gauge.max);
        return stripUndefined(output);
    }
    if (block.form === 'tag') {
        const tag = field as TavernStatusTagField;
        addText(output, 'label', tag.label);
        addText(output, 'kind', tag.kind);
        return stripUndefined(output);
    }
    if (block.form === 'item') {
        const item = field as TavernStatusItemField;
        addText(output, 'name', item.name);
        addNumber(output, 'qty', item.qty);
        addBoolean(output, 'key', item.key);
        addText(output, 'slot', item.slot);
        addText(output, 'lore', item.lore);
        addBoolean(output, 'empty', item.empty);
        return stripUndefined(output);
    }
    const text = field as TavernStatusTextField;
    addText(output, 'name', text.name);
    addText(output, 'value', text.value);
    return stripUndefined(output);
}

function statusBlockToPromptValue(block: TavernStatusBlock): Record<string, YamlValue> {
    return stripUndefined({
        title: normalizePromptText(block.title),
        form: normalizePromptText(block.form),
        fields: (Array.isArray(block.fields) ? block.fields : [])
            .map((field) => statusFieldToPromptValue(field, block))
            .filter((field) => Object.keys(field).length),
    });
}

function statusTabToPromptValue(tab: TavernStatusTab): Record<string, YamlValue> {
    return stripUndefined({
        label: normalizePromptText(tab.label),
        blocks: (Array.isArray(tab.blocks) ? tab.blocks : [])
            .map(statusBlockToPromptValue)
            .filter((block) => Object.keys(block).length),
    });
}

function statusSubjectToPromptValue(subject: TavernStatusSubject): Record<string, YamlValue> {
    return stripUndefined({
        name: normalizePromptText(subject.name),
        subtitle: normalizePromptText(subject.subtitle),
        tabs: (Array.isArray(subject.tabs) ? subject.tabs : [])
            .map(statusTabToPromptValue)
            .filter((tab) => Object.keys(tab).length),
    });
}

export function buildTavernStatusPanelYaml(document: TavernStatusDocument | null | undefined): string {
    const subjects = (Array.isArray(document?.subjects) ? document.subjects : [])
        .map(statusSubjectToPromptValue)
        .filter((subject) => Object.keys(subject).length);
    if (!subjects.length) {return '';}
    return jsYaml.dump({
        status_panel: {
            subjects,
        },
    }, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
    }).trim();
}
