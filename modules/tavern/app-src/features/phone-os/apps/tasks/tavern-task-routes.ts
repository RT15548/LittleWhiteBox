export const TAVERN_TASK_BOARD_PATH = '/board';
export const TAVERN_TASK_ACTIVE_PATH = '/active';
export const TAVERN_TASK_PUBLISHED_PATH = '/published';
export const TAVERN_TASK_PUBLISH_PATH = '/published/new';
export const TAVERN_TASK_HISTORY_PATH = '/history';

export type TavernTaskRootPath =
    | typeof TAVERN_TASK_BOARD_PATH
    | typeof TAVERN_TASK_ACTIVE_PATH
    | typeof TAVERN_TASK_PUBLISHED_PATH
    | typeof TAVERN_TASK_HISTORY_PATH;

export const TAVERN_TASK_ROOT_PATHS: readonly TavernTaskRootPath[] = [
    TAVERN_TASK_BOARD_PATH,
    TAVERN_TASK_ACTIVE_PATH,
    TAVERN_TASK_PUBLISHED_PATH,
    TAVERN_TASK_HISTORY_PATH,
];

export function tavernTaskListingPath(listingId = ''): string {
    return `${TAVERN_TASK_BOARD_PATH}/${encodeURIComponent(String(listingId || '').trim())}`;
}

export function tavernTaskDetailPath(taskId = ''): string {
    return `/task/${encodeURIComponent(String(taskId || '').trim())}`;
}

export function isTavernTaskRootPath(path = ''): path is TavernTaskRootPath {
    return TAVERN_TASK_ROOT_PATHS.includes(path as TavernTaskRootPath);
}

export function tavernTaskIdFromPath(path = ''): string {
    if (!path.startsWith('/task/')) {return '';}
    try {
        return decodeURIComponent(path.slice('/task/'.length));
    } catch {
        return '';
    }
}

export function tavernTaskListingIdFromPath(path = ''): string {
    if (!path.startsWith(`${TAVERN_TASK_BOARD_PATH}/`)) {return '';}
    try {
        return decodeURIComponent(path.slice(TAVERN_TASK_BOARD_PATH.length + 1));
    } catch {
        return '';
    }
}
