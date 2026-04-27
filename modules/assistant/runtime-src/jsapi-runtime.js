import { parse } from 'acorn';

const ALLOWED_IDENTIFIER_GLOBALS = new Set(['ctx', 'st', 'JSON', 'Math', 'Object', 'Array', 'undefined']);
const SAFE_GLOBAL_MEMBER_CALLS = new Set([
    'Object.keys',
    'Object.values',
    'Object.entries',
    'Array.from',
    'Array.isArray',
    'JSON.stringify',
]);
const ALLOWED_UNARY_OPERATORS = new Set(['!', '+', '-', 'typeof']);
const ALLOWED_BINARY_OPERATORS = new Set([
    '==', '===', '!=', '!==', '>', '>=', '<', '<=',
    '+', '-', '*', '/', '%',
]);
const ALLOWED_LOGICAL_OPERATORS = new Set(['&&', '||', '??']);
const DANGEROUS_IDENTIFIERS = new Set([
    'window',
    'document',
    'globalThis',
    'global',
    'self',
    'fetch',
    'XMLHttpRequest',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'Function',
    'eval',
]);
const DANGEROUS_PROPERTIES = new Set([
    'constructor',
    'prototype',
    '__proto__',
    'caller',
    'callee',
    'arguments',
    '__defineGetter__',
    '__defineSetter__',
]);
const JSAPI_REQUEST_KINDS = Object.freeze({
    INSPECT: 'inspect',
    READ: 'read',
    EFFECT: 'effect',
    UNKNOWN: 'unknown',
});
const EFFECT_API_SEMANTICS = new Set(['write', 'ui', 'network', 'exec']);
const INSPECT_GLOBAL_MEMBER_CALLS = new Set([
    'Object.keys',
    'Object.values',
    'Object.entries',
    'Array.from',
    'Array.isArray',
    'JSON.stringify',
]);
const SAFE_READONLY_METHODS = new Set([
    'at',
    'concat',
    'entries',
    'every',
    'filter',
    'find',
    'findIndex',
    'findLast',
    'findLastIndex',
    'flat',
    'flatMap',
    'forEach',
    'includes',
    'indexOf',
    'join',
    'keys',
    'lastIndexOf',
    'map',
    'reduce',
    'reduceRight',
    'slice',
    'some',
    'values',
]);
const INSPECT_READONLY_METHODS = new Set([
    'entries',
    'every',
    'filter',
    'find',
    'findIndex',
    'findLast',
    'findLastIndex',
    'flat',
    'flatMap',
    'forEach',
    'keys',
    'map',
    'reduce',
    'reduceRight',
    'slice',
    'some',
    'values',
]);
const MAX_OUTPUT_DEPTH = 3;
const MAX_OUTPUT_ARRAY_ITEMS = 40;
const MAX_OUTPUT_OBJECT_KEYS = 40;
const MAX_OUTPUT_STRING_LENGTH = 4_000;
const EXPERIMENTAL_FULL_JSAPI = true;

function buildExecutionState(overrides = {}) {
    return {
        isError: false,
        errorCode: '',
        errorMessage: '',
        isAborted: false,
        abortReason: '',
        unavailableApis: [],
        validationErrors: [],
        ...overrides,
    };
}

function normalizeDeclaredApiPaths(paths = []) {
    return Array.from(new Set(
        (Array.isArray(paths) ? paths : [])
            .map((item) => String(item || '').trim().replace(/\([^)]*\)$/g, ''))
            .filter(Boolean),
    )).sort((a, b) => a.localeCompare(b, 'en'));
}

function buildResult({
    code = '',
    ok = false,
    output = '',
    execution = buildExecutionState(),
    note = '',
    requestKind = JSAPI_REQUEST_KINDS.UNKNOWN,
    usedApis = [],
    calledApis = [],
    calledApiSemantics = {},
    skipped = false,
} = {}) {
    return {
        code: String(code || ''),
        ok: ok === true,
        output,
        execution: buildExecutionState(execution),
        note: String(note || ''),
        requestKind: normalizeJsApiRequestKind(requestKind),
        usedApis: Array.isArray(usedApis) ? usedApis.map((item) => String(item || '')).filter(Boolean) : [],
        calledApis: Array.isArray(calledApis) ? calledApis.map((item) => String(item || '')).filter(Boolean) : [],
        calledApiSemantics: calledApiSemantics && typeof calledApiSemantics === 'object'
            ? Object.fromEntries(
                Object.entries(calledApiSemantics)
                    .map(([key, value]) => [String(key || '').trim(), String(value || '').trim()])
                    .filter(([key, value]) => key && value),
            )
            : {},
        ...(skipped ? { skipped: true } : {}),
    };
}

function getAllAllowedPaths(manifest = {}) {
    const allowedPaths = Array.isArray(manifest.allowedPaths) ? manifest.allowedPaths : [];
    return new Set(allowedPaths.map((item) => String(item || '').trim()).filter(Boolean));
}

function getCallablePaths(manifest = {}) {
    const callablePaths = Array.isArray(manifest.callablePaths) ? manifest.callablePaths : [];
    return new Set(callablePaths.map((item) => String(item || '').trim()).filter(Boolean));
}

function normalizeJsApiRequestKind(value) {
    return Object.values(JSAPI_REQUEST_KINDS).includes(value)
        ? value
        : JSAPI_REQUEST_KINDS.UNKNOWN;
}

function getApiSemantic(pathText, manifest = {}) {
    const semantics = manifest && typeof manifest.apiSemantics === 'object' && manifest.apiSemantics
        ? manifest.apiSemantics
        : {};
    const semantic = String(semantics[String(pathText || '').trim()] || '').trim();
    return semantic || '';
}

function createValidationContext(manifest, declaredApiPaths) {
    return {
        manifestPaths: getAllAllowedPaths(manifest),
        callablePaths: getCallablePaths(manifest),
        scopes: [new Map()],
        usedApis: new Set(),
        calledApis: new Set(),
        validationErrors: [],
        hasExplicitReturn: false,
        hasWriteSyntax: false,
        hasInspectSyntax: false,
        declaredApiPaths,
    };
}

function currentScope(state) {
    return state.scopes[state.scopes.length - 1];
}

function pushScope(state) {
    state.scopes.push(new Map());
}

function popScope(state) {
    state.scopes.pop();
}

function declareIdentifier(name, state, node, meta = {}) {
    if (!name || ALLOWED_IDENTIFIER_GLOBALS.has(name) || DANGEROUS_IDENTIFIERS.has(name)) {
        state.validationErrors.push(`不允许声明标识符：${name || '(empty)'}`);
        return;
    }
    if (currentScope(state).has(name)) {
        state.validationErrors.push(`当前作用域重复声明：${name}`);
        return;
    }
    currentScope(state).set(name, {
        originPath: String(meta.originPath || '').trim(),
    });
}

function getDeclaredIdentifierMeta(name, state) {
    for (let index = state.scopes.length - 1; index >= 0; index -= 1) {
        if (state.scopes[index].has(name)) {
            return state.scopes[index].get(name) || {};
        }
    }
    return null;
}

function validateReferenceIdentifier(name, state) {
    if (!name) return;
    if (DANGEROUS_IDENTIFIERS.has(name)) {
        state.validationErrors.push(`禁止访问全局对象：${name}`);
        return;
    }
    if (ALLOWED_IDENTIFIER_GLOBALS.has(name) || getDeclaredIdentifierMeta(name, state)) {
        return;
    }
    state.validationErrors.push(`未声明或未授权的标识符：${name}`);
}

function resolvePublicApiPathFromNode(node, state) {
    const current = unwrapChain(node);
    if (!current) return '';

    if (current.type === 'Identifier') {
        if (ALLOWED_IDENTIFIER_GLOBALS.has(current.name)) {
            return current.name === 'ctx' || current.name === 'st' ? current.name : '';
        }
        return String(getDeclaredIdentifierMeta(current.name, state)?.originPath || '').trim();
    }

    if (current.type === 'CallExpression') {
        return resolveCallResultOriginPath(current, state);
    }

    if (current.type !== 'MemberExpression') {
        return '';
    }

    const propertySegment = current.computed
        ? getStaticPropertySegment(current.property)
        : current.property?.type === 'Identifier'
            ? current.property.name
            : null;
    if (!propertySegment) return '';

    const basePath = resolvePublicApiPathFromNode(current.object, state);
    if (!basePath) {
        const directSegments = extractStaticMemberSegments(current);
        if (!Array.isArray(directSegments) || !directSegments.length) return '';
        const root = directSegments[0];
        return root === 'ctx' || root === 'st' ? directSegments.join('.') : '';
    }

    return `${basePath}.${propertySegment}`;
}

function resolveCallResultOriginPath(node, state) {
    const calleePath = resolvePublicApiPathFromNode(node?.callee, state);
    if (!calleePath) return '';
    if (calleePath === 'st.extensions.getContext') {
        return 'ctx';
    }
    return state.callablePaths.has(calleePath) ? calleePath : '';
}

function registerApiUsage(pathText, state, parent = null) {
    const fullPath = String(pathText || '').trim();
    const exactApiPath = state.manifestPaths.has(fullPath) ? fullPath : '';
    const matchedApiPath = exactApiPath || findLongestAllowedApiPath(fullPath.split('.'), state.manifestPaths);
    const isCallCallee = parent?.type === 'CallExpression';
    const methodName = fullPath.includes('.') ? fullPath.split('.').at(-1) : '';

    if (!matchedApiPath) {
        state.validationErrors.push(`未授权的 JS API 路径：${fullPath}`);
        return false;
    }

    state.usedApis.add(matchedApiPath);
    if (isCallCallee && !exactApiPath) {
        if (!SAFE_READONLY_METHODS.has(methodName)) {
            state.validationErrors.push(`未授权的 JS API 调用：${fullPath}`);
            return false;
        }
        return true;
    }
    if (isCallCallee && exactApiPath && !state.callablePaths.has(exactApiPath)) {
        state.validationErrors.push(`该公开路径不可直接调用：${fullPath}`);
        return false;
    }
    if (isCallCallee && exactApiPath) {
        state.calledApis.add(exactApiPath);
    }
    return true;
}

function isStaticPropertySegment(node) {
    if (!node) return false;
    if (node.type === 'Identifier') return true;
    if (node.type === 'Literal') return ['string', 'number'].includes(typeof node.value);
    if (node.type === 'TemplateLiteral') return node.expressions.length === 0;
    return false;
}

function getStaticPropertySegment(node) {
    if (!isStaticPropertySegment(node)) return null;
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'Literal') return String(node.value);
    if (node.type === 'TemplateLiteral') return node.quasis.map((item) => item.value.cooked || item.value.raw || '').join('');
    return null;
}

function unwrapChain(node) {
    return node?.type === 'ChainExpression' ? node.expression : node;
}

function extractStaticMemberSegments(node) {
    const segments = [];
    let current = unwrapChain(node);

    while (current?.type === 'MemberExpression') {
        const propertySegment = current.computed
            ? getStaticPropertySegment(current.property)
            : current.property?.type === 'Identifier'
                ? current.property.name
                : null;
        if (propertySegment) {
            segments.unshift(propertySegment);
        } else {
            current = unwrapChain(current.object);
            break;
        }
        current = unwrapChain(current.object);
    }

    if (current?.type !== 'Identifier') {
        return null;
    }

    return [current.name, ...segments];
}

function findLongestAllowedApiPath(segments, manifestPaths) {
    if (!Array.isArray(segments) || !segments.length) return '';
    for (let index = segments.length; index > 1; index -= 1) {
        const candidate = segments.slice(0, index).join('.');
        if (manifestPaths.has(candidate)) {
            return candidate;
        }
    }
    return '';
}

function validateMemberExpression(node, state, parent = null) {
    const propertyName = node.computed ? getStaticPropertySegment(node.property) : node.property?.name;
    if (propertyName && DANGEROUS_PROPERTIES.has(propertyName)) {
        state.validationErrors.push(`禁止访问危险属性：${propertyName}`);
        return;
    }

    const segments = extractStaticMemberSegments(node);
    const root = Array.isArray(segments) && segments.length ? segments[0] : '';
    const resolvedPath = resolvePublicApiPathFromNode(node, state);
    const isRootedPublicApi = root === 'ctx' || root === 'st' || resolvedPath.startsWith('ctx.') || resolvedPath.startsWith('st.');
    const isCallCallee = parent?.type === 'CallExpression' && parent.callee === node;

    if (isRootedPublicApi) {
        if (node.computed && !isStaticPropertySegment(node.property)) {
            state.validationErrors.push(`禁止对公开 API 使用动态属性访问：${root}`);
            validateExpression(node.object, state, node);
            validateExpression(node.property, state, node);
            return;
        }
        registerApiUsage(resolvedPath || segments.join('.'), state, isCallCallee ? parent : null);
        return;
    }

    validateExpression(node.object, state, node);
    if (node.computed) {
        validateExpression(node.property, state, node);
    }
}

function validateObjectProperty(node, state) {
    if (!node || node.type !== 'Property') {
        state.validationErrors.push('对象字面量里只允许普通属性。');
        return;
    }
    if (node.kind !== 'init' || node.method || node.shorthand) {
        state.validationErrors.push('对象字面量不允许方法、getter/setter 或 shorthand。');
        return;
    }
    if (node.computed) {
        validateExpression(node.key, state);
    }
    validateExpression(node.value, state);
}

function validateAssignmentTarget(node, state) {
    const target = unwrapChain(node);
    if (!target) {
        state.validationErrors.push('无效的赋值目标。');
        return;
    }
    if (target.type === 'Identifier') {
        validateReferenceIdentifier(target.name, state);
        return;
    }
    if (target.type === 'MemberExpression') {
        validateMemberExpression(target, state);
        return;
    }
    state.validationErrors.push(`不支持的赋值目标：${target.type}`);
}

function validateTemplateLiteral(node, state) {
    node.expressions.forEach((expression) => validateExpression(expression, state, node));
}

function validateFunctionParams(params = [], state) {
    params.forEach((param) => {
        if (param?.type !== 'Identifier') {
            state.validationErrors.push('函数参数只支持简单标识符，不支持默认值、解构或 rest。');
            return;
        }
        declareIdentifier(param.name, state, param);
    });
}

function validateArrowFunctionExpression(node, state) {
    pushScope(state);
    validateFunctionParams(node.params, state);
    if (node.body?.type === 'BlockStatement') {
        node.body.body.forEach((statement) => validateStatement(statement, state));
    } else {
        validateExpression(node.body, state, node);
    }
    popScope(state);
}

function validateCallExpression(node, state) {
    const callee = unwrapChain(node.callee);
    if (callee?.type === 'Identifier') {
        validateReferenceIdentifier(callee.name, state);
        const originPath = String(getDeclaredIdentifierMeta(callee.name, state)?.originPath || '').trim();
        if (!originPath) {
            state.validationErrors.push(`不允许调用未授权的本地可调用值：${callee.name}`);
        } else {
            registerApiUsage(originPath, state, node);
        }
    } else {
        const calleePath = extractStaticMemberSegments(callee)?.join('.') || '';
        if (SAFE_GLOBAL_MEMBER_CALLS.has(calleePath)) {
            if (INSPECT_GLOBAL_MEMBER_CALLS.has(calleePath)) {
                state.hasInspectSyntax = true;
            }
            node.arguments.forEach((argument) => validateExpression(argument, state, node));
            return;
        }
        validateExpression(node.callee, state, node);
        const methodName = calleePath ? calleePath.split('.').at(-1) : '';
        if (INSPECT_READONLY_METHODS.has(methodName)) {
            state.hasInspectSyntax = true;
        }
    }
    node.arguments.forEach((argument) => validateExpression(argument, state, node));
}

function validateForOfLeft(node, state) {
    if (!node) {
        state.validationErrors.push('for...of 缺少左值。');
        return;
    }
    if (node.type === 'VariableDeclaration') {
        if (node.declarations.length !== 1) {
            state.validationErrors.push('for...of 左值只支持单个变量声明。');
            return;
        }
        if (!['const', 'let'].includes(node.kind)) {
            state.validationErrors.push(`for...of 只允许 const / let，当前为：${node.kind}`);
            return;
        }
        const declaration = node.declarations[0];
        if (declaration.init) {
            state.validationErrors.push('for...of 左值变量声明不能带初始值。');
            return;
        }
        if (declaration.id?.type !== 'Identifier') {
            state.validationErrors.push('for...of 左值只支持简单标识符。');
            return;
        }
        declareIdentifier(declaration.id.name, state, declaration.id);
        return;
    }
    if (node.type === 'Identifier') {
        validateReferenceIdentifier(node.name, state);
        return;
    }
    state.validationErrors.push(`for...of 左值不受支持：${node.type}`);
}

function validateExpression(node, state, parent = null) {
    const current = unwrapChain(node);
    if (!current) return;

    switch (current.type) {
        case 'Literal':
            return;
        case 'Identifier':
            validateReferenceIdentifier(current.name, state);
            {
                const originPath = String(getDeclaredIdentifierMeta(current.name, state)?.originPath || '').trim();
                if (originPath) {
                    const isCallCallee = parent?.type === 'CallExpression' && parent.callee === current;
                    registerApiUsage(originPath, state, isCallCallee ? parent : null);
                }
            }
            return;
        case 'TemplateLiteral':
            validateTemplateLiteral(current, state);
            return;
        case 'ArrowFunctionExpression':
            validateArrowFunctionExpression(current, state);
            return;
        case 'ArrayExpression':
            current.elements.forEach((element) => {
                if (element) validateExpression(element, state, current);
            });
            return;
        case 'ObjectExpression':
            current.properties.forEach((property) => validateObjectProperty(property, state));
            return;
        case 'MemberExpression':
            validateMemberExpression(current, state, parent);
            return;
        case 'CallExpression':
            validateCallExpression(current, state);
            return;
        case 'AwaitExpression':
            validateExpression(current.argument, state, current);
            return;
        case 'UnaryExpression':
            if (!ALLOWED_UNARY_OPERATORS.has(current.operator)) {
                state.validationErrors.push(`不支持的单目运算符：${current.operator}`);
                return;
            }
            if (current.operator === 'typeof') {
                state.hasInspectSyntax = true;
            }
            validateExpression(current.argument, state, current);
            return;
        case 'BinaryExpression':
            if (!ALLOWED_BINARY_OPERATORS.has(current.operator)) {
                state.validationErrors.push(`不支持的二元运算符：${current.operator}`);
                return;
            }
            validateExpression(current.left, state, current);
            validateExpression(current.right, state, current);
            return;
        case 'LogicalExpression':
            if (!ALLOWED_LOGICAL_OPERATORS.has(current.operator)) {
                state.validationErrors.push(`不支持的逻辑运算符：${current.operator}`);
                return;
            }
            validateExpression(current.left, state, current);
            validateExpression(current.right, state, current);
            return;
        case 'ConditionalExpression':
            validateExpression(current.test, state, current);
            validateExpression(current.consequent, state, current);
            validateExpression(current.alternate, state, current);
            return;
        case 'AssignmentExpression':
            if (current.operator !== '=') {
                state.validationErrors.push(`只允许简单赋值，不支持：${current.operator}`);
                return;
            }
            state.hasWriteSyntax = true;
            validateAssignmentTarget(current.left, state);
            validateExpression(current.right, state, current);
            return;
        default:
            state.validationErrors.push(`不支持的表达式语法：${current.type}`);
    }
}

function validateVariableDeclaration(node, state) {
    if (!['const', 'let'].includes(node.kind)) {
        state.validationErrors.push(`只允许 const / let，当前为：${node.kind}`);
        return;
    }

    node.declarations.forEach((declaration) => {
        if (declaration.init) {
            validateExpression(declaration.init, state);
        }
        const originPath = declaration.init ? resolvePublicApiPathFromNode(declaration.init, state) : '';

        if (declaration.id?.type === 'Identifier') {
            declareIdentifier(declaration.id.name, state, declaration.id, { originPath });
            return;
        }

        if (declaration.id?.type === 'ObjectPattern') {
            declaration.id.properties.forEach((property) => {
                if (!property || property.type !== 'Property' || property.kind !== 'init' || property.computed) {
                    state.validationErrors.push('对象解构只支持简单属性，不支持计算属性、rest 或复杂结构。');
                    return;
                }
                const keyName = property.key?.type === 'Identifier'
                    ? property.key.name
                    : property.key?.type === 'Literal'
                        ? String(property.key.value)
                        : '';
                if (!keyName) {
                    state.validationErrors.push('对象解构只支持简单属性键。');
                    return;
                }
                if (property.value?.type !== 'Identifier') {
                    state.validationErrors.push('对象解构只支持把属性绑定到简单标识符。');
                    return;
                }
                declareIdentifier(property.value.name, state, property.value, {
                    originPath: originPath ? `${originPath}.${keyName}` : '',
                });
            });
            return;
        }

        state.validationErrors.push('变量声明只支持简单标识符或简单对象解构。');
    });
}

function validateStatement(node, state) {
    if (!node) return;

    switch (node.type) {
        case 'VariableDeclaration':
            validateVariableDeclaration(node, state);
            return;
        case 'ExpressionStatement':
            validateExpression(node.expression, state);
            return;
        case 'ReturnStatement':
            state.hasExplicitReturn = true;
            if (node.argument) {
                validateExpression(node.argument, state);
            }
            return;
        case 'IfStatement':
            validateExpression(node.test, state);
            validateStatement(node.consequent, state);
            if (node.alternate) {
                validateStatement(node.alternate, state);
            }
            return;
        case 'TryStatement':
            validateStatement(node.block, state);
            if (node.handler) {
                pushScope(state);
                if (node.handler.param?.type === 'Identifier') {
                    declareIdentifier(node.handler.param.name, state, node.handler.param);
                } else if (node.handler.param) {
                    state.validationErrors.push('catch 参数只支持简单标识符。');
                }
                validateStatement(node.handler.body, state);
                popScope(state);
            }
            if (node.finalizer) {
                validateStatement(node.finalizer, state);
            }
            return;
        case 'ForOfStatement':
            state.hasInspectSyntax = true;
            pushScope(state);
            validateForOfLeft(node.left, state);
            validateExpression(node.right, state);
            validateStatement(node.body, state);
            popScope(state);
            return;
        case 'BlockStatement':
            pushScope(state);
            node.body.forEach((statement) => validateStatement(statement, state));
            popScope(state);
            return;
        default:
            state.validationErrors.push(`不支持的语句语法：${node.type}`);
    }
}

function doesDeclaredPathCoverUsedApi(declaredPath, usedPath) {
    const normalizedDeclared = String(declaredPath || '').trim();
    const normalizedUsed = String(usedPath || '').trim();
    if (!normalizedDeclared || !normalizedUsed) return false;
    return normalizedUsed === normalizedDeclared || normalizedUsed.startsWith(`${normalizedDeclared}.`);
}

function validateDeclaredApiPaths(state, requestKind) {
    const used = Array.from(state.usedApis).sort((a, b) => a.localeCompare(b, 'en'));
    const declared = state.declaredApiPaths;

    if (requestKind === JSAPI_REQUEST_KINDS.INSPECT || requestKind === JSAPI_REQUEST_KINDS.READ) {
        if (!declared.length) {
            return;
        }
        const missing = used.filter((item) => !declared.some((declaredPath) => doesDeclaredPathCoverUsedApi(declaredPath, item)));
        if (missing.length) {
            state.validationErrors.push(`apiPaths 缺少覆盖实际使用的公开 API：${missing.join(', ')}`);
        }
        return;
    }

    const missing = used.filter((item) => !declared.includes(item));
    const extra = declared.filter((item) => !used.includes(item));

    if (missing.length || extra.length) {
        if (missing.length) {
            state.validationErrors.push(`apiPaths 缺少实际使用的公开 API：${missing.join(', ')}`);
        }
        if (extra.length) {
            state.validationErrors.push(`apiPaths 包含未实际使用的路径：${extra.join(', ')}`);
        }
    }
}

function determineRequestKind(validation, manifest = {}) {
    if (!validation || !Array.isArray(validation.calledApis) || !Array.isArray(validation.validationErrors)) {
        return JSAPI_REQUEST_KINDS.UNKNOWN;
    }
    if (validation.hasWriteSyntax) {
        return JSAPI_REQUEST_KINDS.EFFECT;
    }

    let hasUnknownSemantic = false;
    for (const apiPath of validation.calledApis) {
        const semantic = getApiSemantic(apiPath, manifest);
        if (!semantic) {
            hasUnknownSemantic = true;
            continue;
        }
        if (EFFECT_API_SEMANTICS.has(semantic)) {
            return JSAPI_REQUEST_KINDS.EFFECT;
        }
    }

    if (hasUnknownSemantic) {
        return JSAPI_REQUEST_KINDS.UNKNOWN;
    }
    if (validation.hasInspectSyntax) {
        return JSAPI_REQUEST_KINDS.INSPECT;
    }
    return JSAPI_REQUEST_KINDS.READ;
}

function buildCalledApiSemantics(calledApis = [], manifest = {}) {
    return Object.fromEntries(
        (Array.isArray(calledApis) ? calledApis : [])
            .map((apiPath) => [apiPath, getApiSemantic(apiPath, manifest)])
            .filter(([, semantic]) => semantic),
    );
}

function createExperimentalAnalysisState(manifest, declaredApiPaths) {
    return {
        manifest,
        callablePaths: getCallablePaths(manifest),
        scopes: [new Map()],
        usedApis: new Set(),
        calledApis: new Set(),
        validationErrors: [],
        hasExplicitReturn: false,
        hasWriteSyntax: false,
        hasInspectSyntax: false,
        declaredApiPaths,
    };
}

function addExperimentalBinding(name, state, originPath = '') {
    if (!name) return;
    currentScope(state).set(name, {
        originPath: String(originPath || '').trim(),
    });
}

function getExperimentalBinding(name, state) {
    for (let index = state.scopes.length - 1; index >= 0; index -= 1) {
        if (state.scopes[index].has(name)) {
            return state.scopes[index].get(name) || {};
        }
    }
    return null;
}

function withExperimentalScope(state, callback) {
    pushScope(state);
    try {
        callback();
    } finally {
        popScope(state);
    }
}

function normalizeExperimentalApiPath(pathText = '') {
    const normalized = String(pathText || '').trim();
    if (!normalized) return '';
    if (normalized === 'getContext') return 'st.extensions.getContext';
    return normalized;
}

function resolveExperimentalOriginPath(node, state) {
    const current = unwrapChain(node);
    if (!current) return '';

    if (current.type === 'Identifier') {
        if (current.name === 'ctx' || current.name === 'st') return current.name;
        if (current.name === 'getContext') return 'st.extensions.getContext';
        return String(getExperimentalBinding(current.name, state)?.originPath || '').trim();
    }

    if (current.type === 'MemberExpression') {
        const propertySegment = current.computed
            ? getStaticPropertySegment(current.property)
            : current.property?.type === 'Identifier'
                ? current.property.name
                : null;
        if (!propertySegment) return '';
        const objectPath = resolveExperimentalOriginPath(current.object, state);
        return objectPath ? `${objectPath}.${propertySegment}` : '';
    }

    if (current.type === 'CallExpression') {
        const calleePath = normalizeExperimentalApiPath(resolveExperimentalOriginPath(current.callee, state));
        if (calleePath === 'st.extensions.getContext') return 'ctx';
        return calleePath;
    }

    return '';
}

function bindExperimentalPattern(pattern, originPath, state) {
    if (!pattern) return;

    if (pattern.type === 'Identifier') {
        addExperimentalBinding(pattern.name, state, originPath);
        return;
    }

    if (pattern.type === 'ObjectPattern') {
        pattern.properties.forEach((property) => {
            if (!property) return;
            if (property.type === 'RestElement') {
                bindExperimentalPattern(property.argument, '', state);
                return;
            }
            const keyName = property.key?.type === 'Identifier'
                ? property.key.name
                : property.key?.type === 'Literal'
                    ? String(property.key.value)
                    : '';
            const nextOrigin = originPath && keyName ? `${originPath}.${keyName}` : '';
            bindExperimentalPattern(property.value, nextOrigin, state);
        });
        return;
    }

    if (pattern.type === 'ArrayPattern') {
        pattern.elements.forEach((element) => bindExperimentalPattern(element, '', state));
        return;
    }

    if (pattern.type === 'AssignmentPattern') {
        bindExperimentalPattern(pattern.left, originPath, state);
        return;
    }

    if (pattern.type === 'RestElement') {
        bindExperimentalPattern(pattern.argument, '', state);
    }
}

function maybeRegisterExperimentalApiUsage(pathText, state, { called = false, inspect = false } = {}) {
    const normalized = normalizeExperimentalApiPath(pathText);
    if (!normalized || (!normalized.startsWith('ctx') && !normalized.startsWith('st'))) {
        return;
    }
    state.usedApis.add(normalized);
    if (called) {
        state.calledApis.add(normalized);
    }
    if (inspect) {
        state.hasInspectSyntax = true;
    }
}

function isExperimentalStateMutationTarget(node, state) {
    const targetPath = normalizeExperimentalApiPath(resolveExperimentalOriginPath(node, state));
    return targetPath.startsWith('ctx') || targetPath.startsWith('st');
}

function extractStaticMemberPath(node) {
    const segments = extractStaticMemberSegments(node);
    return Array.isArray(segments) && segments.length ? segments.join('.') : '';
}

function traverseExperimentalNode(node, state) {
    const current = unwrapChain(node);
    if (!current || typeof current !== 'object') return;

    switch (current.type) {
        case 'Program':
            current.body.forEach((child) => traverseExperimentalNode(child, state));
            return;
        case 'BlockStatement':
            withExperimentalScope(state, () => {
                current.body.forEach((child) => traverseExperimentalNode(child, state));
            });
            return;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
            withExperimentalScope(state, () => {
                if (current.type === 'FunctionDeclaration' && current.id?.type === 'Identifier') {
                    addExperimentalBinding(current.id.name, state, '');
                }
                current.params.forEach((param) => bindExperimentalPattern(param, '', state));
                traverseExperimentalNode(current.body, state);
            });
            return;
        case 'VariableDeclaration':
            current.declarations.forEach((declaration) => traverseExperimentalNode(declaration, state));
            return;
        case 'VariableDeclarator':
            traverseExperimentalNode(current.init, state);
            bindExperimentalPattern(current.id, resolveExperimentalOriginPath(current.init, state), state);
            return;
        case 'ReturnStatement':
            state.hasExplicitReturn = true;
            traverseExperimentalNode(current.argument, state);
            return;
        case 'ExpressionStatement':
            traverseExperimentalNode(current.expression, state);
            return;
        case 'AssignmentExpression':
            if (isExperimentalStateMutationTarget(current.left, state)) {
                state.hasWriteSyntax = true;
            }
            traverseExperimentalNode(current.left, state);
            traverseExperimentalNode(current.right, state);
            bindExperimentalPattern(current.left, resolveExperimentalOriginPath(current.right, state), state);
            return;
        case 'UpdateExpression':
        case 'UnaryExpression':
            if (current.type === 'UpdateExpression' && isExperimentalStateMutationTarget(current.argument, state)) {
                state.hasWriteSyntax = true;
            }
            if (current.operator === 'typeof') {
                state.hasInspectSyntax = true;
            }
            traverseExperimentalNode(current.argument, state);
            return;
        case 'CallExpression': {
            const calleePath = normalizeExperimentalApiPath(resolveExperimentalOriginPath(current.callee, state));
            const staticCalleePath = extractStaticMemberPath(current.callee);
            if (calleePath) {
                maybeRegisterExperimentalApiUsage(calleePath, state, { called: true });
            } else if (INSPECT_GLOBAL_MEMBER_CALLS.has(staticCalleePath)) {
                state.hasInspectSyntax = true;
            }
            traverseExperimentalNode(current.callee, state);
            current.arguments.forEach((argument) => traverseExperimentalNode(argument, state));
            return;
        }
        case 'Identifier':
        case 'MemberExpression': {
            const originPath = resolveExperimentalOriginPath(current, state);
            if (originPath) {
                maybeRegisterExperimentalApiUsage(originPath, state);
            }
            if (current.type === 'MemberExpression') {
                traverseExperimentalNode(current.object, state);
                if (current.computed) {
                    traverseExperimentalNode(current.property, state);
                }
            }
            return;
        }
        case 'TryStatement':
            traverseExperimentalNode(current.block, state);
            if (current.handler) {
                withExperimentalScope(state, () => {
                    bindExperimentalPattern(current.handler.param, '', state);
                    traverseExperimentalNode(current.handler.body, state);
                });
            }
            traverseExperimentalNode(current.finalizer, state);
            return;
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
        case 'WhileStatement':
        case 'DoWhileStatement':
            traverseExperimentalNode(current.init || current.left, state);
            traverseExperimentalNode(current.test || current.right, state);
            traverseExperimentalNode(current.update, state);
            traverseExperimentalNode(current.body, state);
            return;
        default:
            Object.keys(current).forEach((key) => {
                if (key === 'type' || key === 'start' || key === 'end') return;
                const value = current[key];
                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        if (item && typeof item === 'object') {
                            traverseExperimentalNode(item, state);
                        }
                    });
                    return;
                }
                if (value && typeof value === 'object') {
                    traverseExperimentalNode(value, state);
                }
            });
    }
}

function determineExperimentalRequestKind(state, manifest = {}) {
    if (state.hasWriteSyntax) {
        return JSAPI_REQUEST_KINDS.EFFECT;
    }

    let hasUnknownSemantic = false;
    let hasEffectSemantic = false;

    Array.from(state.calledApis).forEach((apiPath) => {
        const semantic = getApiSemantic(apiPath, manifest);
        if (!semantic) {
            hasUnknownSemantic = true;
            return;
        }
        if (EFFECT_API_SEMANTICS.has(semantic)) {
            hasEffectSemantic = true;
        }
    });

    if (hasEffectSemantic) return JSAPI_REQUEST_KINDS.EFFECT;
    if (hasUnknownSemantic && state.calledApis.size) return JSAPI_REQUEST_KINDS.UNKNOWN;
    if (state.hasInspectSyntax) return JSAPI_REQUEST_KINDS.INSPECT;
    if (state.usedApis.size || state.calledApis.size) return JSAPI_REQUEST_KINDS.READ;
    return JSAPI_REQUEST_KINDS.UNKNOWN;
}

function parseAndAnalyzeExperimentalCode(code, manifest, declaredApiPaths) {
    const state = createExperimentalAnalysisState(manifest, declaredApiPaths);
    let ast = null;

    try {
        ast = parse(`async function __xb__(ctx, st, getContext) {\n${code}\n}`, {
            ecmaVersion: 'latest',
            sourceType: 'script',
        });
    } catch (error) {
        return {
            usedApis: [],
            calledApis: [],
            hasWriteSyntax: false,
            hasInspectSyntax: false,
            requestKind: JSAPI_REQUEST_KINDS.UNKNOWN,
            validationErrors: [`JS 语法解析失败：${error instanceof Error ? error.message : String(error || 'parse_error')}`],
        };
    }

    const fnNode = ast.body.find((node) => node.type === 'FunctionDeclaration');
    const statements = Array.isArray(fnNode?.body?.body) ? fnNode.body.body : [];
    statements.forEach((statement) => traverseExperimentalNode(statement, state));

    if (!state.hasExplicitReturn) {
        state.validationErrors.push('code 必须显式 return 最终结果。');
    }

    return {
        usedApis: Array.from(state.usedApis).sort((a, b) => a.localeCompare(b, 'en')),
        calledApis: Array.from(state.calledApis).sort((a, b) => a.localeCompare(b, 'en')),
        hasWriteSyntax: state.hasWriteSyntax === true,
        hasInspectSyntax: state.hasInspectSyntax === true,
        requestKind: determineExperimentalRequestKind(state, manifest),
        validationErrors: Array.from(new Set(state.validationErrors)),
    };
}

function parseAndValidateCode(code, manifest, declaredApiPaths) {
    const state = createValidationContext(manifest, declaredApiPaths);
    let ast = null;

    try {
        ast = parse(`async function __xb__(ctx, st) {\n${code}\n}`, {
            ecmaVersion: 'latest',
            sourceType: 'script',
        });
    } catch (error) {
        return {
            usedApis: [],
            calledApis: [],
            hasWriteSyntax: false,
            requestKind: JSAPI_REQUEST_KINDS.UNKNOWN,
            validationErrors: [`JS 语法解析失败：${error instanceof Error ? error.message : String(error || 'parse_error')}`],
        };
    }

    const fnNode = ast.body.find((node) => node.type === 'FunctionDeclaration');
    const statements = Array.isArray(fnNode?.body?.body) ? fnNode.body.body : [];
    statements.forEach((statement) => validateStatement(statement, state));

    if (!state.hasExplicitReturn) {
        state.validationErrors.push('code 必须显式 return 最终结果。');
    }

    if (!state.usedApis.size) {
        state.validationErrors.push('code 没有使用任何公开 JS API。');
    }

    const requestKind = determineRequestKind({
        calledApis: Array.from(state.calledApis),
        validationErrors: Array.from(new Set(state.validationErrors)),
        hasWriteSyntax: state.hasWriteSyntax === true,
        hasInspectSyntax: state.hasInspectSyntax === true,
    }, manifest);

    validateDeclaredApiPaths(state, requestKind);

    return {
        usedApis: Array.from(state.usedApis).sort((a, b) => a.localeCompare(b, 'en')),
        calledApis: Array.from(state.calledApis).sort((a, b) => a.localeCompare(b, 'en')),
        hasWriteSyntax: state.hasWriteSyntax === true,
        hasInspectSyntax: state.hasInspectSyntax === true,
        requestKind,
        validationErrors: Array.from(new Set(state.validationErrors)),
    };
}

export function analyzeJavaScriptApiRequest({
    code = '',
    apiPaths = [],
    manifest = {},
} = {}) {
    const normalizedCode = String(code || '').trim();
    const declaredApiPaths = normalizeDeclaredApiPaths(apiPaths);
    const validation = EXPERIMENTAL_FULL_JSAPI
        ? parseAndAnalyzeExperimentalCode(normalizedCode, manifest, declaredApiPaths)
        : parseAndValidateCode(normalizedCode, manifest, declaredApiPaths);
    return {
        requestKind: normalizeJsApiRequestKind(validation.requestKind),
        usedApis: Array.isArray(validation.usedApis) ? validation.usedApis : [],
        calledApis: Array.isArray(validation.calledApis) ? validation.calledApis : [],
        calledApiSemantics: buildCalledApiSemantics(validation.calledApis, manifest),
        hasWriteSyntax: validation.hasWriteSyntax === true,
        hasInspectSyntax: validation.hasInspectSyntax === true,
        validationErrors: Array.isArray(validation.validationErrors) ? validation.validationErrors : [],
    };
}

function apiPathExists(path, ctx, st) {
    const segments = String(path || '').split('.').filter(Boolean);
    if (!segments.length) return false;

    let current = null;
    if (segments[0] === 'ctx') {
        current = ctx;
    } else if (segments[0] === 'st') {
        current = st;
    } else {
        return false;
    }

    for (let index = 1; index < segments.length; index += 1) {
        const segment = segments[index];
        if (current == null || !(segment in current)) {
            return false;
        }
        current = current[segment];
    }

    return true;
}

function shallowFreeze(value) {
    if (!value || typeof value !== 'object') return value;
    return Object.freeze(value);
}

function getOutputNormalizationLimits(requestKind = JSAPI_REQUEST_KINDS.UNKNOWN) {
    if (requestKind === JSAPI_REQUEST_KINDS.INSPECT) {
        return {
            maxDepth: MAX_OUTPUT_DEPTH,
            maxArrayItems: MAX_OUTPUT_ARRAY_ITEMS,
            maxObjectKeys: MAX_OUTPUT_OBJECT_KEYS,
            maxStringLength: MAX_OUTPUT_STRING_LENGTH,
        };
    }
    return {
        maxDepth: Infinity,
        maxArrayItems: Infinity,
        maxObjectKeys: Infinity,
        maxStringLength: Infinity,
    };
}

function normalizeExecutionOutput(value, limits = getOutputNormalizationLimits(), seen = new WeakSet(), depth = 0) {
    if (value === undefined) return '';
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        if (typeof value === 'string' && value.length > limits.maxStringLength) {
            return `${value.slice(0, limits.maxStringLength)}… [truncated ${value.length - limits.maxStringLength} chars]`;
        }
        return value;
    }
    if (typeof value === 'bigint') return `[BigInt:${value.toString()}]`;
    if (typeof value === 'symbol') return `[Symbol:${String(value.description || '')}]`;
    if (typeof value === 'function') return `[Function:${value.name || 'anonymous'}]`;
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: typeof value.stack === 'string' ? value.stack : '',
        };
    }
    if (typeof Element !== 'undefined' && value instanceof Element) {
        return `[Element:${value.tagName}]`;
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (value instanceof RegExp) {
        return value.toString();
    }
    if (depth >= limits.maxDepth) {
        return Array.isArray(value)
            ? `[MaxDepth:Array(${value.length})]`
            : '[MaxDepth:Object]';
    }
    if (Array.isArray(value)) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
        const normalizedItems = value
            .slice(0, limits.maxArrayItems)
            .map((item) => normalizeExecutionOutput(item, limits, seen, depth + 1));
        if (value.length > limits.maxArrayItems) {
            normalizedItems.push(`[... ${value.length - limits.maxArrayItems} more items]`);
        }
        return normalizedItems;
    }
    if (typeof value === 'object') {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
        const output = {};
        const keys = Object.keys(value);
        keys.slice(0, limits.maxObjectKeys).forEach((key) => {
            output[key] = normalizeExecutionOutput(value[key], limits, seen, depth + 1);
        });
        if (keys.length > limits.maxObjectKeys) {
            output.__truncatedKeys__ = keys.length - limits.maxObjectKeys;
        }
        return output;
    }
    return String(value);
}

async function executeValidatedCode(code, ctx, st) {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const runner = EXPERIMENTAL_FULL_JSAPI
        ? new AsyncFunction('ctx', 'st', 'getContext', `"use strict";\n${code}`)
        : new AsyncFunction('ctx', 'st', 'JSON', 'Math', 'Object', 'Array', `"use strict";\n${code}`);
    if (EXPERIMENTAL_FULL_JSAPI) {
        return await runner(ctx, st, () => ctx);
    }
    return await runner(ctx, st, JSON, Math, Object, Array);
}

export async function runJavaScriptApi({
    code = '',
    purpose = '',
    apiPaths = [],
    safety = '',
    expectedOutput = '',
    manifest = {},
    ctx = {},
    st = {},
} = {}) {
    const normalizedCode = String(code || '').trim();
    const normalizedPurpose = String(purpose || '').trim();
    const normalizedExpectedOutput = String(expectedOutput || '').trim();
    const declaredApiPaths = normalizeDeclaredApiPaths(apiPaths);
    const missingFields = [];

    if (!normalizedCode) missingFields.push('code');
    if (!normalizedPurpose) missingFields.push('purpose');
    if (!normalizedExpectedOutput) missingFields.push('expectedOutput');

    if (missingFields.length) {
        return buildResult({
            code: normalizedCode,
            ok: false,
            output: '',
            execution: buildExecutionState({
                isError: true,
                errorCode: 'jsapi_required_fields_missing',
                errorMessage: 'jsapi_required_fields_missing',
                validationErrors: [`缺少必填字段：${missingFields.join(', ')}`],
            }),
            note: '必须至少提供 code、purpose、expectedOutput；effect 请求还需要精确 apiPaths。',
            requestKind: JSAPI_REQUEST_KINDS.UNKNOWN,
            usedApis: [],
            calledApis: [],
            calledApiSemantics: {},
        });
    }

    const validation = analyzeJavaScriptApiRequest({
        code: normalizedCode,
        apiPaths: declaredApiPaths,
        manifest,
    });
    if (!EXPERIMENTAL_FULL_JSAPI && validation.requestKind === JSAPI_REQUEST_KINDS.EFFECT && !declaredApiPaths.length) {
        return buildResult({
            code: normalizedCode,
            ok: false,
            output: '',
            execution: buildExecutionState({
                isError: true,
                errorCode: 'jsapi_required_fields_missing',
                errorMessage: 'jsapi_required_fields_missing',
                validationErrors: ['effect 请求必须显式提供精确 apiPaths。'],
            }),
            note: '副作用 JS API 请求必须显式填写精确 apiPaths。',
            requestKind: validation.requestKind,
            usedApis: validation.usedApis,
            calledApis: validation.calledApis,
            calledApiSemantics: validation.calledApiSemantics,
        });
    }
    if (validation.validationErrors.length) {
        return buildResult({
            code: normalizedCode,
            ok: false,
            output: '',
            execution: buildExecutionState({
                isError: true,
                errorCode: 'jsapi_validation_failed',
                errorMessage: 'jsapi_validation_failed',
                validationErrors: validation.validationErrors,
            }),
            note: EXPERIMENTAL_FULL_JSAPI
                ? '代码未通过实验版 JS 执行前校验。'
                : '代码未通过 JSAPI 受限语法或 API 边界校验。',
            requestKind: validation.requestKind,
            usedApis: validation.usedApis,
            calledApis: validation.calledApis,
            calledApiSemantics: validation.calledApiSemantics,
        });
    }

    const unavailableApis = validation.usedApis.filter((item) => !apiPathExists(item, ctx, st));
    if (unavailableApis.length) {
        return buildResult({
            code: normalizedCode,
            ok: false,
            output: '',
            execution: buildExecutionState({
                isError: true,
                errorCode: 'api_unavailable_on_current_version',
                errorMessage: 'api_unavailable_on_current_version',
                unavailableApis,
            }),
            note: '当前实例缺少本次代码使用到的公开 API。',
            requestKind: validation.requestKind,
            usedApis: validation.usedApis,
            calledApis: validation.calledApis,
            calledApiSemantics: validation.calledApiSemantics,
        });
    }

    try {
        const result = await executeValidatedCode(
            normalizedCode,
            EXPERIMENTAL_FULL_JSAPI ? ctx : shallowFreeze(ctx),
            EXPERIMENTAL_FULL_JSAPI ? st : shallowFreeze(st),
        );
        const outputLimits = getOutputNormalizationLimits(validation.requestKind);
        return buildResult({
            code: normalizedCode,
            ok: true,
            output: normalizeExecutionOutput(result, outputLimits),
            execution: buildExecutionState(),
            note: '',
            requestKind: validation.requestKind,
            usedApis: validation.usedApis,
            calledApis: validation.calledApis,
            calledApiSemantics: validation.calledApiSemantics,
        });
    } catch (error) {
        return buildResult({
            code: normalizedCode,
            ok: false,
            output: '',
            execution: buildExecutionState({
                isError: true,
                errorCode: 'jsapi_execution_failed',
                errorMessage: error instanceof Error ? error.message : String(error || 'jsapi_execution_failed'),
            }),
            note: '',
            requestKind: validation.requestKind,
            usedApis: validation.usedApis,
            calledApis: validation.calledApis,
            calledApiSemantics: validation.calledApiSemantics,
        });
    }
}
