export const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
};
export const button = (label, action, className = 'memory-button') => {
    const node = element('button', className, label);
    node.type = 'button';
    node.onclick = action;
    return node;
};
export const disclosure = (label, className) => {
    const node = element('details', className);
    node.append(element('summary', '', label));
    return node;
};
