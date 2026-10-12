// Linkedom does not implement HTMLDialogElement. These tests exercise lifecycle callbacks;
// actual top-layer ordering, focus and background inertness are checked in the browser.
export function installDialogDom(document) {
    const createElement = document.createElement.bind(document);
    document.createElement = (tag, options) => {
        const element = createElement(tag, options);
        if (tag === 'dialog') {
            element.showModal = () => element.setAttribute('open', '');
            element.close = () => element.removeAttribute('open');
        }
        return element;
    };
}
