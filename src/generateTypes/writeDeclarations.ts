import { writeFile, readFile, unlink } from 'node:fs/promises';
import { listFiles } from "./listFiles.js"
import { getModuleDeclaration } from './moduleDeclaration.js';
import { getModuleId } from './paths.js';

export { readSource, writeDeclarations, removeDeclaration, updateDeclaration };

const writeDeclarations = (
    baseDir: string,
    localPath: string,
    alias: string,
    filter: (a: string) => boolean
) => listFiles(baseDir).then(paths => {
    const candidates = paths.filter(filter).map(path => {
        const moduleId = getModuleId(localPath, alias, path);
        return readSource(path).then(code =>[path, moduleId, code])
    });
    Promise.allSettled(candidates).then(matchAll(
        ([path, moduleId, code]) => writeDeclaration(path, moduleId)(code),
        console.error
    ))
});

const matchAll = <T, U>(
    onSuccess: (value: T) => U,
    onError: (reason: unknown) => void
) => (results: Array<PromiseSettledResult<T>>) => (
    results.forEach(result =>
        result.status === 'fulfilled'
        ? onSuccess(result.value) 
        : onError(result.reason)
    )
);
        
const readSource = (path: string) => (
    readFile(path).then(buffer => buffer.toString())
);

const writeDeclaration = (path: string, moduleId: string) => (code: string) => {
    const moduleDeclaration = getModuleDeclaration(code, moduleId);
    writeFile(path + '.d.ts', moduleDeclaration);
};

const updateDeclaration = (localPath: string, alias: string) => (path: string) => {
    if(path.endsWith('.d.ts')) return;
    const moduleId = getModuleId(localPath, alias, path);
    readSource(path).then(writeDeclaration(path, moduleId));
};

const removeDeclaration = (path: string) => {
    if(path.endsWith('.d.ts')) return;
    unlink(path + '.d.ts');
};