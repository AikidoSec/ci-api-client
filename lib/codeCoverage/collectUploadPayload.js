import { promises as fs } from 'node:fs';
import path from 'node:path';
import { validateFilePath } from './paths.js';
import { loadProjectFiles } from './projectFiles.js';
import { detectFormatFromFilename, extractCoveredSourcePaths, } from './reportPaths.js';
import { loadSourceLineFixes } from './sourceLineFixes.js';
export async function collectUploadPayload(filePaths) {
    if (filePaths.length === 0) {
        throw new Error('No code coverage file(s) provided. Specify at least one path.');
    }
    const project = await loadProjectFiles();
    if (!project || project.files.length === 0) {
        throw new Error('No source files found in this repository. ' +
            'Run this command from a checked-out repository before uploading coverage.');
    }
    const repositoryRoot = project.root;
    const files = [];
    const coveredPaths = new Set();
    for (const inputPath of filePaths) {
        validateFilePath(inputPath);
        const absolutePath = path.resolve(inputPath);
        const content = await fs.readFile(absolutePath, 'utf8');
        const format = detectFormatFromFilename(inputPath);
        for (const sourcePath of extractCoveredSourcePaths(content, format, repositoryRoot)) {
            coveredPaths.add(sourcePath);
        }
        files.push({
            filename: path.posix.basename(inputPath.replace(/\\/g, '/')),
            format,
            content,
        });
    }
    const eof = {};
    for (const sourcePath of coveredPaths) {
        const fixes = await loadSourceLineFixes(repositoryRoot, sourcePath);
        if (fixes?.eof != null) {
            eof[sourcePath] = fixes.eof;
        }
    }
    return {
        repository_source_paths: project.files,
        eof,
        files,
    };
}
