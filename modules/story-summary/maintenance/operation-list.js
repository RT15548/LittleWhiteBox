import { MEMORY_COPY as copy } from './copy.js';
import { operationCategory, operationFloor, operationTitle } from './presentation.js';
import { element, button, disclosure } from './ui-elements.js';

const PAGE_SIZE = 20;

/** Each run owns a bounded, chronological list. null page follows its latest page. */
export function createOperationList(renderDetails) {
    let receipt;
    let category = 'all';
    let page = null;
    let openIndex = null;
    const root = element('section', 'memory-changes');
    const heading = element('h4', '', copy.changesHeading);
    const filters = element('div', 'memory-change-filters');
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', copy.changesHeading);
    const choices = new Map();
    for (const key of ['all', 'summary', 'anchors']) {
        const choice = button('', () => {
            category = key; page = null; openIndex = null;
            status.textContent = '';
            renderPage();
        }, 'memory-filter');
        choice.dataset.category = key;
        choices.set(key, choice);
        filters.append(choice);
    }
    const lookup = element('form', 'memory-floor-lookup');
    const label = element('label');
    const floor = element('input');
    floor.type = 'number'; floor.min = '1'; floor.step = '1'; floor.required = true;
    floor.inputMode = 'numeric';
    label.append(element('span', '', copy.floorLookup), floor);
    const locate = element('button', 'memory-button', copy.locateFloor);
    locate.type = 'submit';
    lookup.append(label, locate);
    const status = element('p', 'memory-lookup-status');
    status.setAttribute('role', 'status');
    lookup.onsubmit = event => {
        event.preventDefault();
        const anchors = entries('anchors');
        const target = anchors.findLastIndex(item => operationFloor(item.operation) === Number(floor.value));
        if (target < 0) { status.textContent = copy.floorNotFound; return; }
        category = 'anchors'; page = Math.floor(target / PAGE_SIZE); openIndex = anchors[target].index;
        status.textContent = '';
        renderPage();
        const selected = list.querySelector('details[open] > summary');
        selected.focus();
        selected.scrollIntoView({ block: 'nearest' });
    };
    const list = element('div', 'memory-change-list');
    const pagination = element('nav', 'memory-pagination');
    pagination.setAttribute('aria-label', copy.changesHeading);
    const previous = button(copy.previousPage, () => changePage(currentPage() - 1));
    const position = element('output', 'memory-page-position');
    const following = button(copy.nextPage, () => changePage(currentPage() + 1));
    const latest = button(copy.latestPage, () => { page = null; openIndex = null; renderPage(); });
    pagination.append(previous, position, following, latest);
    root.append(heading, filters, lookup, status, list, pagination);

    function entries(group = category) {
        return receipt.operations.map((operation, index) => ({ operation, index }))
            .filter(item => group === 'all' || operationCategory(item.operation) === group);
    }
    const pages = () => Math.max(1, Math.ceil(entries().length / PAGE_SIZE));
    const currentPage = () => Math.min(page ?? pages() - 1, pages() - 1);
    function changePage(nextPage) {
        page = nextPage; openIndex = null;
        renderPage();
        filters.scrollIntoView({ block: 'nearest' });
    }
    function renderPage() {
        root.hidden = !receipt.operations.length;
        for (const [key, choice] of choices) {
            const count = entries(key).length;
            choice.textContent = copy.count(key === 'all' ? copy.allChanges : copy[key], count);
            choice.setAttribute('aria-pressed', String(key === category));
            choice.disabled = count === 0;
        }
        lookup.hidden = entries('anchors').length === 0;
        floor.max = String(receipt.cutoff);
        const current = currentPage();
        const old = new Map([...list.children].map(node => [Number(node.dataset.operationIndex), node]));
        const nodes = entries().slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE).map(({ operation, index }) => {
            const signature = JSON.stringify([operation, receipt.eventNames]);
            const existing = old.get(index);
            if (existing?._value === signature) {
                existing.open = openIndex === index;
                return existing;
            }
            const node = disclosure(operationTitle(operation), 'memory-operation');
            node.dataset.operationIndex = String(index);
            node.dataset.category = operationCategory(operation);
            node._value = signature;
            // Comparison DOM is materialized only when the reader opens this item.
            const populate = () => { if (node.children.length === 1) node.append(renderDetails(operation, receipt)); };
            node.ontoggle = () => {
                if (!node.isConnected) return;
                if (node.open) {
                    page = current;
                    openIndex = index;
                    populate();
                    for (const other of list.children) if (other !== node) other.open = false;
                } else if (openIndex === index) openIndex = null;
            };
            node.open = openIndex === index;
            if (node.open) populate();
            return node;
        });
        // Keep unchanged nodes (including focused disclosures) in place on live refresh.
        for (const node of [...list.children]) if (!nodes.includes(node)) node.remove();
        nodes.forEach((node, index) => { if (list.children[index] !== node) list.insertBefore(node, list.children[index] || null); });
        position.value = copy.pagePosition(current + 1, pages());
        previous.disabled = current === 0;
        following.disabled = current === pages() - 1;
        latest.disabled = following.disabled;
        pagination.hidden = pages() <= 1;
    }
    return {
        element: root,
        update(value) {
            receipt = value;
            // Rollback can remove a category or the tail of a still-retained run.
            if (!entries().length) { category = 'all'; page = null; openIndex = null; }
            if (page != null) page = Math.min(page, pages() - 1);
            if (openIndex >= receipt.operations.length) openIndex = null;
            renderPage();
        },
    };
}
