/**
 * Request-structure view shared by the SD WebUI and ComfyUI settings panels.
 * Renders the chain produced by `buildScenePlannerChainPreview`: system / user sections
 * plus the tool field table. Editable sections resolve their live text via `getEditable`;
 * tool field rows become editable textareas when `onFieldEdit` / `onFieldReset` are provided.
 */
export function renderScenePlannerChain(container, chain, { getEditable, onFieldEdit, onFieldReset } = {}) {
    container.replaceChildren();

    const previewText = (section) => {
        const editable = section.editable ? getEditable?.(section.key) : null;
        const content = editable
            ? (editable.value.trim() || '(当前为空，不注入)')
            : (typeof section.content === 'string' ? section.content : '(运行时按本次请求生成)');
        return content.length > 1200 ? `${content.slice(0, 1200)}\n...(已截断)` : content;
    };
    const focusEditable = (key) => {
        const target = getEditable?.(key);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus();
    };

    chain.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'chain-item has-sections';
        row.dataset.key = item.key;

        const role = document.createElement('span');
        role.className = `chain-role ${item.role}`;
        role.textContent = item.role;

        const summary = document.createElement('div');
        summary.className = 'chain-summary';
        const summaryText = document.createElement('div');
        summaryText.className = 'chain-summary-text';
        summaryText.textContent = `${index + 1}. ${item.summary || ''}`;
        summary.appendChild(summaryText);

        const sections = Array.isArray(item.sections) ? item.sections : [];
        if (sections.length) {
            const sectionList = document.createElement('div');
            sectionList.className = 'chain-sections';
            sections.forEach((section, sectionIndex) => {
                const sectionRow = document.createElement('div');
                sectionRow.className = 'chain-section';
                sectionRow.dataset.key = section.key;

                const sectionSummary = document.createElement('div');
                sectionSummary.className = 'chain-section-summary';
                sectionSummary.textContent = `${sectionIndex + 1}. ${section.summary || ''}`;
                if (section.editable) {
                    const edit = document.createElement('span');
                    edit.className = 'chain-editable';
                    edit.title = '可在上方编辑';
                    edit.textContent = ' ✏️';
                    edit.addEventListener('click', (event) => {
                        event.stopPropagation();
                        focusEditable(section.key);
                    });
                    sectionSummary.appendChild(edit);
                }
                sectionRow.appendChild(sectionSummary);

                if (Array.isArray(section.variables) && section.variables.length) {
                    const vars = document.createElement('div');
                    vars.className = 'chain-variables';
                    section.variables.forEach((value) => {
                        const span = document.createElement('span');
                        span.textContent = `📎 ${value}`;
                        vars.appendChild(span);
                    });
                    sectionRow.appendChild(vars);
                }

                const sectionPreview = document.createElement('div');
                sectionPreview.className = 'chain-section-content';
                sectionRow.appendChild(sectionPreview);
                sectionRow.addEventListener('click', (event) => {
                    event.stopPropagation();
                    sectionRow.classList.toggle('expanded');
                    sectionPreview.textContent = previewText(section);
                });
                sectionList.appendChild(sectionRow);
            });
            summary.appendChild(sectionList);
        }

        const fields = Array.isArray(item.fields) ? item.fields : [];
        if (fields.length) {
            const fieldList = document.createElement('div');
            fieldList.className = 'chain-fields';
            fields.forEach((field) => {
                const fieldRow = document.createElement('div');
                fieldRow.className = 'chain-field';
                const path = document.createElement('code');
                path.textContent = field.path;
                fieldRow.append(path);
                // 没有编辑回调的面板（SD/NAI）保持只读展示，避免渲染一个改了没效果的输入框
                if (typeof onFieldEdit === 'function') {
                    const description = document.createElement('textarea');
                    description.className = 'chain-field-desc';
                    description.rows = 2;
                    description.dataset.path = field.path;
                    description.setAttribute('aria-label', field.path);
                    description.value = field.description;
                    description.addEventListener('input', () => onFieldEdit(field.path, description.value));
                    fieldRow.append(description);
                    if (typeof onFieldReset === 'function') {
                        const reset = document.createElement('button');
                        reset.type = 'button';
                        reset.className = 'chain-field-reset';
                        reset.title = '恢复内置文案';
                        reset.setAttribute('aria-label', `${reset.title} ${field.path}`);
                        reset.textContent = '↺';
                        reset.addEventListener('click', (event) => {
                            event.stopPropagation();
                            onFieldReset(field.path);
                        });
                        fieldRow.appendChild(reset);
                    }
                } else {
                    const description = document.createElement('span');
                    description.textContent = field.description;
                    fieldRow.append(description);
                }
                fieldList.appendChild(fieldRow);
            });
            summary.appendChild(fieldList);
        }

        row.append(role, summary);
        container.appendChild(row);
    });
}
