import path from 'node:path';
export function validateFilePath(filePath) {
    if (filePath.includes('..') || isAbsoluteSourcePath(filePath)) {
        throw new Error('Invalid file path: absolute paths and ".." segments are not allowed');
    }
}
export function isAbsoluteSourcePath(sourcePath) {
    const trimmedPath = sourcePath.trim();
    const pathInput = normalizePathSeparators(trimmedPath);
    const windowsPath = /^[a-zA-Z]:[\\/]/.test(trimmedPath) ||
        trimmedPath.startsWith('\\\\') ||
        trimmedPath.startsWith('//');
    const pathApi = windowsPath ? path.win32 : path.posix;
    return pathApi.isAbsolute(pathInput);
}
export function normalizePathSeparators(sourcePath) {
    return sourcePath.trim().replace(/\\/g, '/').replace(/^\.\//, '');
}
export function normalizeSourcePath(sourcePath, repositoryRoot) {
    const trimmedPath = sourcePath.trim();
    const pathInput = normalizePathSeparators(trimmedPath);
    const windowsPath = /^[a-zA-Z]:[\\/]/.test(trimmedPath) ||
        trimmedPath.startsWith('\\\\') ||
        trimmedPath.startsWith('//');
    const pathApi = windowsPath ? path.win32 : path.posix;
    const absolutePath = pathApi.isAbsolute(pathInput);
    const normalizedPath = absolutePath
        ? pathApi.relative(repositoryRoot, pathInput)
        : pathInput;
    if (absolutePath &&
        (!normalizedPath ||
            normalizedPath === '..' ||
            normalizedPath.startsWith(`..${pathApi.sep}`) ||
            pathApi.isAbsolute(normalizedPath))) {
        throw new Error(`Invalid source path outside the repository: ${sourcePath}`);
    }
    return normalizePathSeparators(normalizedPath);
}
