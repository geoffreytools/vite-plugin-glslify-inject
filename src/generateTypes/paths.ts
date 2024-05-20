export { resolveAliasConfig, getModuleId, AliasMap};

import { AliasOptions } from 'vite'

type AliasMap = Record<string, string>;

const resolveAliasConfig = (aliasConfig: AliasOptions): AliasMap => (
    !Array.isArray(aliasConfig) ? aliasConfig as AliasMap
    : Object.fromEntries(
        aliasConfig.flatMap(({ find, replacement }) =>
            typeof find === 'string' ? [[find, replacement]] as const : [])
    )
);

const getModuleId = (localPath: string, alias: string, path: string) =>
    alias + '/' + normalisePath(path).split(localPath)[1];

const normalisePath = (path: string) => path.replace(/\\/g, '/');