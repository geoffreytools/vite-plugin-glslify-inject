export { transform };

// @ts-expect-error: types unavailable
import { compile } from 'glslify';
import { dirname } from 'node:path'

const transform = (code: string, path?: string) => {
    const basedir = path ? dirname(path) : undefined;
    const compiled = compile(code, { basedir });

    return [
        `export { text as default, text, inject };`,
        `import { injectConstants } from 'vite-plugin-glslify-inject/injectConstants';`,
        `const text = ${JSON.stringify(compiled)};`,
        `const inject = injectConstants(text);`
    ].join('\n');
}