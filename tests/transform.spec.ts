import { transform } from "../src/bundleGlsl/transform";
import { readFile } from 'node:fs/promises';

test('transform', async () => {
    const entrypointPath = './tests/files/entrypoint.glsl';
    const entrypoint = await readFile(entrypointPath)
        .then(buffer => buffer.toString());
    
    const bundle = await readFile('./tests/files/bundle.js')
        .then(buffer => buffer.toString());

    const transformed = transform(entrypoint, entrypointPath);

    expect(transformed).toBe(bundle);
})

import { text, inject } from './files/bundle.js';

test('inject() injects variables', async () => {
    const bar = Math.round(Math.random() * 10);

    expect(inject({ bar })).toBe(text.replace(
        'const int bar = 0; // runtime',
        `const int bar = ${bar}; // runtime`
    ));
})