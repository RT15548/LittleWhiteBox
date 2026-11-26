import { readFileSync } from 'node:fs';

// Published tarballs omit the license text. Keep the upstream release's exact
// text for all runtimes; remove an entry when the package ships its license.
const supplements = [{
    name: 'standardwebhooks', version: '1.1.1',
    source: 'https://github.com/standard-webhooks/standard-webhooks/blob/b4d2c14fc5b4ccff3ff271e3b087dff812254c59/libraries/LICENSE',
    file: new URL('./licenses/standardwebhooks-1.1.1.txt', import.meta.url),
}, {
    name: 'jsondiffpatch', version: '0.7.7',
    source: 'https://github.com/benjamine/jsondiffpatch/blob/ce76b39942891bbbeb60bf6a2ab3b7cbdb758923/MIT-LICENSE.txt',
    file: new URL('./licenses/jsondiffpatch-0.7.7.txt', import.meta.url),
}, {
    name: 'omggif', version: '1.0.10',
    source: 'omggif@1.0.10 README',
    file: new URL('./licenses/omggif-1.0.10.txt', import.meta.url),
}];

export function packageLicenseSupplement(metadata) {
    const supplement = supplements.find(item => metadata.name === item.name && metadata.version === item.version);
    if (!supplement) return undefined;
    return [{ name: supplement.source, text: readFileSync(supplement.file, 'utf8').trim() }];
}

export function createLicenseSupplementPlugin() {
    return {
        name: 'upstream-license-supplement',
        generateBundle(_, bundle) {
            const documents = [];
            for (const supplement of supplements) {
                const used = Object.values(bundle).some(item => item.type === 'chunk'
                    && Object.keys(item.modules).some(id => id.replaceAll('\\', '/').includes(`/node_modules/${supplement.name}/`)));
                if (!used) continue;
                const metadata = JSON.parse(readFileSync(new URL(`../../node_modules/${supplement.name}/package.json`, import.meta.url), 'utf8'));
                const files = packageLicenseSupplement(metadata);
                if (!files) continue;
                documents.push(`${metadata.name}@${metadata.version}\n${files[0].name}\n\n${files[0].text}\n`);
            }
            if (!documents.length) return;
            this.emitFile({ type: 'asset', fileName: 'THIRD-PARTY-LICENSE-SUPPLEMENTS.txt',
                source: documents.join('\n') });
        },
    };
}
