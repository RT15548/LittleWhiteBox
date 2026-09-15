// ═══════════════════════════════════════════════════════════════════════════
// entity-lexicon.js - 实体词典（确定性，无 LLM）
//
// 职责：
// 1. 从已有结构化存储构建可信实体词典
// 2. 从文本中提取命中的实体
//
// 硬约束：name1 永不进入词典
// ═══════════════════════════════════════════════════════════════════════════

import { getStateAtoms } from '../storage/state-store.js';
import {
    buildAliasResolver,
    normalizeUserIdentityKey,
} from '../../data/character-aliases.js';
import { normalizeEntityTerm } from './entity-matcher.js';

export { extractEntitiesFromText, normalizeEntityTerm } from './entity-matcher.js';

// 人名词典黑名单：代词、标签词、明显非人物词
const PERSON_LEXICON_BLACKLIST = new Set([
    '我', '你', '他', '她', '它', '我们', '你们', '他们', '她们', '它们',
    '自己', '对方', '用户', '助手', 'user', 'assistant',
    '男人', '女性', '成熟女性', '主人', '主角',
    '龟头', '子宫', '阴道', '阴茎',
    '电脑', '电脑屏幕', '手机', '监控画面', '摄像头', '阳光', '折叠床', '书房', '卫生间隔间',
]);

function isBlacklistedPersonTerm(raw) {
    return PERSON_LEXICON_BLACKLIST.has(normalizeEntityTerm(raw));
}

function addPersonTerm(set, raw) {
    const n = normalizeEntityTerm(raw);
    if (!n || n.length < 2) return;
    if (isBlacklistedPersonTerm(n)) return;
    set.add(n);
}

function buildUserIdentityKeys(context, aliasResolver = null) {
    return new Set([context?.name1, aliasResolver?.resolveName?.(context?.name1)]
        .map(normalizeUserIdentityKey)
        .filter(Boolean));
}

function removeUserIdentityTerms(set, context, aliasResolver = null) {
    const userKeys = buildUserIdentityKeys(context, aliasResolver);
    if (!userKeys.size) return;
    for (const term of [...set]) {
        if (userKeys.has(normalizeUserIdentityKey(term))) set.delete(term);
    }
}

function collectTrustedCharacters(store, context, aliasResolver = buildAliasResolver(store?.json?.characterAliases || [])) {
    const trusted = new Set();

    const main = store?.json?.characters?.main || [];
    for (const m of main) {
        addPersonTerm(trusted, aliasResolver.resolveName(typeof m === 'string' ? m : m.name));
    }

    const arcs = store?.json?.arcs || [];
    for (const a of arcs) {
        addPersonTerm(trusted, aliasResolver.resolveName(a.name));
    }

    if (context?.name2) {
        addPersonTerm(trusted, aliasResolver.resolveName(context.name2));
    }

    const events = store?.json?.events || [];
    for (const ev of events) {
        for (const p of (ev?.participants || [])) {
            addPersonTerm(trusted, aliasResolver.resolveName(p));
        }
    }

    for (const alias of aliasResolver.aliases) {
        addPersonTerm(trusted, aliasResolver.resolveName(alias.from));
        addPersonTerm(trusted, aliasResolver.resolveName(alias.to));
    }

    removeUserIdentityTerms(trusted, context, aliasResolver);

    return trusted;
}

/**
 * Build trusted character pool only (without scanning L0 candidate atoms).
 * trustedCharacters: main/arcs/name2/L2 participants, excludes name1.
 *
 * @param {object} store
 * @param {object} context
 * @returns {Set<string>}
 */
export function buildTrustedCharacters(store, context) {
    return collectTrustedCharacters(store, context);
}

function collectCandidateCharactersFromL0(context, atoms) {
    const candidate = new Set();
    for (const atom of atoms) {
        for (const e of (atom.edges || [])) {
            addPersonTerm(candidate, e?.s);
            addPersonTerm(candidate, e?.t);
        }
    }
    removeUserIdentityTerms(candidate, context);
    return candidate;
}

/**
 * Build character pools with trust tiers.
 * trustedCharacters: main/arcs/name2/L2 participants (clean source)
 * candidateCharacters: L0 edges.s/t (blacklist-cleaned)
 */
function buildCharacterPools(store, context, atoms, aliasResolver) {
    const trustedCharacters = collectTrustedCharacters(store, context, aliasResolver);
    const candidateCharacters = collectCandidateCharactersFromL0(context, atoms);
    const aliasTerms = new Set();
    for (const alias of aliasResolver.aliases) {
        addPersonTerm(aliasTerms, alias.from);
        addPersonTerm(aliasTerms, alias.to);
    }
    const allCharacters = new Set([...trustedCharacters, ...candidateCharacters, ...aliasTerms]);
    removeUserIdentityTerms(allCharacters, context, aliasResolver);
    return { trustedCharacters, candidateCharacters, allCharacters };
}

// Surface spelling -> canonical display name, in source priority order.
function buildDisplayNameMap(store, context, atoms, aliasResolver) {
    const map = new Map();

    const register = (raw, display = raw, force = false) => {
        const n = normalizeEntityTerm(raw);
        if (!n || n.length < 2) return;
        if (isBlacklistedPersonTerm(n)) return;
        if (force || !map.has(n)) {
            map.set(n, String(display || raw).trim());
        }
    };

    const main = store?.json?.characters?.main || [];
    for (const m of main) {
        const raw = typeof m === 'string' ? m : m.name;
        register(raw, aliasResolver.resolveName(raw));
    }

    const arcs = store?.json?.arcs || [];
    for (const a of arcs) {
        register(a.name, aliasResolver.resolveName(a.name));
    }

    if (context?.name2) register(context.name2, aliasResolver.resolveName(context.name2));

    // 4. L2 events 参与者
    const events = store?.json?.events || [];
    for (const ev of events) {
        for (const p of (ev?.participants || [])) {
            register(p, aliasResolver.resolveName(p));
        }
    }

    for (const alias of aliasResolver.aliases) {
        const canonical = aliasResolver.resolveName(alias.from);
        register(alias.from, canonical, true);
        register(alias.to, aliasResolver.resolveName(alias.to), true);
    }

    // 5. L0 atoms 的 edges.s/edges.t
    for (const atom of atoms) {
        for (const e of (atom.edges || [])) {
            register(e?.s, aliasResolver.resolveName(e?.s));
            register(e?.t, aliasResolver.resolveName(e?.t));
        }
    }

    // ★ 硬约束：删除 name1
    const userKeys = buildUserIdentityKeys(context, aliasResolver);
    for (const key of [...map.keys()]) {
        if (userKeys.has(normalizeUserIdentityKey(key))) map.delete(key);
    }

    return map;
}

const SOURCE_BOUNDARY = Symbol('vocabulary source boundary');
let cachedVocabulary = null;

// These sources are mutable (including nested participants/edges). Compare their
// actual name values, not object identity or updatedAt. Warm reads only compare;
// they do not normalize, resolve aliases or rebuild Sets/Maps. Retain name values
// for one vocabulary, never source documents or a cache for every visited chat.
function* vocabularyInputs(store, context, atoms) {
    yield context?.name1;
    yield context?.name2;
    for (const item of store?.json?.characters?.main || []) yield typeof item === 'string' ? item : item.name;
    yield SOURCE_BOUNDARY;
    for (const arc of store?.json?.arcs || []) yield arc.name;
    yield SOURCE_BOUNDARY;
    for (const event of store?.json?.events || []) yield* event?.participants || [];
    yield SOURCE_BOUNDARY;
    for (const alias of store?.json?.characterAliases || []) {
        yield alias?.from;
        yield alias?.to;
    }
    yield SOURCE_BOUNDARY;
    for (const atom of atoms) {
        for (const edge of atom.edges || []) {
            yield edge?.s;
            yield edge?.t;
        }
    }
}

export function getEntityVocabulary(store, context) {
    const atoms = getStateAtoms();
    let inputs = cachedVocabulary?.inputs || [];
    let changed = !cachedVocabulary;
    let position = 0;
    for (const value of vocabularyInputs(store, context, atoms)) {
        if (!changed && (position >= inputs.length || inputs[position] !== value)) {
            inputs = inputs.slice(0, position);
            changed = true;
        }
        if (changed) inputs.push(value);
        position++;
    }
    if (!changed && position === inputs.length) return cachedVocabulary.value;
    if (!changed) inputs = inputs.slice(0, position);

    const aliasResolver = buildAliasResolver(store?.json?.characterAliases || []);
    const pools = buildCharacterPools(store, context, atoms, aliasResolver);
    const value = {
        ...pools,
        lexicon: pools.allCharacters,
        displayMap: buildDisplayNameMap(store, context, atoms, aliasResolver),
        blockedTerms: context?.name1 ? [context.name1, String(context.name1).replace(/\s+/gu, '')] : [],
    };
    cachedVocabulary = { inputs, value };
    return value;
}
