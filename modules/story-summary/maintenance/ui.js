import { MEMORY_COPY as copy } from './copy.js';
import { comparisonRows, memoryLabel, operationTitle } from './presentation.js';
import { element, button, disclosure } from './ui-elements.js';
import { createOperationList } from './operation-list.js';
import { reportMarkdown } from './report-markdown.js';

export function createMemoryMaintenancePage(root, send) {
    let chatId = null;
    let next = null;
    let runIds = [];
    let requestSequence = 0;
    let sourceRequest = null;
    const authorization = element('section', 'memory-settings');
    const label = element('label', 'memory-authorization');
    const toggle = element('input');
    toggle.type = 'checkbox';
    toggle.id = 'memory-maintenance-enabled';
    toggle.setAttribute('role', 'switch');
    label.append(element('span', 'memory-authorization-title', copy.toggle), element('small', '', copy.scope), toggle);
    const api = disclosure(copy.apiHeading, 'memory-api');
    api.append(element('p', '', copy.api));
    const settingsState = element('p', 'memory-settings-state');
    settingsState.setAttribute('role', 'status');
    authorization.append(label, element('p', 'memory-hint', copy.behavior), api, settingsState);
    const toolbar = element('div', 'memory-toolbar');
    const heading = element('div', 'memory-heading');
    heading.append(element('h3', '', copy.heading), element('span', '', copy.currentChat));
    const cancel = button(copy.cancel, () => send('MEMORY_MAINTENANCE_CANCEL'));
    toolbar.append(heading, cancel);
    const state = element('p', 'memory-state');
    state.setAttribute('role', 'status');
    state.setAttribute('aria-live', 'polite');
    const ranges = element('dl', 'memory-ranges');
    ranges.hidden = true;
    const index = element('div', 'memory-index-state');
    const repair = button(copy.repair, () => { repair.disabled = true; send('MEMORY_MAINTENANCE_REPAIR'); });
    index.append(element('span', '', copy.indexPending), repair);
    const list = element('div', 'memory-results');
    const empty = element('div', 'memory-empty');
    const emptyHint = element('p');
    empty.append(element('p', 'memory-empty-title', copy.empty), emptyHint);
    const more = button(copy.more, () => { more.disabled = true; send('MEMORY_MAINTENANCE_QUERY', { offset: next }); });
    more.classList.add('memory-more');
    root.append(authorization, toolbar, ranges, state, index, list, empty, more);
    cancel.hidden = index.hidden = more.hidden = true;
    const updateEmpty = () => { emptyHint.textContent = toggle.checked ? copy.emptyEnabled : copy.emptyDisabled; };
    toggle.onchange = () => { settingsState.textContent = ''; updateEmpty(); };
    updateEmpty();

    const reader = element('dialog', 'memory-reader');
    reader.setAttribute('aria-labelledby', 'memory-source-title');
    const readerHeader = element('header');
    const readerTitle = element('h3', '', copy.source.heading);
    readerTitle.id = 'memory-source-title';
    const close = button(copy.source.close, () => reader.close());
    readerHeader.append(readerTitle, close);
    const readerStatus = element('p', 'memory-hint');
    readerStatus.setAttribute('role', 'status');
    const sourceText = element('div', 'memory-source-text');
    const sourceMore = button(copy.source.more, () => requestSource(sourceRequest.floor, sourceRequest.nextOffset, true));
    const retry = button(copy.source.retry, () => requestSource(sourceRequest.floor, sourceRequest.offset));
    const previous = button(copy.source.previous, () => requestSource(sourceRequest.previousFloor));
    const following = button(copy.source.next, () => requestSource(sourceRequest.nextFloor));
    const readerBody = element('div', 'memory-reader-body');
    readerBody.append(readerStatus, sourceText, sourceMore, retry);
    const readerFooter = element('footer');
    readerFooter.append(previous, following);
    reader.append(readerHeader, element('p', 'memory-source-note', copy.source.note), readerBody, readerFooter);
    root.append(reader);
    reader.addEventListener('close', () => { sourceRequest = null; });

    function setChat(nextChatId) {
        if (nextChatId === chatId) return;
        chatId = nextChatId;
        clearReceipts();
        next = null;
        runIds = [];
        more.hidden = true;
        cancel.hidden = index.hidden = empty.hidden = true;
        state.textContent = copy.loading;
        ranges.hidden = true;
        if (reader.open) reader.close();
    }

    function requestSource(floor, offset = 0, append = false) {
        const receiptId = sourceRequest.receiptId;
        sourceRequest = { chatId, receiptId, floor, offset, append, requestId: ++requestSequence };
        if (!append) sourceText.replaceChildren();
        readerTitle.textContent = `${copy.source.heading} · ${copy.floor(floor)}`;
        readerStatus.textContent = copy.source.loading;
        previous.disabled = following.disabled = true;
        sourceMore.hidden = retry.hidden = true;
        send('MEMORY_MAINTENANCE_SOURCE', { chatId, receiptId, floor, offset, requestId: sourceRequest.requestId });
    }

    function evidenceLinks(receipt, evidence) {
        const links = element('div', 'memory-evidence');
        links.append(element('span', '', copy.evidence));
        for (const floor of [...new Set(evidence.map(item => item.floor))]) {
            links.append(button(copy.floor(floor), () => {
                sourceRequest = { receiptId: receipt.receiptId };
                reader.showModal();
                requestSource(floor);
            }, 'memory-source-link'));
        }
        return links;
    }

    function compare(changes, eventNames, full = false) {
        const comparison = element('div', 'memory-comparison');
        for (const side of ['before', 'after']) {
            const column = element('section', `memory-version memory-version-${side}`);
            column.append(element('h5', '', copy[side]));
            for (const change of changes) {
                // Merged fragments belong on the before side, not as empty after cards.
                if (full && change[side] == null) continue;
                const record = element('div', 'memory-record');
                if (change[side] == null) record.append(element('p', '', copy.absent));
                else {
                    const rows = comparisonRows(change, eventNames, full);
                    if (change.collection === 'events' && (full || change.before == null || change.after == null)) {
                        const values = Object.fromEntries(rows.map(row => [row.field, row[side]]));
                        record.append(element('h6', 'memory-event-title', values.title), element('p', 'memory-event-story', values.summary),
                            element('p', 'memory-hint', [values.timeLabel, values.participants, values.memoryRole].filter(value => value && value !== copy.notSet).join(' · ')));
                        if (change[side].causedBy?.length) record.append(element('p', 'memory-hint', `${copy.fields.causedBy}：${values.causedBy}`));
                    } else {
                        const fields = element('dl');
                        for (const row of rows) fields.append(element('dt', '', row.label), element('dd', '', row[side]));
                        record.append(fields);
                    }
                }
                column.append(record);
            }
            comparison.append(column);
        }
        return comparison;
    }

    function renderOperation(operation, receipt) {
        const block = element('div', 'memory-operation-body');
        for (const reason of new Set(operation.changes.filter(change => change.retired).map(change => change.retired.reason))) {
            block.append(element('p', 'memory-retired', copy.retired[reason]));
        }
        if (operation.kind === 'merge') {
            const parts = operation.changes.filter(change => change.key === operation.key || change.after == null);
            block.append(compare(parts, receipt.eventNames, true));
            const related = operation.changes.filter(change => !parts.includes(change));
            if (related.length) {
                const details = disclosure(copy.count(copy.related, related.length), 'memory-related');
                for (const change of related) details.append(element('p', 'memory-related-title', memoryLabel(change.collection, change.after)), compare([change], receipt.eventNames));
                block.append(details);
            }
        } else {
            for (const change of operation.changes) block.append(compare([change], receipt.eventNames));
        }
        return block;
    }

    function renderReceipt(receipt) {
        const details = element('details', 'memory-receipt');
        details.dataset.receiptId = receipt.id;
        const summary = element('summary');
        const content = element('div', 'memory-receipt-body');
        const completed = element('p', 'memory-hint');
        const report = element('section', 'memory-report');
        const reportViewport = element('div', 'memory-report-viewport');
        const reportContent = element('div', 'memory-outcome');
        reportViewport.append(reportContent);
        let expandedReport = false;
        const expandReport = button(copy.expandReport, () => {
            expandedReport = !expandedReport;
            report.classList.toggle('is-expanded', expandedReport);
            expandReport.textContent = expandedReport ? copy.collapseReport : copy.expandReport;
            expandReport.setAttribute('aria-expanded', String(expandedReport));
        }, 'memory-report-toggle');
        expandReport.hidden = true;
        expandReport.setAttribute('aria-expanded', 'false');
        report.append(element('h4', '', copy.report), reportViewport, expandReport);
        const measureReport = () => {
            if (!details.open || report.hidden || expandedReport) return;
            const clipped = reportContent.getBoundingClientRect().height > reportViewport.clientHeight + 1;
            expandReport.hidden = !clipped;
            report.classList.toggle('is-clipped', clipped);
        };
        const observer = new ResizeObserver(measureReport);
        observer.observe(reportContent);
        details.addEventListener('toggle', measureReport);
        const operations = createOperationList(renderOperation);
        const coverageDetails = disclosure(copy.coverage, 'memory-coverage');
        content.append(completed, report, operations.element, coverageDetails);
        details.append(summary, content);
        let previousReport;
        let previousCoverage;
        details.update = receipt => {
            summary.replaceChildren();
            const meta = element('span', 'memory-receipt-meta');
            const time = element('time', '', new Date(receipt.createdAt).toLocaleString());
            time.dateTime = new Date(receipt.createdAt).toISOString();
            meta.append(element('span', '', copy.boundary(receipt.cutoff)), time);
            const titles = element('span', 'memory-receipt-titles');
            for (const operation of receipt.operations.slice(-2)) titles.append(element('strong', '', operationTitle(operation)));
            if (!receipt.operations.length) titles.append(element('strong', '', copy.noChanges));
            if (receipt.operations.length > 2) titles.append(element('span', 'memory-hint', copy.moreChanges(receipt.operations.length - 2)));
            const counts = Object.entries(receipt.counts).filter(([, count]) => count > 0).map(([key, count]) => copy.count(copy[key], count));
            summary.append(meta, titles);
            if (counts.length) summary.append(element('span', 'memory-counts', counts.join(' · ')));
            const coverage = receipt.coverage;
            if (coverage.missingAnchors.length) summary.append(element('span', 'memory-outstanding', copy.count(copy.missing, coverage.missingAnchors.length)));
            if (receipt.outcome) summary.append(element('span', 'memory-hint', copy.states[receipt.outcome.status]));
            completed.hidden = !receipt.completed?.length;
            completed.textContent = receipt.completed?.length ? `${copy.completedRanges}：${copy.ranges(receipt.completed)}` : '';
            report.hidden = !receipt.summary;
            if (previousReport !== receipt.summary) {
                previousReport = receipt.summary;
                reportContent.replaceChildren(reportMarkdown(receipt.summary));
            }
            operations.update(receipt);
            const coverageSignature = JSON.stringify([receipt.receiptId, coverage]);
            if (previousCoverage === coverageSignature) return;
            previousCoverage = coverageSignature;
            while (coverageDetails.children.length > 1) coverageDetails.lastElementChild.remove();
            if (coverage.supplied.length) coverageDetails.append(evidenceLinks(receipt, coverage.supplied));
            for (const [key, items] of Object.entries({ missingAnchors: coverage.missingAnchors })) {
                if (!items.length) continue;
                const section = element('section');
                section.append(element('h4', '', copy.count(copy[key === 'missingAnchors' ? 'missing' : key], items.length)));
                const entries = element('ul');
                for (const item of items) {
                    const entry = element('li');
                    const floors = item.ranges?.map(range => range.floor);
                    entry.append(element('span', '', floors?.length ? copy.sourceRange(Math.min(...floors), Math.max(...floors)) : copy.floor(item.floor)));
                    if (key === 'missingAnchors' && copy.anchorStates[item.status]) entry.append(element('span', 'memory-hint', ` · ${copy.anchorStates[item.status]}`));
                    entries.append(entry);
                }
                section.append(entries);
                coverageDetails.append(section);
            }
        };
        details.dispose = () => observer.disconnect();
        details.update(receipt);
        return details;
    }

    function clearReceipts(keep = new Set()) {
        for (const node of [...list.children]) if (!keep.has(node.dataset.receiptId)) {
            node.dispose();
            node.remove();
        }
    }

    return {
        setChat,
        setEnabled(enabled) { toggle.checked = enabled === true; updateEmpty(); },
        getEnabled: () => toggle.checked,
        settingsSaved(success) { settingsState.textContent = success ? copy.settingsSaved : copy.settingsFailed; },
        open() { state.textContent = copy.loading; send('MEMORY_MAINTENANCE_QUERY'); },
        close() { if (reader.open) reader.close(); },
        renderSource(data) {
            if (!sourceRequest || data.requestId !== sourceRequest.requestId) return;
            if (data.chatId !== chatId) { reader.close(); return; }
            const append = sourceRequest.append;
            sourceRequest = { ...sourceRequest, ...data };
            if (data.status !== 'ready') {
                readerStatus.textContent = copy.source.unavailable;
                retry.hidden = false;
                return;
            }
            readerStatus.textContent = '';
            readerTitle.textContent = `${copy.floor(data.floor)} · ${data.name || copy.source.roles[data.role]}`;
            if (!append) sourceText.replaceChildren();
            sourceText.append(element('span', '', data.text));
            previous.disabled = data.previousFloor == null;
            following.disabled = data.nextFloor == null;
            sourceMore.hidden = data.nextOffset == null;
        },
        render(data) {
            if (data.chatId != null) setChat(data.chatId);
            if (data.ranges) {
                ranges.hidden = data.ranges.cutoff < 1;
                ranges.replaceChildren(element('dt', '', copy.completedRanges), element('dd', '', copy.ranges(data.ranges.completed)),
                    element('dt', '', copy.pendingRanges), element('dd', '', copy.ranges(data.ranges.pending)));
            }
            const running = ['running', 'queued', 'saving', 'indexing'].includes(data.state?.status);
            const code = data.state?.code;
            const blocked = ['unconfirmed', 'source_invalid', 'history_invalid'].includes(data.state?.status);
            state.textContent = blocked ? copy.states[data.state.status]
                : code ? copy.errors[code] || copy.errors.agent_failed : copy.states[data.state?.status] || '';
            if (running && data.state?.progress) {
                const progress = copy.progress({ ...data.state.progress, ...(data.state.status === 'running' ? {} : { action: null }) });
                state.textContent = data.state.status === 'running' ? progress : [state.textContent, progress].filter(Boolean).join(' · ');
            }
            state.dataset.status = data.state?.status || 'idle';
            updateEmpty();
            cancel.hidden = !running;
            cancel.disabled = data.state?.status === 'saving';
            index.hidden = blocked || data.index?.status !== 'pending';
            repair.disabled = running || blocked;
            if (data.total != null) {
                runIds = data.runIds;
                clearReceipts(new Set(runIds));
            }
            for (const receipt of data.items || []) {
                const existing = [...list.children].find(node => node.dataset.receiptId === receipt.id);
                const signature = JSON.stringify(receipt);
                const node = existing || renderReceipt(receipt);
                if (existing && existing._receipt !== signature) existing.update(receipt);
                node._receipt = signature;
                if (!existing) list.append(node);
            }
            const loaded = new Map([...list.children].map(node => [node.dataset.receiptId, node]));
            runIds.filter(id => loaded.has(id)).forEach((id, position) => {
                const node = loaded.get(id);
                if (list.children[position] !== node) list.insertBefore(node, list.children[position] || null);
            });
            empty.hidden = list.children.length > 0 || running || blocked || !!code;
            // New runs may arrive while older pages are open. Query the first gap,
            // not the number of mounted cards, so an unseen middle page is not skipped.
            const missing = runIds.findIndex(id => !loaded.has(id));
            next = missing >= 0 ? missing : null;
            more.disabled = false;
            more.hidden = next == null;
        },
    };
}
