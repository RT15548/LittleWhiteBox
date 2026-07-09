/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import { substituteParams } from "../../../../../../../script.js";
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function text(value) {
  return String(value || "");
}
function normalizeOptions(value) {
  const source = asRecord(value);
  const options = {};
  const name1Override = text(source.name1Override).trim();
  const name2Override = text(source.name2Override).trim();
  if (name1Override) {
    options.name1Override = name1Override;
  }
  if (name2Override) {
    options.name2Override = name2Override;
  }
  if (source.original !== void 0) {
    options.original = text(source.original);
  }
  if (source.replaceCharacterCard !== void 0) {
    options.replaceCharacterCard = source.replaceCharacterCard !== false;
  }
  return options;
}
function applyTavernSubstituteParams(input) {
  const source = asRecord(input);
  const rawItems = Array.isArray(source.items) ? source.items : [];
  let changedCount = 0;
  const items = rawItems.map((rawItem, index) => {
    const item = asRecord(rawItem);
    const id = text(item.id).trim() || `item-${index}`;
    const original = text(item.text);
    const textValue = substituteParams(original, normalizeOptions(item.options));
    const changed = textValue !== original;
    if (changed) {
      changedCount += 1;
    }
    return {
      id,
      text: textValue,
      changed
    };
  });
  return {
    items,
    changedCount
  };
}
export {
  applyTavernSubstituteParams
};
