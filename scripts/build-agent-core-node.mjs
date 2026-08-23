import { build } from 'esbuild';
import { Buffer } from 'node:buffer';
import { builtinModules } from 'node:module';
import {
    mkdir,
    readFile,
    readdir,
    rename,
    rm,
    writeFile,
} from 'node:fs/promises';
import {
    dirname,
    relative,
    resolve,
    sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entryPoint = resolve(projectRoot, 'modules/agent-core/node-entry.js');
const outputDirectory = resolve(
    projectRoot,
    'server-plugin/littlewhitebox-image-jobs/draw-runs/vendor',
);
const bundlePath = resolve(outputDirectory, 'agent-core-node.cjs');
const licensesPath = resolve(outputDirectory, 'THIRD_PARTY_LICENSES.txt');
const nodeModulesRoot = resolve(projectRoot, 'node_modules');
const packageLockPath = resolve(projectRoot, 'package-lock.json');
const builtins = new Set(builtinModules.flatMap(name => [name, `node:${name}`]));
const checkOnly = process.argv.includes('--check');

const optionalNativeDependencyPlugin = {
    name: 'optional-native-dependency-stubs',
    setup(context) {
        context.onResolve({ filter: /^(bufferutil|utf-8-validate)$/ }, args => ({
            path: args.path,
            namespace: 'optional-native-dependency',
        }));
        context.onLoad({ filter: /.*/, namespace: 'optional-native-dependency' }, args => ({
            contents: `throw new Error(${JSON.stringify(`${args.path} is not bundled`)});`,
            loader: 'js',
        }));
    },
};

function normalizeLicense(value) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value)) {
        const licenses = value.map(normalizeLicense).filter(Boolean);
        return licenses.join(' OR ');
    }
    if (value && typeof value === 'object') return normalizeLicense(value.type);
    return '';
}

function normalizeRepository(value) {
    if (typeof value === 'string') return value;
    if (value && typeof value.url === 'string') return value.url;
    return '';
}

async function findPackageRoot(inputPath) {
    const absoluteInput = resolve(projectRoot, inputPath);
    const nodeModulesPrefix = `${nodeModulesRoot}${sep}`;
    if (!absoluteInput.startsWith(nodeModulesPrefix)) return null;

    let directory = dirname(absoluteInput);
    while (directory.startsWith(nodeModulesPrefix)) {
        try {
            await readFile(resolve(directory, 'package.json'));
            return directory;
        } catch {
            directory = dirname(directory);
        }
    }
    throw new Error(`Cannot locate package.json for bundled input: ${inputPath}`);
}

function readMarkdownHeading(lines, index) {
    const atxMatch = lines[index].match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (atxMatch) {
        return {
            level: atxMatch[1].length,
            title: atxMatch[2].trim(),
            bodyStart: index + 1,
        };
    }

    const setextMatch = lines[index + 1]?.match(/^\s{0,3}(=+|-+)\s*$/);
    if (lines[index].trim() && setextMatch) {
        return {
            level: setextMatch[1][0] === '=' ? 1 : 2,
            title: lines[index].trim(),
            bodyStart: index + 2,
        };
    }
    return null;
}

function extractReadmeLicenseText(readme) {
    const lines = readme.replace(/\r\n?/g, '\n').split('\n');
    for (let index = 0; index < lines.length; index += 1) {
        const heading = readMarkdownHeading(lines, index);
        if (!heading || !/^licen[cs]e(?:s)?$/i.test(heading.title)) continue;

        let sectionEnd = lines.length;
        for (let cursor = heading.bodyStart; cursor < lines.length; cursor += 1) {
            const nextHeading = readMarkdownHeading(lines, cursor);
            if (nextHeading && nextHeading.level <= heading.level) {
                sectionEnd = cursor;
                break;
            }
        }
        return lines.slice(heading.bodyStart, sectionEnd).join('\n').trim();
    }
    return '';
}

async function readLicenseFiles(packageRoot) {
    const entries = await readdir(packageRoot, { withFileTypes: true });
    const names = entries
        .filter(entry => entry.isFile() && /^(?:licen[cs]e|notice|copying)(?:[.-].*)?$/i.test(entry.name))
        .map(entry => entry.name)
        .sort((left, right) => left.localeCompare(right, 'en'));
    const licenseFiles = (await Promise.all(names.map(async name => ({
        name,
        text: (await readFile(resolve(packageRoot, name), 'utf8')).trim(),
    })))).filter(file => file.text);
    if (licenseFiles.length) return licenseFiles;

    const readmeNames = entries
        .filter(entry => entry.isFile() && /^readme(?:\..+)?$/i.test(entry.name))
        .map(entry => entry.name)
        .sort((left, right) => left.localeCompare(right, 'en'));
    for (const name of readmeNames) {
        const text = extractReadmeLicenseText(await readFile(resolve(packageRoot, name), 'utf8'));
        if (text) return [{ name: `${name}#License`, text }];
    }

    throw new Error(`Bundled package does not include license text: ${relative(projectRoot, packageRoot)}`);
}

async function collectBundledPackages(metafile) {
    const packageLock = JSON.parse(await readFile(packageLockPath, 'utf8'));
    const lockedPackages = packageLock.packages;
    if (!lockedPackages || typeof lockedPackages !== 'object') {
        throw new Error('package-lock.json does not contain a packages map');
    }
    const roots = new Set();
    for (const inputPath of Object.keys(metafile.inputs)) {
        const packageRoot = await findPackageRoot(inputPath);
        if (packageRoot) roots.add(packageRoot);
    }

    const packages = [];
    for (const packageRoot of roots) {
        const packageJson = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
        const license = normalizeLicense(packageJson.license || packageJson.licenses);
        const licenseFiles = await readLicenseFiles(packageRoot);
        const lockKey = relative(projectRoot, packageRoot).split(sep).join('/');
        const lockedPackage = lockedPackages[lockKey];
        if (!packageJson.name || !packageJson.version || !license) {
            throw new Error(`Bundled package has incomplete license metadata: ${relative(projectRoot, packageRoot)}`);
        }
        if (!lockedPackage || lockedPackage.version !== packageJson.version) {
            throw new Error(`Bundled package does not match package-lock.json: ${lockKey}`);
        }
        packages.push({
            name: packageJson.name,
            version: packageJson.version,
            license,
            repository: normalizeRepository(packageJson.repository),
            licenseFiles,
        });
    }

    return packages.sort((left, right) => (
        left.name.localeCompare(right.name, 'en')
        || left.version.localeCompare(right.version, 'en')
    ));
}

function buildLicensesDocument(packages) {
    const divider = '='.repeat(80);
    const sections = packages.map((item) => [
        divider,
        `${item.name}@${item.version}`,
        `License: ${item.license}`,
        ...(item.repository ? [`Repository: ${item.repository}`] : []),
        ...item.licenseFiles.flatMap(file => [
            `License file: ${file.name}`,
            '',
            file.text,
        ]),
    ].join('\n'));
    return [
        'LittleWhiteBox Draw Run Agent Core - Third-Party Licenses',
        '',
        'Generated by npm run build:agent-core:node. Do not edit manually.',
        `Bundled packages: ${packages.length}`,
        '',
        ...sections,
        '',
    ].join('\n');
}

async function assertCurrentArtifact(filePath, expected) {
    let current;
    try {
        current = await readFile(filePath);
    } catch {
        throw new Error(`Generated artifact is missing: ${relative(projectRoot, filePath)}`);
    }
    const expectedBuffer = Buffer.isBuffer(expected) ? expected : Buffer.from(expected);
    if (!current.equals(expectedBuffer)) {
        throw new Error(`Generated artifact is stale: ${relative(projectRoot, filePath)}`);
    }
}

async function publishArtifactDirectory(bundle, licensesDocument) {
    const stagingDirectory = `${outputDirectory}.${process.pid}.tmp`;
    const backupDirectory = `${outputDirectory}.${process.pid}.old`;
    let previousMoved = false;
    let published = false;
    try {
        await rm(stagingDirectory, { recursive: true, force: true });
        await rm(backupDirectory, { recursive: true, force: true });
        await mkdir(stagingDirectory);
        await Promise.all([
            writeFile(resolve(stagingDirectory, 'agent-core-node.cjs'), bundle.contents),
            writeFile(resolve(stagingDirectory, 'THIRD_PARTY_LICENSES.txt'), licensesDocument, 'utf8'),
        ]);

        try {
            await rename(outputDirectory, backupDirectory);
            previousMoved = true;
        } catch (error) {
            if (error?.code !== 'ENOENT') throw error;
        }

        try {
            await rename(stagingDirectory, outputDirectory);
            published = true;
        } catch (publishError) {
            if (!previousMoved) throw publishError;
            try {
                await rename(backupDirectory, outputDirectory);
                previousMoved = false;
            } catch (rollbackError) {
                const error = new Error('Failed to publish Agent Core Node artifacts and restore the previous bundle', {
                    cause: publishError,
                });
                error.rollbackError = rollbackError;
                throw error;
            }
            throw publishError;
        }
    } finally {
        await rm(stagingDirectory, { recursive: true, force: true });
        if (published && previousMoved) {
            await rm(backupDirectory, { recursive: true, force: true });
        }
    }
}

const result = await build({
    absWorkingDir: projectRoot,
    entryPoints: [entryPoint],
    outfile: bundlePath,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    packages: 'bundle',
    plugins: [optionalNativeDependencyPlugin],
    legalComments: 'eof',
    metafile: true,
    minify: true,
    sourcemap: false,
    banner: {
        js: '/*! Generated by npm run build:agent-core:node. Do not edit manually. */',
    },
    write: false,
});

const externalImports = [...new Set(
    Object.values(result.metafile.outputs)
        .flatMap(output => output.imports)
        .filter(item => item.external && !builtins.has(item.path))
        .map(item => item.path),
)].sort();
if (externalImports.length) {
    throw new Error(`Node bundle has runtime package dependencies: ${externalImports.join(', ')}`);
}

const packages = await collectBundledPackages(result.metafile);
const bundle = result.outputFiles.find(file => resolve(file.path) === bundlePath);
if (!bundle) throw new Error('esbuild did not produce the expected Node bundle');
const licensesDocument = buildLicensesDocument(packages);

if (checkOnly) {
    await Promise.all([
        assertCurrentArtifact(bundlePath, bundle.contents),
        assertCurrentArtifact(licensesPath, licensesDocument),
    ]);
    console.log('Agent Core Node bundle and third-party licenses are current');
} else {
    await mkdir(dirname(outputDirectory), { recursive: true });
    await publishArtifactDirectory(bundle, licensesDocument);

    console.log(`Agent Core Node bundle written to ${relative(projectRoot, bundlePath)}`);
    console.log(`Third-party licenses written to ${relative(projectRoot, licensesPath)} (${packages.length} packages)`);
}
