function syncCharacterEnabledControl(card, input, status) {
    const enabled = input.checked === true;
    card.dataset.characterEnabled = String(enabled);
    card.classList.toggle('character-disabled', !enabled);
    status.textContent = enabled ? '已启用' : '已停用';
}

export function createCharacterEnabledControl(document, card, { enabled = true, label = '角色' } = {}) {
    const control = document.createElement('label');
    control.className = 'check-row character-enabled-control';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = enabled !== false;
    input.dataset.characterEnabledControl = '';
    input.setAttribute('aria-label', `${label}启用状态`);

    const status = document.createElement('span');
    status.className = 'character-enabled-status';
    status.setAttribute('aria-hidden', 'true');

    input.addEventListener('change', () => syncCharacterEnabledControl(card, input, status));
    control.append(input, status);
    syncCharacterEnabledControl(card, input, status);
    return control;
}

export function getCharacterEnabledFromCard(card) {
    const input = card?.querySelector?.('[data-character-enabled-control]');
    return input ? input.checked === true : card?.dataset?.characterEnabled !== 'false';
}
