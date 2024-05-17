export { transform };

// @ts-expect-error: types unavailable
import { compile } from 'glslify';

const transform = (code: string, basedir?: string) => {
    const compiled = compile(code, { basedir });

    return [
        `export { text as default, text, inject };`,
        `import { injectConstants } from 'vite-plugin-glslify-inject/inject';`,
        `const text = ${JSON.stringify(compiled)};`,
        `const inject = injectConstants(text);`
    ].join('\n');
}