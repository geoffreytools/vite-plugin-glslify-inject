export { plugin as default };

import path from 'node:path';
import { Plugin } from 'vite'
import { FilterPattern, createFilter } from '@rollup/pluginutils';
import { transform } from './bundleGlsl/transform.js';
import { resolveAliasConfig } from './generateTypes/paths.js';
import { writeDeclarations, removeDeclaration, updateDeclaration } from './generateTypes/writeDeclarations.js';

type Options = {
    include?: FilterPattern,
    exclude?: FilterPattern,
    types?: { alias: string }
};

const plugin = ({ include, exclude, types }: Options = {}): Plugin => {
    const filter = createFilter(include || [/\.vert$/, /\.frag$/], exclude);

    return {
        name: 'vite-plugin-glslify-inject',
        configureServer(server) {
            const alias = types?.alias;
            const generateDeclarations = !!alias;

            if(generateDeclarations) {
                const aliasMap = resolveAliasConfig(server.config.resolve.alias);
                const localPath = aliasMap[alias]
                const baseDir = path.join(server.config.root, localPath);

                writeDeclarations(baseDir, localPath, alias, filter);

                server.watcher.on('change', updateDeclaration(localPath, alias));
                server.watcher.on('add', updateDeclaration(localPath, alias));
                server.watcher.on('unlink', removeDeclaration);
            }
        },
        transform (code, path) {
            if (filter(path)) return {
                code: transform(code, path)
            };
        },
        async handleHotUpdate (ctx) {
            const { read, file: path } = ctx;
            if (filter(path)) {
                const code = await read()
                ctx.read = async () => transform(code, path)
            }
        }
    };
}