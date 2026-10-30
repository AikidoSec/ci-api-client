import { promises as fs } from 'node:fs';
import path from 'node:path';
export async function loadSourceLineFixes(repositoryRoot, sourcePath) {
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
        const stats = await fs.lstat(target);
        if (stats.isSymbolicLink() || !stats.isFile()) {
            return null;
        }
        const content = await fs.readFile(target, 'utf8');
        const lineCount = content.split(/\r?\n/).length;
        return { eof: lineCount };
    }
    catch {
        return null;
    }
}
export function applySourceLineFixes(record, lineFixes) {
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
