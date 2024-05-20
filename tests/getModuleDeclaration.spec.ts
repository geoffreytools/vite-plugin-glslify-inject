import { readFile } from 'node:fs/promises';
import { getModuleDeclaration, renderModuleDeclaration } from '../src/generateTypes/moduleDeclaration';

test('get module declaration from file', async () => {
    const bundle = await readFile('./tests/files/entrypoint.glsl')
        .then(buffer => buffer.toString());

    expect(getModuleDeclaration(bundle, '@shaders/file.glsl'))
        .toBe(renderModuleDeclaration('@shaders/file.glsl', ['bar?: number']))
})

describe('types', () => {
    const macro = (input: string, args: string[]) =>
        expect(getModuleDeclaration(input, '@shaders/file.glsl'))
            .toBe(renderModuleDeclaration('@shaders/file.glsl', args));
        
    test('bool', async () => macro(
        'const bool bar = true;',
        ['bar?: boolean']
    ))
    
    test('int', async () => macro(
        'const int bar = 0;',
        ['bar?: number']
    ))

    test('float', async () => macro(
        'const float bar = 0.0;',
        ['bar?: number']
    ))

    test('boolean vector', async () => {
        macro(
            'const bvec2 bar = vec2(true);',
            ['bar?: [boolean, boolean]']
        );

        macro(
            'const bvec3 bar = vec3(true);',
            ['bar?: [boolean, boolean, boolean]']
        );
        macro(
            'const bvec4 bar = vec4(true);',
            ['bar?: [boolean, boolean, boolean, boolean]']
        );
    })

    test('int vector', async () => {
        macro(
            'const ivec2 bar = ivec2(0);',
            ['bar?: [number, number]']
        );

        macro(
            'const ivec3 bar = ivec3(0);',
            ['bar?: [number, number, number]']
        );
        macro(
            'const ivec4 bar = ivec4(0);',
            ['bar?: [number, number, number, number]']
        );
    })

    test('float vector', async () => {
        macro(
            'const vec2 bar = vec2(0.0);',
            ['bar?: [number, number]']
        );

        macro(
            'const vec3 bar = vec3(0.0);',
            ['bar?: [number, number, number]']
        );
        macro(
            'const vec4 bar = vec4(0.0);',
            ['bar?: [number, number, number, number]']
        );
    })


    test('matrix', async () => {
        macro(
            'const mat2 bar = mat2(0.0);',
            ['bar?: [[number, number], [number, number]]']
        )

        macro(
            'const mat3 bar = mat3(0.0);',
            ['bar?: [[number, number, number], [number, number, number], [number, number, number]]']
        )

        macro(
            'const mat4 bar = mat4(0.0);',
            ['bar?: [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]]']
        )
    })
})

test('`inject` is included when constants are found', () => {
    const glsl = 'const vec2 bar = vec2(0.0);';

    const declaration = `declare module 'foo' {\n${[
        '    const text: string;',
        '    const inject: (map: { bar?: [number, number] }) => string;',
        '    export { text as default, text, inject };'
    ].join('\n')}\n}`;

    expect(getModuleDeclaration(glsl, 'foo')).toBe(declaration)
})

test('`inject` is not included when no constants are found', () => {
    const glsl = `
        precision highp float;

        float foo(vec3 normal) {
            return dot(vec3(0, 1, 0), normal);
        }
    `;

    const declaration = `declare module 'foo' {\n${[
        '    const text: string;',
        '    export { text as default };'
    ].join('\n')}\n}`;

    expect(getModuleDeclaration(glsl, 'foo')).toBe(declaration)
})