import { promises as fs } from 'node:fs';
import path from 'node:path';

// Drop coverage that points past the end of the source file.
// applied per-extension in their uploader and are not language-agnostic — we only
export async function loadSourceLineFixes(
  repositoryRoot: string,
  sourcePath: string
): Promise<{ eof: number } | null> {
  if (!repositoryRoot || !sourcePath) {
    return null;
  }

  try {
    const base = path.resolve(repositoryRoot);
    const target = path.resolve(base, sourcePath);
    const relative = path.relative(base, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return null;
    }

    // Do not follow symlinks: a tracked link can point at an unbounded
    // special file (e.g. /dev/zero) and hang or exhaust memory on read.
    const stats = await fs.lstat(target);
    if (stats.isSymbolicLink() || !stats.isFile()) {
      return null;
    }

    const content = await fs.readFile(target, 'utf8');
    const lineCount = content.split(/\r?\n/).length;
    return { eof: lineCount };
  } catch {
    return null;
  }
}

type TCoverageRecord = {
  lines: Map<number, unknown>;
  functions: Map<string, { line: number }>;
  branches: Map<string, unknown>;
};

export function applySourceLineFixes(
  record: TCoverageRecord,
  lineFixes: { eof: number } | null
): TCoverageRecord {
  if (!lineFixes) {
    return record;
  }

  const { eof } = lineFixes;

  for (const lineNumber of record.lines.keys()) {
    if (lineNumber < 1 || lineNumber > eof) {
      record.lines.delete(lineNumber);
    }
  }

  for (const [functionName, meta] of record.functions.entries()) {
    if (meta.line < 1 || meta.line > eof) {
      record.functions.delete(functionName);
    }
  }

  for (const branchKey of record.branches.keys()) {
    const lineNumber = Number(branchKey.split('\0')[0]);
    if (lineNumber < 1 || lineNumber > eof) {
      record.branches.delete(branchKey);
    }
  }

  return record;
}
