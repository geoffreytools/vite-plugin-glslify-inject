export { listFiles };

import path from 'node:path'
import { readdir } from 'node:fs/promises';

const listFiles = (dirPath: string, extensions?: string[]): Promise<string[]> => (
    readdir(dirPath, { withFileTypes: true }).then(dirEntries =>
        Promise.all(dirEntries.map(entry => {
            const fullPath = path.join(dirPath, entry.name);
            return entry.isDirectory()
                ? listFiles(fullPath, extensions)
                : Promise.resolve(
                    matchExtensions(fullPath, extensions)
                    ? [fullPath] : []
                );
        })).then(x => x.flat())
    )
);

const matchExtensions = (path: string, extensions?: string[]) =>
    !extensions || extensions.some(ext => path.endsWith(ext))