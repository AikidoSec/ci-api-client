import { glob } from 'fast-glob';
import { normalizePathSeparators, validateFilePath } from './paths.js';

/**
 * Expand glob patterns (and literal paths) to workspace-relative file paths.
 * Every pattern must match at least one file.
 */
export async function resolveInputFilePatterns(patterns: string[]) {
  const resolvedPaths = [];

  for (const pattern of patterns) {
    validateFilePath(pattern);

    const matches = await glob(pattern, {
      onlyFiles: true,
      followSymbolicLinks: false,
    });

    if (matches.length === 0) {
      throw new Error(`No file(s) found matching "${pattern}"`);
    }

    for (const match of matches.sort()) {
      const relativePath = normalizePathSeparators(match);
      validateFilePath(relativePath);
      resolvedPaths.push(relativePath);
    }
  }

  return [...new Set(resolvedPaths)];
}
