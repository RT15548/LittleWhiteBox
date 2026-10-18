/** Resolve generated resources without owning application state. */
const moduleUrl = new URL(import.meta.url);
const base = moduleUrl.pathname.match(/^(.*\/scripts\/extensions\/third-party\/[^/]+\/)/)?.[1];
if (!base) throw new Error('Plugin asset base is unavailable');
let manifestPromise;
const LOAD_FAILURE_MESSAGE = '加载失败，请刷新重试';

export function reportBuildFailure(error) {
    let feedback = document.querySelector('#xb-frame-boot .xb-frame-boot-text');
    if (!feedback) {
        feedback = document.querySelector('[data-build-failure]');
        if (!feedback) {
            feedback = document.createElement('p');
            feedback.dataset.buildFailure = '';
            feedback.setAttribute('role', 'alert');
            document.body.prepend(feedback);
        }
    }
    feedback.textContent = LOAD_FAILURE_MESSAGE;
    console.error(error);
}

export function pluginAsset(path) {
    return new URL(path, new URL(base, moduleUrl)).href;
}

export function readBuildManifest() {
    manifestPromise ||= fetch(pluginAsset('dist/manifest.json'), { cache: 'no-cache' })
        .then(async response => {
            if (!response.ok) throw new Error(`Build manifest: ${response.status}`);
            const manifest = await response.json();
            const currentChunk = moduleUrl.pathname.slice(base.length + 'dist/'.length);
            if (moduleUrl.pathname.startsWith(`${base}dist/`) && !manifest.resources[currentChunk]) {
                throw new Error('Plugin build changed; reload the page');
            }
            return manifest;
        }).catch(error => { manifestPromise = null; throw error; });
    return manifestPromise;
}

export async function buildEntry(id) {
    const manifest = await readBuildManifest();
    const entry = manifest.entries[id];
    if (!entry) throw new Error(`Unknown build entry: ${id}`);
    return { ...entry, file: pluginAsset(`dist/${entry.file}`), css: entry.css.map(file => pluginAsset(`dist/${file}`)) };
}

export async function buildEntryUrl(id) {
    return (await buildEntry(id)).file;
}

export async function loadBuildStyles(id, target = document.head) {
    const entry = await buildEntry(id);
    await Promise.all(entry.css.map(href => new Promise((resolve, reject) => {
        let link = [...target.querySelectorAll('link[rel="stylesheet"]')].find(node => node.href === href);
        if (link?.sheet) { resolve(); return; }
        const created = !link;
        if (created) {
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.addEventListener('error', () => link.remove(), { once: true });
        }
        link.addEventListener('load', () => resolve(), { once: true });
        link.addEventListener('error', () => reject(new Error(`Stylesheet: ${href}`)), { once: true });
        if (created) target.appendChild(link);
    })));
    return entry;
}

export async function loadBuildEntry(id) {
    const entry = await loadBuildStyles(id);
    // eslint-disable-next-line no-unsanitized/method -- Only paths from this plugin's generated entry manifest are imported.
    return import(/* @vite-ignore */ entry.file);
}
