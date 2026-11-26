import type { Result, Definition, Diagnostic, Source, Change, UpdateStage } from '../types.js';
import type { ErrorObject } from 'ajv';
import { COPY, errorText, playerErrorText, parameterIssueText, restorationLabel, restorationText } from './copy.js';
import { overlaps } from '../engine/data.js';
import { parameterIssues, fieldName } from '../definition/schema-fields.js';
import { changeTree, type ChangeTree } from './change-tree.js';
import { isOpeningReceipt } from '../runtime/history.js';

export const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] => {
    const node = document.createElement(tag);
    if (text !== undefined) {node.textContent = text;}
    if (className) {node.className = className;}
    return node;
};
/** Display stage only: opening initialization is not a model update stage. */
export function resultStage(result?: Result, stage?: UpdateStage): 'opening' | UpdateStage | undefined {
    return result?.ok && result.receipt && isOpeningReceipt(result.receipt) ? 'opening' : stage;
}
export function resultLabel(result: Result): string {
    if (!result.ok) {return COPY.failed;}
    if (!result.committed) {return COPY.previewLabel;}
    if (result.saved === false) {return COPY.phases.unsaved;}
    const applied = resultStage(result) === 'opening' ? COPY.openingInitialized
        : result.actions.length ? COPY.actionsApplied(result.actions.length) : result.changes.length ? COPY.valuesOnly : COPY.noActions;
    const outcome = result.receipt?.beforeUpdate?.outcome;
    const label = outcome && outcome !== 'applied' ? COPY.beforeOutcomes[outcome] : applied;
    if (outcome === 'failed' || result.diagnostics.some(issue => issue.code === 'extension-after-failed') || result.saved === undefined) {return label;}
    return result.restoration ? restorationLabel(result) : label;
}
export function showDiagnostics(root: HTMLElement, diagnostics: Diagnostic[], definition?: Definition, author = false) {
    for (const error of diagnostics) {
        const rule = [...(definition?.rules || []), ...(definition?.constraints || []), ...(definition?.triggers || [])].find(item => item.id === error.rule);
        root.append(element('p', [(author ? errorText : playerErrorText)(error, definition), !error.condition && !error.parameters ? rule?.description : undefined].filter(Boolean).join(' ')));
        if (Array.isArray(error.errors) && !error.parameters) {
            const fields = parameterIssues(error.code === 'state-schema' && definition ? definition.schema : {}, error.errors as ErrorObject[]);
            for (const field of fields) {root.append(element('p', parameterIssueText(field)));}
        }
        if (author) {
            const details = element('details'); details.append(element('summary', COPY.details));
            details.append(element('pre', JSON.stringify(error, null, 2)));
            root.append(details);
        }
    }
}
/** Rule check: whether the draft works, and the opening state it produces. */
export function showCheck(root: HTMLElement, result: Result) {
    root.replaceChildren();
    if (!result.ok) { root.append(element('p', COPY.checkFailed, 'lwb-state3-status')); showDiagnostics(root, result.diagnostics, undefined, true); return; }
    root.append(element('p', COPY.checkPassed, 'lwb-state3-status'), element('pre', JSON.stringify(result.state, null, 2)));
}
export function showResult(root: HTMLElement, result: Result, definition?: Definition, author = false) {
    root.replaceChildren();
    if (!result.ok) {
        root.append(element('p', COPY.failed));
        showDiagnostics(root, result.diagnostics || [], definition, author);
        return;
    }
    const restorationWarning = Boolean(result.restoration?.length);
    if (!result.committed) {
        if (result.changes.length) {root.append(element('p', COPY.previewed, 'lwb-state3-status'));}
    } else if (!restorationWarning || result.saved === false) {
        const status = element('p', result.saved === false ? COPY.unconfirmed : resultLabel(result), 'lwb-state3-status');
        status.setAttribute('role', 'status'); root.append(status);
    }
    if (result.restoration?.length) {
        const warning = element('div'); warning.setAttribute('role', 'alert');
        for (const issue of result.restoration) {
            warning.append(element('p', restorationText(issue)));
        }
        if (result.restoration.some(issue => ['constraint', 'state-schema'].includes(issue.code))) {warning.append(element('p', COPY.conflictHelp));}
        root.append(warning);
    }
    showDiagnostics(root, result.diagnostics, definition, author);
    if (result.receipt?.beforeUpdate?.diagnostics.length) {showDiagnostics(root, result.receipt.beforeUpdate.diagnostics, definition, author);}
    const shown = result.changes;
    const shownReasons = new Set<number>();
    const sourceInfo = (source?: Source) => {
        const rule = source?.kind === 'action' ? definition?.actions.find(item => item.id === source.id)
            : source?.kind === 'trigger' ? definition?.triggers?.find(item => item.id === source.id)
                : definition?.rules.find(item => item.id === source?.id);
        const title = source?.title || (rule && 'title' in rule ? rule.title : undefined);
        // An action's description is its instruction to the update model, not a player-facing explanation.
        return { label: title || (source ? COPY.reasons[source.kind] : COPY.restoredChanges),
            description: source?.kind === 'action' ? undefined : source?.description || rule?.description, tag: title || [source && COPY.reasons[source.kind], source?.id].filter(Boolean).join(' · ') };
    };
    const sourceKey = (source?: Source) => JSON.stringify([source?.kind, source?.id]);
    const groups = new Map<string, { source?: Source; changes: { change: Change; sources: Source[] }[] }>();
    for (const change of shown) {
        const sources = [...new Map(result.provenance.filter(item => overlaps(item.path, change.path))
            .map(item => [sourceKey(item.source), item.source])).values()];
        const source = sources[0], key = sourceKey(source);
        if (!groups.has(key)) {groups.set(key, { source, changes: [] });}
        groups.get(key)!.changes.push({ change, sources });
    }
    for (const group of groups.values()) {
        const section = element('details', undefined, 'lwb-state3-change-group'), info = sourceInfo(group.source);
        section.open = Boolean(group.source && ['input', 'action'].includes(group.source.kind));
        const tree = changeTree(group.changes, result.state);
        section.append(element('summary', COPY.sourceGroup(info.label, tree.length)));
        if (info.description) {section.append(element('p', info.description, 'lwb-state3-source-description'));}
        const renderLeaf = ({ change, sources }: typeof group.changes[number]) => {
            const line = element('div', undefined, 'lwb-state3-change');
            line.append(element('strong', fieldName(definition?.schema ?? {}, change.path)),
                element('div', change.before === undefined ? `${COPY.added} ＋ ${JSON.stringify(change.after)}` : change.removed ? `${COPY.removed} － ${JSON.stringify(change.before)}` : `${JSON.stringify(change.before)} → ${JSON.stringify(change.after)}`));
            if (sources.length > 1) {line.append(element('small', sources.slice(1).map(source => sourceInfo(source).tag).join(' / ')));}
            return line;
        };
        const renderNode = (node: ChangeTree<typeof group.changes[number]>): HTMLElement => {
            if (!node.children.length) {return renderLeaf(node.items[0]);}
            const branch = element('details', undefined, 'lwb-state3-change'), body = element('div');
            branch.append(element('summary', COPY.sourceGroup(fieldName(definition?.schema ?? {}, node.path), node.children.length)), body);
            // Closed structures hold no field DOM. Closing releases nested DOM
            // and its listeners; reopening derives it from the same result.
            branch.addEventListener('toggle', () => {
                body.replaceChildren();
                if (branch.open) {body.append(...node.children.map(renderNode));}
            });
            return branch;
        };
        for (const note of result.annotations || []) {
            if (shownReasons.has(note.index) || !group.changes.some(({ change, sources }) =>
                note.path && overlaps(note.path, change.path) || note.action && sources.some(source => source.id === note.action))) {continue;}
            const reason = note.fields.find(([key]) => key === 'reason');
            if (reason) {
                section.append(element('p', typeof reason[1] === 'string' ? reason[1] : JSON.stringify(reason[1]), 'lwb-state3-reason'));
                shownReasons.add(note.index);
            }
        }
        const body = element('div'); section.append(body);
        const expand = () => {
            body.replaceChildren();
            if (section.open) {body.append(...tree.map(renderNode));}
        };
        section.addEventListener('toggle', expand);
        expand();
        root.append(section);
    }
    for (const annotation of result.annotations || []) {
        const extras = annotation.fields.filter(([key]) => key !== 'reason' || !shownReasons.has(annotation.index));
        if (!extras.length) {continue;}
        const section = element('details');
        section.append(element('summary', `${COPY.annotation} · ${annotation.index + 1} · ${annotation.action || annotation.path?.join(' → ') || ''}`));
        const fields = element('dl');
        for (const [key, value] of extras) {fields.append(element('dt', key), element('dd', typeof value === 'string' ? value : JSON.stringify(value, null, 2)));}
        section.append(fields); root.append(section);
    }
    if (!shown.length && (!result.committed || result.actions.length || result.saved === false || result.restoration)) {
        root.append(element('p', COPY.empty));
    }
}
