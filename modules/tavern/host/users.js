/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import { getUserAvatars, setUserAvatar, user_avatar } from "../../../../../../personas.js";
import { power_user } from "../../../../../../power-user.js";
import { getThumbnailUrl } from "../../../../../../../script.js";
function normalizeText(value = "") {
  return String(value || "").trim();
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizePersonaAvatar(value = "") {
  const avatarId = normalizeText(value);
  if (!avatarId) {
    return "";
  }
  try {
    return getThumbnailUrl("persona", avatarId);
  } catch {
    return `/thumbnail?type=persona&file=${encodeURIComponent(avatarId)}`;
  }
}
function normalizeTavernUserOption(value, activeId = "") {
  const avatarId = normalizeText(value);
  if (!avatarId) {
    return null;
  }
  const personaNames = asRecord(power_user?.personas);
  const personaDescriptions = asRecord(power_user?.persona_descriptions);
  const rawDescription = personaDescriptions[avatarId];
  const details = asRecord(rawDescription);
  const name = normalizeText(personaNames[avatarId]) || avatarId;
  return {
    id: avatarId,
    name,
    avatarUrl: normalizePersonaAvatar(avatarId),
    description: typeof rawDescription === "string" ? normalizeText(rawDescription) : normalizeText(details.description || details.title),
    active: avatarId === activeId
  };
}
async function buildTavernUserList() {
  const avatars = await getUserAvatars(false);
  const currentUserId = normalizeText(user_avatar) || null;
  const users = (Array.isArray(avatars) ? avatars : []).map((avatarId) => normalizeTavernUserOption(avatarId, currentUserId || "")).filter((option) => Boolean(option));
  if (currentUserId && !users.some((item) => item.id === currentUserId)) {
    const current = normalizeTavernUserOption(currentUserId, currentUserId);
    if (current) {
      users.unshift(current);
    }
  }
  return {
    users,
    currentUserId
  };
}
async function listTavernUsers() {
  return await buildTavernUserList();
}
async function switchTavernUser(payload = {}) {
  const userId = normalizeText(payload.userId);
  if (!userId) {
    throw new Error("user_id_required");
  }
  await setUserAvatar(userId, {
    toastPersonaNameChange: false,
    navigateToCurrent: false
  });
  return await buildTavernUserList();
}
export {
  listTavernUsers,
  switchTavernUser
};
