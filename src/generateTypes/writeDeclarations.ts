export { readSource, writeDeclarations, removeDeclaration, updateDeclaration };

import { writeFile, readFile, unlink } from 'node:fs/promises';
import { listFiles } from "./listFiles.js"
import { getModuleDeclaration } from './moduleDeclaration.js';
import { getModuleId } from './paths.js';
import { Library } from '../translationLayer/uniforms.js';

type Filter = (a: string) => boolean;

const writeDeclarations = (
    baseDir: string,
    localPath: string,
    alias: string,
    filter: Filter,
    library?: Library,
    uniforms?: boolean
) => listFiles(baseDir).then(paths => {
    const candidates = paths.filter(filter).map(path => {
        const moduleId = getModuleId(localPath, alias, path);
        return readSource(path).then(code =>[path, moduleId, code])
    });
    Promise.allSettled(candidates).then(matchAll(
        ([path, moduleId, code]) => writeDeclaration(path, moduleId, library, uniforms)(code),
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

const writeDeclaration = (path: string, moduleId: string, library?: Library, uniforms?: boolean) => (code: string) => {
    const moduleDeclaration = getModuleDeclaration(code, moduleId, library, uniforms);
    writeFile(path + '.d.ts', moduleDeclaration);
};

const updateDeclaration = (localPath: string, alias: string, filter: Filter, library?: Library, uniforms?: boolean) => (path: string) => {
    if(!filter(path) || path.endsWith('.d.ts')) return;
    const moduleId = getModuleId(localPath, alias, path);
    readSource(path).then(writeDeclaration(path, moduleId, library, uniforms));
};

const removeDeclaration = (filter: Filter) => (path: string) => {
    if(!filter(path) || path.endsWith('.d.ts')) return;
    unlink(path + '.d.ts');
};