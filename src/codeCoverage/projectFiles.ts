import { promises as fs } from 'node:fs';
import path from 'node:path';
import ignore, { Ignore } from 'ignore';

// Always skip these, even if .gitignore does not list them.
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
  'target/', // Java/Rust
  'Pods/', // Swift
];

type TIgnoreStackEntry = {
  base: string;
  ig: Ignore;
};

export type TProjectFiles = {
  root: string;
  files: string[];
};

// Walk the repo and return relative file paths, applying hardcoded ignores + .gitignore.
export async function loadProjectFiles(): Promise<TProjectFiles | null> {
  const root = await findGitRoot(process.cwd());
  const ignoreManager = ignore().add(HARDCODED_IGNORES);

  try {
    ignoreManager.add(await fs.readFile(path.join(root, '.gitignore'), 'utf8'));
  } catch {
    // No root .gitignore — hardcoded rules still apply.
  }

  const files: string[] = [];
  await collectFiles(root, '', [{ base: '', ig: ignoreManager }], files);

  const projectFiles = files.filter(isLikelySourceFile);
  return projectFiles.length === 0 ? null : { root, files: projectFiles };
}

async function findGitRoot(startDir: string): Promise<string> {
  const start = path.resolve(startDir);
  let dir = start;

  while (path.dirname(dir) !== dir) {
    try {
      await fs.access(path.join(dir, '.git'));
      return dir;
    } catch {
      dir = path.dirname(dir);
    }
  }

  try {
    await fs.access(path.join(dir, '.git'));
    return dir;
  } catch {
    return start;
  }
}

// Skip coverage report files and .gitignore — not useful as source matches.
// Not in HARDCODED_IGNORES because these often live at the repo root and are not gitignored.
function isLikelySourceFile(relativePath: string): boolean {
  const base = relativePath.slice(relativePath.lastIndexOf('/') + 1);
  const lower = base.toLowerCase();

  if (
    lower === '.gitignore' ||
    lower.endsWith('.lcov') ||
    lower === 'lcov.info' ||
    (lower.endsWith('.info') && lower.includes('lcov')) ||
    lower === 'coverage-final.json' ||
    lower === 'clover.xml' ||
    lower === 'cobertura.xml' ||
    (lower.endsWith('.xml') && lower.includes('cobertura'))
  ) {
    return false;
  }

  return true;
}

// Recursively list files. ignoreStack is root → nested .gitignore rules for this path.
async function collectFiles(
  absoluteDir: string,
  relativeDir: string,
  ignoreStack: TIgnoreStackEntry[],
  files: string[]
): Promise<void> {
  let stack = ignoreStack;

  if (relativeDir) {
    try {
      const nested = ignore().add(
        await fs.readFile(path.join(absoluteDir, '.gitignore'), 'utf8')
      );
      stack = [...ignoreStack, { base: relativeDir, ig: nested }];
    } catch {
      // No nested .gitignore for this directory.
    }
  }

  let entries;
  try {
    entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  } catch {
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
      await collectFiles(
        path.join(absoluteDir, entry.name),
        relativePath,
        stack,
        files
      );
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      files.push(relativePath);
    }
  }
}

// Git last-match: walk root → nested; a later matching rule (including !negation) wins.
function isIgnored(
  relativePath: string,
  isDirectory: boolean,
  stack: TIgnoreStackEntry[]
): boolean {
  let ignored = false;

  for (const { base, ig } of stack) {
    const testPath = base ? relativePath.slice(base.length + 1) : relativePath;

    if (!testPath) {
      continue;
    }

    const result = ignoreDecision(ig, testPath, isDirectory);

    if (result.ignored) {
      ignored = true;
    } else if (result.unignored) {
      ignored = false;
    }
  }

  return ignored;
}

// Directory patterns end with "/"; node-ignore treats "foo" as a file unless we also test "foo/".
function ignoreDecision(
  ig: Ignore,
  testPath: string,
  isDirectory: boolean
): { ignored: boolean; unignored: boolean } {
  const result = ig.test(testPath);

  if (isDirectory) {
    const directoryResult = ig.test(`${testPath}/`);
    if (directoryResult.ignored || directoryResult.unignored) {
      return directoryResult;
    }
  }

  return result;
}

// Drop the file extension: "src/foo.ts" → "src/foo".
export function pathStem(sourcePath: string): string {
  const lastSlashIndex = sourcePath.lastIndexOf('/');
  const lastDotIndex = sourcePath.lastIndexOf('.');

  if (lastDotIndex > lastSlashIndex) {
    return sourcePath.slice(0, lastDotIndex);
  }

  return sourcePath;
}

function normalizePath(filePath: string): string {
  return filePath.trim().replace(/\\/g, '/').replace(/^\.\//, '');
}

// True if paths are equal, or one ends with the other after a "/".
// e.g. "app/src/util.js" matches "src/util.js"; "src/utils.js" does not match "util.js".
function isSamePathOrSuffix(fullPath: string, possibleSuffix: string): boolean {
  const normalizedFullPath = fullPath.toLowerCase();
  const suffix = possibleSuffix.toLowerCase();
  return (
    normalizedFullPath === suffix ||
    normalizedFullPath.endsWith(`/${suffix}`)
  );
}

// Count matching segments from the end: "x/a/b.js" and "y/a/b.js" → 2.
// needed for picking the best match when there are multiple candidates
function countSharedTrailingSegments(
  leftPath: string,
  rightPath: string
): number {
  const leftSegments = leftPath.toLowerCase().split('/');
  const rightSegments = rightPath.toLowerCase().split('/');
  const maxShared = Math.min(leftSegments.length, rightSegments.length);
  let sharedCount = 0;

  while (
    sharedCount < maxShared &&
    leftSegments[leftSegments.length - 1 - sharedCount] ===
      rightSegments[rightSegments.length - 1 - sharedCount]
  ) {
    sharedCount++;
  }

  return sharedCount;
}

// Prefer more shared trailing segments, then the shorter path. Tie → null (ambiguous).
// needed for picking the best match when there are multiple candidates
function pickBestMatch(
  coveragePath: string,
  candidates: string[]
): string | null {
  let best: string | null = null;
  let bestShared = -1;
  let bestLength = Infinity;
  let ambiguous = false;

  for (const candidate of candidates) {
    const shared = countSharedTrailingSegments(coveragePath, candidate);

    if (
      shared > bestShared ||
      (shared === bestShared && candidate.length < bestLength)
    ) {
      best = candidate;
      bestShared = shared;
      bestLength = candidate.length;
      ambiguous = false;
    } else if (shared === bestShared && candidate.length === bestLength) {
      ambiguous = true;
    }
  }

  return ambiguous ? null : best;
}

// Map a coverage report path (LCOV SF:) to a real project file. No match → null (drop it).
export function createPathResolver(
  projectFiles: string[]
): (coveragePath: string) => string | null {
  const byBasename = new Map<string, string[]>();

  // group by basename
  for (const projectPath of projectFiles) {
    const key = projectPath
      .slice(projectPath.lastIndexOf('/') + 1)
      .toLowerCase();
    const entries = byBasename.get(key);
    if (entries) {
      entries.push(projectPath);
    } else {
      byBasename.set(key, [projectPath]);
    }
  }

  return (coveragePath: string) => {
    const normalizedCoveragePath = normalizePath(coveragePath);
    const key = normalizedCoveragePath
      .slice(normalizedCoveragePath.lastIndexOf('/') + 1)
      .toLowerCase();

    // find all files with the same basename
    const candidates = byBasename.get(key) ?? [];

    // filter by path suffix
    const matches = candidates.filter(
      (projectPath) =>
        isSamePathOrSuffix(projectPath, normalizedCoveragePath) ||
        isSamePathOrSuffix(normalizedCoveragePath, projectPath)
    );

    if (matches.length === 0) {
      return null;
    }

    const exactMatch = matches.find(
      (projectPath) => projectPath === normalizedCoveragePath
    );
    if (exactMatch) {
      return exactMatch;
    }

    if (matches.length === 1) {
      return matches[0];
    }

    return pickBestMatch(normalizedCoveragePath, matches);
  };
}
