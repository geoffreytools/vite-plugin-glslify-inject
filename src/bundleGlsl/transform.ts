export { transform };

// @ts-expect-error: types unavailable
import { compile } from 'glslify';
import { dirname } from 'node:path'
import { listJoin, displayName, curlyDynamic } from '#lib/str.js';

const transform = (code: string, path: string) => {
    const basedir = dirname(path);
    const name = displayName(path);
    const compiled = compile(code, { basedir });

    return listJoin('\n')([
        renderExportDeclaration(name),
        `import { injectConstants } from 'vite-plugin-glslify-inject/injectConstants';`,
        `const ${name} = ${JSON.stringify(compiled)};`,
        `const inject = injectConstants(${name});`
    ]);
}

const renderExportDeclaration = (name: string) => {
    const lines = [
        `${name} as default`,
        `${name} as glsl`,
        name,
        'inject',
        `inject as ${name}With`
    ].filter(Boolean);

    return `export ${curlyDynamic(lines, 2)};`
}