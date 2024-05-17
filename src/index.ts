import { Plugin } from 'vite'
import path from 'path'
import { FilterPattern, createFilter } from '@rollup/pluginutils';
import { transform } from './transform.js';

type Options = {
    include?: FilterPattern,
    exclude?: FilterPattern,
}

const extensions = [/\.vert$/, /\.frag$/, /\.glsl$/]

export default ({ include, exclude }: Options = {}): Plugin => {
    const filter = createFilter(include || extensions, exclude);
    
    return {
        name: 'vite-plugin-glslify-inject',
        transform (code, id) {
            console.log(path.dirname(id))
            if (filter(id)) return {
                code: transform(code, path.dirname(id))
            }
        },
        handleHotUpdate (ctx) {
            if (filter(ctx.file)) {
                const { read } = ctx;
                ctx.read = async () => {
                  return transform(await read(), path.dirname(ctx.file))
                }
            }
        }
    };
}
