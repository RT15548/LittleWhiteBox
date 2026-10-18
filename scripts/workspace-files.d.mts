export function collectWorkspaceFiles(
    root: string,
    extensions: ReadonlySet<string>,
    ignoredDirectories?: ReadonlySet<string>,
): string[];

export function collectSourceFiles(root: string, extensions: ReadonlySet<string>): string[];
