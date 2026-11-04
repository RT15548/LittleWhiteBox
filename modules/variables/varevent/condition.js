import { parse, tokenizer } from 'acorn';
import { lwbSplitPathWithBrackets } from '../../../core/variable-path.js';

const ORDERING = new Set(['>', '>=', '<', '<=']);
const COMPARISONS = new Set([...ORDERING, '==', '!=']);
const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const options = { ecmaVersion: 'latest' };

// Keep offsets stable while making the historical var(...) syntax valid JavaScript.
function normalizeMacros(source) {
    const tokens = [...tokenizer(source, options)];
    const edits = tokens.filter((token, index) =>
        token.value === 'var' && tokens[index + 1]?.type.label === '('
        && !['.', '?.'].includes(tokens[index - 1]?.type.label));
    for (const token of edits.reverse()) {
        source = source.slice(0, token.start) + token.value.toUpperCase() + source.slice(token.end);
    }
    return source;
}

function macro(node) {
    return node?.type === 'CallExpression' && node.callee.type === 'Identifier'
        && ['VAR', 'val'].includes(node.callee.name) && node.arguments.length === 1;
}

function children(node) {
    return Object.values(node).flatMap(value => Array.isArray(value) ? value : [value])
        .filter(value => value && typeof value === 'object' && typeof value.type === 'string')
        .sort((a, b) => a.start - b.start);
}

function compileNode(node, source) {
    if (node.type === 'BinaryExpression' && ORDERING.has(node.operator) && (macro(node.left) || macro(node.right))) {
        return `REL((${compileNode(node.left, source)}),${JSON.stringify(node.operator)},(${compileNode(node.right, source)}))`;
    }
    if (macro(node)) return `${node.callee.name === 'VAR' ? 'VAR' : 'VAL'}((${compileNode(node.arguments[0], source)}))`;
    let output = '', cursor = node.start;
    for (const child of children(node)) {
        if (child.start < cursor) continue; // Shorthand properties share their key/value span.
        output += source.slice(cursor, child.start) + compileNode(child, source);
        cursor = child.end;
    }
    return output + source.slice(cursor, node.end);
}

export function parseCondition(source) {
    const normalized = normalizeMacros(String(source));
    const program = parse(normalized, options);
    return { program, code: compileNode(program, String(source)) };
}

export function readConditionVariable(variables, path, readRoot) {
    const segments = lwbSplitPathWithBrackets(String(path ?? '').trim());
    if (!segments.length || !Object.hasOwn(variables, segments[0])) return undefined;
    let value = variables[segments[0]];
    // Missing/null are checked before the host's coercion. Defined root values keep
    // the same getLocalVariable semantics as existing handwritten conditions.
    if (value == null) return value;
    if (segments.length === 1 && readRoot) value = readRoot(segments[0]);
    if (segments.length > 1 && typeof value === 'string') {
        try { value = JSON.parse(value); } catch { return undefined; }
    }
    for (const segment of segments.slice(1)) {
        if (value == null || !Object.hasOwn(Object(value), segment)) return undefined;
        value = value[segment];
    }
    if (value == null) return value;
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export function compareConditionValues(a, operator, b) {
    if (a == null || b == null) return false;
    const numeric = value => NUMBER.test(String(value).trim()) && Number.isFinite(Number(value));
    const bothNumeric = numeric(a) && numeric(b);
    const left = bothNumeric ? Number(a) : String(a), right = bothNumeric ? Number(b) : String(b);
    switch (operator) {
        case '>': return left > right;
        case '>=': return left >= right;
        case '<': return left < right;
        case '<=': return left <= right;
        default: throw new TypeError(`Unknown comparison operator: ${operator}`);
    }
}

// Handwritten conditions intentionally retain JavaScript execution, not a new sandbox.
export function executeCondition(parsed, getContext, getLocalVariable) {
    // eslint-disable-next-line no-unused-vars -- Referenced by the compiled user expression.
    const VAR = path => readConditionVariable(getContext()?.chatMetadata?.variables || {}, path, getLocalVariable);
    // eslint-disable-next-line no-unused-vars -- Referenced by the compiled user expression.
    const VAL = value => String(value ?? '');
    // eslint-disable-next-line no-unused-vars -- Referenced by the compiled user expression.
    const REL = compareConditionValues;
    // eslint-disable-next-line no-eval -- Existing user-authored condition capability; macros are parsed, not interpolated.
    return Boolean(eval(parsed.code));
}

function literal(node) {
    if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
    if (node.type === 'TemplateLiteral' && !node.expressions.length) return node.quasis[0].value.cooked;
    return null;
}

function comparison(node) {
    if (node.type !== 'BinaryExpression' || !COMPARISONS.has(node.operator)
        || !macro(node.left) || node.left.callee.name !== 'VAR' || !macro(node.right)) return null;
    const lhs = literal(node.left.arguments[0]), rhs = literal(node.right.arguments[0]);
    return lhs === null || rhs === null ? null : { lhs, op: node.operator, rhs, rhsIsVar: node.right.callee.name === 'VAR' };
}

function flatten(node, operator) {
    return node.type === 'LogicalExpression' && node.operator === operator
        ? [...flatten(node.left, operator), ...flatten(node.right, operator)] : [node];
}

/** Return null rather than a partial projection of a handwritten expression. */
export function conditionGroups(source) {
    const { program } = parseCondition(source);
    if (program.body.length !== 1 || program.body[0].type !== 'ExpressionStatement') return null;
    const expression = program.body[0].expression;
    const operator = expression.type === 'LogicalExpression' ? expression.operator : '&&';
    if (!['&&', '||'].includes(operator)) return null;
    const groups = [];
    for (const [index, node] of flatten(expression, operator).entries()) {
        const rowOperator = node.type === 'LogicalExpression' ? node.operator : '&&';
        if (!['&&', '||'].includes(rowOperator)) return null;
        const rows = flatten(node, rowOperator).map(comparison);
        if (rows.some(row => !row)) return null;
        groups.push({ operator: index ? operator : null, rows: rows.map((row, i) => ({ ...row, lop: i ? rowOperator : null })) });
    }
    return groups;
}

export function macroExpression(name, value) {
    return `${name}(${JSON.stringify(String(value))})`;
}

export function joinConditions(left, operator, right) {
    return left ? `(${left}) ${operator} (${right})` : right;
}
