import { normalizePathSeparators, normalizeSourcePath } from './paths.js';
export function detectFormatFromFilename(filename) {
    const lower = normalizePathSeparators(filename).toLowerCase();
    const base = lower.slice(lower.lastIndexOf('/') + 1);
    if (base.endsWith('.lcov') || base.endsWith('.info') || base.includes('lcov')) {
        return 'lcov';
    }
    if (base.endsWith('.xml') || base.includes('cobertura')) {
        return 'cobertura';
    }
    throw new Error(`Could not detect coverage format from filename "${filename}". ` +
        'Use a name like lcov.info, *.lcov, or *cobertura*.xml.');
}
export function extractCoveredSourcePaths(content, format, repositoryRoot) {
    if (format === 'cobertura') {
        return extractCoberturaFilenames(content, repositoryRoot);
    }
    return extractLcovFilenames(content, repositoryRoot);
}
function extractLcovFilenames(content, repositoryRoot) {
    return [...content.matchAll(/^SF:([^\r\n]+)$/gm)]
        .map((match) => normalizeSourcePath(match[1], repositoryRoot))
        .filter(Boolean);
}
function extractCoberturaFilenames(content, repositoryRoot) {
    const paths = [];
    for (const match of content.matchAll(/\bfilename\s*=\s*"([^"]+)"/gi)) {
        const normalized = normalizeSourcePath(match[1], repositoryRoot);
        if (normalized) {
            paths.push(normalized);
        }
    }
    return paths;
}
