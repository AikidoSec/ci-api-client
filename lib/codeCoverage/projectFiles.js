import { promises as fs } from 'node:fs';
import path from 'node:path';
import ignore from 'ignore';
const HARDCODED_IGNORES = [
    '.git/',
    'node_modules/',
    'vendor/',
    'coverage/',
    'dist/',
    'build/',
    '.venv/',
    'venv/',
    '__pycache__/',
    '.eggs/',
    '*.egg-info/',
    '.tox/',
    '.mypy_cache/',
    '.pytest_cache/',
    '.next/',
    '.nuxt/',
    '.turbo/',
    '.cache/',
    'bower_components/',
    '*.png',
    '*.gif',
    '*.jpg',
    '*.jpeg',
    '*.webp',
    '*.ico',
    '*.woff',
    '*.woff2',
    '*.ttf',
    '*.eot',
    '*.mp4',
    '*.mp3',
    '.nyc_output/',
    'jspm_packages/',
    '.yarn/cache/',
    '.pnpm-store/',
    'target/',
    'Pods/',
];
export async function loadProjectFiles() {
    const root = await findGitRoot(process.cwd());
    const ignoreManager = ignore().add(HARDCODED_IGNORES);
    try {
        ignoreManager.add(await fs.readFile(path.join(root, '.gitignore'), 'utf8'));
    }
    catch {
    }
    const files = [];
    await collectFiles(root, '', [{ base: '', ig: ignoreManager }], files);
    const projectFiles = files.filter(isLikelySourceFile);
    return projectFiles.length === 0 ? null : { root, files: projectFiles };
}
async function findGitRoot(startDir) {
    const start = path.resolve(startDir);
    let dir = start;
    while (path.dirname(dir) !== dir) {
        try {
            await fs.access(path.join(dir, '.git'));
            return dir;
        }
        catch {
            dir = path.dirname(dir);
        }
    }
    try {
        await fs.access(path.join(dir, '.git'));
        return dir;
    }
    catch {
        return start;
    }
}
function isLikelySourceFile(relativePath) {
    const base = relativePath.slice(relativePath.lastIndexOf('/') + 1);
    const lower = base.toLowerCase();
    if (lower === '.gitignore' ||
        lower.endsWith('.lcov') ||
        lower === 'lcov.info' ||
        (lower.endsWith('.info') && lower.includes('lcov')) ||
        lower === 'coverage-final.json' ||
        lower === 'clover.xml' ||
        lower === 'cobertura.xml' ||
        (lower.endsWith('.xml') && lower.includes('cobertura'))) {
        return false;
    }
    return true;
}
async function collectFiles(absoluteDir, relativeDir, ignoreStack, files) {
    let stack = ignoreStack;
    if (relativeDir) {
        try {
            const nested = ignore().add(await fs.readFile(path.join(absoluteDir, '.gitignore'), 'utf8'));
            stack = [...ignoreStack, { base: relativeDir, ig: nested }];
        }
        catch {
        }
    }
    let entries;
    try {
        entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    }
    catch {
        return;
    }
    for (const entry of entries) {
        const relativePath = relativeDir
            ? `${relativeDir}/${entry.name}`
            : entry.name;
        if (isIgnored(relativePath, entry.isDirectory(), stack)) {
            continue;
        }
        if (entry.isDirectory()) {
            await collectFiles(path.join(absoluteDir, entry.name), relativePath, stack, files);
        }
        else if (entry.isFile() || entry.isSymbolicLink()) {
            files.push(relativePath);
        }
    }
}
function isIgnored(relativePath, isDirectory, stack) {
    let ignored = false;
    for (const { base, ig } of stack) {
        const testPath = base ? relativePath.slice(base.length + 1) : relativePath;
        if (!testPath) {
            continue;
        }
        const result = ignoreDecision(ig, testPath, isDirectory);
        if (result.ignored) {
            ignored = true;
        }
        else if (result.unignored) {
            ignored = false;
        }
    }
    return ignored;
}
function ignoreDecision(ig, testPath, isDirectory) {
    const result = ig.test(testPath);
    if (isDirectory) {
        const directoryResult = ig.test(`${testPath}/`);
        if (directoryResult.ignored || directoryResult.unignored) {
            return directoryResult;
        }
    }
    return result;
}
export function pathStem(sourcePath) {
    const lastSlashIndex = sourcePath.lastIndexOf('/');
    const lastDotIndex = sourcePath.lastIndexOf('.');
    if (lastDotIndex > lastSlashIndex) {
        return sourcePath.slice(0, lastDotIndex);
    }
    return sourcePath;
}
function normalizePath(filePath) {
    return filePath.trim().replace(/\\/g, '/').replace(/^\.\//, '');
}
function isSamePathOrSuffix(fullPath, possibleSuffix) {
    const normalizedFullPath = fullPath.toLowerCase();
    const suffix = possibleSuffix.toLowerCase();
    return (normalizedFullPath === suffix ||
        normalizedFullPath.endsWith(`/${suffix}`));
}
function countSharedTrailingSegments(leftPath, rightPath) {
    const leftSegments = leftPath.toLowerCase().split('/');
    const rightSegments = rightPath.toLowerCase().split('/');
    const maxShared = Math.min(leftSegments.length, rightSegments.length);
    let sharedCount = 0;
    while (sharedCount < maxShared &&
        leftSegments[leftSegments.length - 1 - sharedCount] ===
            rightSegments[rightSegments.length - 1 - sharedCount]) {
        sharedCount++;
    }
    return sharedCount;
}
function pickBestMatch(coveragePath, candidates) {
    let best = null;
    let bestShared = -1;
    let bestLength = Infinity;
    let ambiguous = false;
    for (const candidate of candidates) {
        const shared = countSharedTrailingSegments(coveragePath, candidate);
        if (shared > bestShared ||
            (shared === bestShared && candidate.length < bestLength)) {
            best = candidate;
            bestShared = shared;
            bestLength = candidate.length;
            ambiguous = false;
        }
        else if (shared === bestShared && candidate.length === bestLength) {
            ambiguous = true;
        }
    }
    return ambiguous ? null : best;
}
export function createPathResolver(projectFiles) {
    const byBasename = new Map();
    for (const projectPath of projectFiles) {
        const key = projectPath
            .slice(projectPath.lastIndexOf('/') + 1)
            .toLowerCase();
        const entries = byBasename.get(key);
        if (entries) {
            entries.push(projectPath);
        }
        else {
            byBasename.set(key, [projectPath]);
        }
    }
    return (coveragePath) => {
        const normalizedCoveragePath = normalizePath(coveragePath);
        const key = normalizedCoveragePath
            .slice(normalizedCoveragePath.lastIndexOf('/') + 1)
            .toLowerCase();
        const candidates = byBasename.get(key) ?? [];
        const matches = candidates.filter((projectPath) => isSamePathOrSuffix(projectPath, normalizedCoveragePath) ||
            isSamePathOrSuffix(normalizedCoveragePath, projectPath));
        if (matches.length === 0) {
            return null;
        }
        const exactMatch = matches.find((projectPath) => projectPath === normalizedCoveragePath);
        if (exactMatch) {
            return exactMatch;
        }
        if (matches.length === 1) {
            return matches[0];
        }
        return pickBestMatch(normalizedCoveragePath, matches);
    };
}
