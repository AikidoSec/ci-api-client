import path from 'node:path';

/**
 * Validate that a file path is safe to read.
 * Rejects absolute paths and paths containing '..' segments to prevent
 * directory traversal and arbitrary file access.
 */
export function validateFilePath(filePath: string): void {
  if (filePath.includes('..') || isAbsoluteSourcePath(filePath)) {
    throw new Error(
      'Invalid file path: absolute paths and ".." segments are not allowed'
    );
  }
}

export function isAbsoluteSourcePath(sourcePath: string): boolean {
  const trimmedPath = sourcePath.trim();
  const pathInput = normalizePathSeparators(trimmedPath);

  const windowsPath =
    /^[a-zA-Z]:[\\/]/.test(trimmedPath) ||
    trimmedPath.startsWith('\\\\') ||
    trimmedPath.startsWith('//');
  const pathApi = windowsPath ? path.win32 : path.posix;

  return pathApi.isAbsolute(pathInput);
}

/** Trim, use forward slashes, drop a leading `./`. */
export function normalizePathSeparators(sourcePath: string): string {
  return sourcePath.trim().replace(/\\/g, '/').replace(/^\.\//, '');
}

export function normalizeSourcePath(
  sourcePath: string,
  repositoryRoot: string
): string {
  const trimmedPath = sourcePath.trim();
  const pathInput = normalizePathSeparators(trimmedPath);

  const windowsPath =
    /^[a-zA-Z]:[\\/]/.test(trimmedPath) ||
    trimmedPath.startsWith('\\\\') ||
    trimmedPath.startsWith('//');
  const pathApi = windowsPath ? path.win32 : path.posix;
  const absolutePath = pathApi.isAbsolute(pathInput);
  const normalizedPath = absolutePath
    ? pathApi.relative(repositoryRoot, pathInput)
    : pathInput;

  if (
    absolutePath &&
    (!normalizedPath ||
      normalizedPath === '..' ||
      normalizedPath.startsWith(`..${pathApi.sep}`) ||
      pathApi.isAbsolute(normalizedPath))
  ) {
    throw new Error(`Invalid source path outside the repository: ${sourcePath}`);
  }

  return normalizePathSeparators(normalizedPath);
}
