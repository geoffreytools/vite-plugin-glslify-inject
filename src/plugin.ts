export { plugin as default };

import path from 'node:path';
import { Plugin } from 'vite'
import { FilterPattern, createFilter } from '@rollup/pluginutils';
import { transform } from './bundleGlsl/transform.js';
import { resolveAliasConfig } from './generateTypes/paths.js';
import { writeDeclarations, removeDeclaration, updateDeclaration } from './generateTypes/writeDeclarations.js';
import THREE from './translationLayer/THREE.js';
import { Library } from './translationLayer/uniforms.js';

type Options = {
    include?: FilterPattern,
    exclude?: FilterPattern,
    types?: { alias: string, library?: Library | 'threejs', uniforms?: boolean }
};

const plugin = ({ include, exclude, types }: Options = {}): Plugin => {
    const filter = createFilter(include || [/\.vert$/, /\.frag$/], exclude);
    const library = types?.library === 'threejs' ? THREE : types?.library;

    return {
        name: 'vite-plugin-glslify-inject',
        configureServer(server) {
            const alias = types?.alias;
            const generateDeclarations = !!alias;

            if(generateDeclarations) {
                const aliasMap = resolveAliasConfig(server.config.resolve.alias);
                const baseDir = path.join(server.config.root, aliasMap[alias]);
                const deps = [aliasMap[alias], alias, filter, library, types?.uniforms] as const;

                writeDeclarations(baseDir, ...deps);

                server.watcher.on('change', updateDeclaration(...deps));
                server.watcher.on('add', updateDeclaration(...deps));
                server.watcher.on('unlink', removeDeclaration(filter));
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