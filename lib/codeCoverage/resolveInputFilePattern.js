import glob from 'fast-glob';
import { normalizePathSeparators, validateFilePath } from './paths.js';
export async function resolveInputFilePatterns(patterns) {
    const resolvedPaths = [];
    for (const pattern of patterns) {
        validateFilePath(pattern);
        if (!glob.isDynamicPattern(pattern)) {
            resolvedPaths.push(normalizePathSeparators(pattern));
            continue;
        }
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
