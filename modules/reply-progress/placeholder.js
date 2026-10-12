import { formatReplyProgress, replyProgressLabel } from './copy.js';

// Own only placeholder while a visible main reply is waiting for its first text.
export function createPlaceholderPresenter(textarea, { watch = observePlaceholder } = {}) {
    let baseline = textarea.getAttribute('placeholder');
    let lastWritten = null;
    const unwatch = watch(textarea, () => {
        const current = textarea.getAttribute('placeholder');
        if (current !== lastWritten) baseline = current;
    });

    return {
        show(progress) {
            const value = formatReplyProgress(replyProgressLabel(progress), progress.elapsedMs);
            if (textarea.getAttribute('placeholder') !== lastWritten) {
                baseline = textarea.getAttribute('placeholder');
            }
            if (lastWritten !== value) {
                lastWritten = value;
                textarea.setAttribute('placeholder', value);
            }
        },
        restore() {
            unwatch();
            // A host or another extension may have taken over in the meantime.
            if (textarea.getAttribute('placeholder') === lastWritten) {
                if (baseline === null) textarea.removeAttribute('placeholder');
                else textarea.setAttribute('placeholder', baseline);
            }
        },
    };
}

function observePlaceholder(textarea, onChange) {
    const Observer = textarea.ownerDocument.defaultView.MutationObserver;
    const observer = new Observer(onChange);
    observer.observe(textarea, { attributes: true, attributeFilter: ['placeholder'] });
    return () => observer.disconnect();
}
