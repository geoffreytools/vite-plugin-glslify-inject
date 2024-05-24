import { readFile } from 'node:fs/promises';
import { getModuleDeclaration, renderModuleDeclaration } from '../src/generateTypes/moduleDeclaration';
import THREE from '../src/translationLayer/THREE';
import { curlyPad } from '../src/lib/str';

const shaderName = 'foo';
const alias = '@shaders';
const moduleId = `${alias}/${shaderName}.glsl`;

const normaliseTitle = (input: string) =>
    input.split('\n').map(x =>x.trim()).join(' ');

const testConstants = (input: string, constants: string[]) => test(
    normaliseTitle(input),
    () => expect(getModuleDeclaration(input, moduleId))
        .toBe(renderModuleDeclaration(moduleId, constants))
);

const testNative = (input: string, uniforms: string[]) => test(
    normaliseTitle(input),
    () => expect(getModuleDeclaration(input, moduleId))
        .toBe(renderModuleDeclaration(moduleId, [], uniforms))
);

const testWithCustom = (input: string, uniforms: string[]) => test(
    normaliseTitle(input),
    () => expect(getModuleDeclaration(input, moduleId, {
        types: { vec2: ['{ x: number, y: number, isVector2: true }']}
    })).toBe(
        renderModuleDeclaration(moduleId, [], uniforms)
    )
);

const testWithTHREE = (input: string, uniforms: string[], aliasMap?: string[]) => test(
    normaliseTitle(input),
    () => expect(getModuleDeclaration(input, moduleId, THREE))
        .toBe(renderModuleDeclaration(moduleId, [], uniforms, (
            !!aliasMap && `namespace THREE ${curlyPad(aliasMap, '', 2)}`
        )))
);

test('get module declaration from file', async () => {
    const bundle = await readFile('./tests/files/entrypoint.glsl')
        .then(buffer => buffer.toString());

    expect(getModuleDeclaration(bundle, moduleId))
        .toBe(renderModuleDeclaration(moduleId, ['bar?: number']))
})


describe('constants', () => {
    describe('naked types', () => {
        testConstants(
            'const bool bar = true;',
            ['bar?: boolean']
        )

        testConstants(
            'const int bar = 0;',
            ['bar?: number']
        )
    
        testConstants(
            'const float bar = 0.0;',
            ['bar?: number']
        )
    })
    

    describe('boolean vector', () => {
        testConstants(
            'const bvec2 bar = vec2(true);',
            ['bar?: [boolean, boolean]']
        );

        testConstants(
            'const bvec3 bar = vec3(true);',
            ['bar?: [boolean, boolean, boolean]']
        );
        testConstants(
            'const bvec4 bar = vec4(true);',
            ['bar?: [boolean, boolean, boolean, boolean]']
        );
    })

    describe('int vector', () => {
        testConstants(
            'const ivec2 bar = ivec2(0);',
            ['bar?: [number, number]']
        );

        testConstants(
            'const ivec3 bar = ivec3(0);',
            ['bar?: [number, number, number]']
        );
        testConstants(
            'const ivec4 bar = ivec4(0);',
            ['bar?: [number, number, number, number]']
        );
    })

    describe('float vector', () => {
        testConstants(
            'const vec2 bar = vec2(0.0);',
            ['bar?: [number, number]']
        );

        testConstants(
            'const vec3 bar = vec3(0.0);',
            ['bar?: [number, number, number]']
        );
        testConstants(
            'const vec4 bar = vec4(0.0);',
            ['bar?: [number, number, number, number]']
        );
    })


    describe('matrix', () => {
        testConstants(
            'const mat2 bar = mat2(0.0);',
            ['bar?: [[number, number], [number, number]]']
        )

        testConstants(
            'const mat3 bar = mat3(0.0);',
            ['bar?: [[number, number, number], [number, number, number], [number, number, number]]']
        )

        testConstants(
            'const mat4 bar = mat4(0.0);',
            ['bar?: [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]]']
        )
    })
})

test('`inject` is included when constants are found', () => {
    const glsl = 'const vec2 bar = vec2(0.0);';

    const declaration = `declare module '${moduleId}' {\n${[
        `    const ${shaderName}: string;`,
        '',
        '    const inject: (map: { bar?: [number, number] }) => string;',
        '',
        '    export {',
        `        ${shaderName} as default,`,
        `        ${shaderName} as glsl,`,
        `        ${shaderName},`,
        `        inject,`,
        `        inject as ${shaderName}With`,
        '    };'
    ].join('\n')}\n}`;

    expect(getModuleDeclaration(glsl, moduleId)).toBe(declaration)
})

test('`inject` is not included when no constants are found', () => {
    const glsl = `
        precision highp float;

        float foo(vec3 normal) {
            return dot(vec3(0, 1, 0), normal);
        }
    `;

    const declaration = `declare module '${moduleId}' {\n${[
        `    const ${shaderName}: string;`,
        '',
        `    export { ${shaderName} as default, ${shaderName} as glsl, ${shaderName} };`,
    ].join('\n')}\n}`

    expect(getModuleDeclaration(glsl, moduleId)).toBe(declaration)
})
    
describe('uniforms', () => {    
    describe('Native types', () => {
        describe('int', () => {
            testNative(
                `uniform int foo;`,
                ['foo: number']
            );

            testNative(
                `uniform int foo[3];`,
                ['foo: [number, number, number]']
            );
        })

        describe('uint', () => {
            testNative(
                `uniform uint foo;`,
                ['foo: number']
            );

            testNative(
                `uniform uint foo[3];`,
                ['foo: [number, number, number]']
            );
        })

        describe('float', () => {
            testNative(
                `uniform float foo;`,
                ['foo: number']
            );

            testNative(
                `uniform float foo[3];`,
                ['foo: [number, number, number]']
            );
        })

        describe('boolean', () => {
            testNative(
                `uniform bool foo;`,
                ['foo: boolean | number']
            );

            testNative(
                `uniform bool foo[3];`,
                ['foo: [boolean | number, boolean | number, boolean | number]']
            );
        })

        describe('int vector', () => {
            testNative(
                `uniform ivec2 foo;`,
                ['foo: [number, number] | Int32Array']
            );
    
            testNative(
                `uniform ivec3 foo;`,
                ['foo: [number, number, number] | Int32Array']
            );
    
            testNative(
                `uniform ivec4 foo;`,
                ['foo: [number, number, number, number] | Int32Array']
            );

            testNative(
                `uniform ivec2 foo[2];`,
                ['foo: [number, number, number, number] | Int32Array']
            );

            testNative(
                `uniform ivec3 foo[2];`,
                ['foo: [number, number, number, number, number, number] | Int32Array']
            );

            testNative(
                `uniform ivec4 foo[2];`,
                ['foo: [number, number, number, number, number, number, number, number] | Int32Array']
            );
        })
    
        describe('boolean vector', () => {
            testNative(
                `uniform bvec2 foo;`,
                ['foo: [number, number] | Int32Array']
            );
    
            testNative(
                `uniform bvec3 foo;`,
                ['foo: [number, number, number] | Int32Array']
            );
    
            testNative(
                `uniform bvec4 foo;`,
                ['foo: [number, number, number, number] | Int32Array']
            );
        })

        describe('matrix', () => {
            testNative(
                `uniform mat2 foo;`,
                ["foo: [number, number, number, number] | Float32Array"],
            );

            testNative(
                `uniform mat3 foo;`,
                ["foo: [number, number, number, number, number, number, number, number, number] | Float32Array"],
            );

            testNative(
                `uniform mat4 foo;`,
                ["foo: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array"],
            );

            testNative(
                `uniform mat2 foo[2];`,
                ["foo: [number, number, number, number, number, number, number, number] | Float32Array"],
            );

            testNative(
                `uniform mat3 foo[2];`,
                ["foo: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array"],
            );

            testNative(
                `uniform mat4 foo[2];`,
                ["foo: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array"],
            );
        })

        describe('dynamic array length', () => {
            testNative(
                `uniform int foo[bar];`,
                ['foo: Array<number>']
            );
    
            testNative(
                `uniform vec2 foo[bar];`,
                ['foo: Array<number> | Float32Array']
            );
    
            testNative(
                `uniform vec3 foo[bar];`,
                ['foo: Array<number> | Float32Array']
            );
        })
    })

    describe('custom types', () => {
        describe('inline', () => {
            describe('float vector', () => {
                testWithCustom(
                    `uniform vec2 foo;`,
                    ["foo: [number, number] | Float32Array | { x: number, y: number, isVector2: true }"]
                );
            })
        });

        describe('alias, no namespace', () => {
            const testWithCustomAlias = (input: string, uniforms: string[]) =>
                expect(getModuleDeclaration(input, moduleId, {
                    types: { vec2: [{ alias: 'Vec2', type: '{ x: number, y: number, isVector2: true }' }]}
                }))
                    .toBe(renderModuleDeclaration(moduleId, [], uniforms, (
                        'type Vec2 = { x: number, y: number, isVector2: true };'
                    )));
    
            test('float vector', () => {
                testWithCustomAlias(
                    `uniform vec2 foo;`,
                    ["foo: [number, number] | Float32Array | Vec2"]
                );
            })
        });
    })
    
    describe('threejs types', () => {
        const Vector2 = 'export type Vector2 = { x: number, y: number, isVector2: true };';
        const Vector3 = 'export type Vector3 = { x: number, y: number, z: number, isVector3: true };';
        const Color = 'export type Color = { r: number, g: number, b: number, isColor: true };';

        describe('namespace has no duplicates', () => {
            testWithTHREE(
                `
                    uniform vec2 foo;
                    uniform vec2 bar;
                `,
                [
                    "foo: [number, number] | Float32Array | THREE.Vector2",
                    "bar: [number, number] | Float32Array | THREE.Vector2"
                ],
                [Vector2]
            );
        })

        describe('float vector', () => {
            testWithTHREE(
                `uniform vec2 foo;`,
                ["foo: [number, number] | Float32Array | THREE.Vector2"],
                [Vector2]
            );
    
            testWithTHREE(
                `uniform vec3 foo;`,
                ["foo: [number, number, number] | Float32Array | THREE.Vector3 | THREE.Color"],
                [Vector3, Color]
            );

            testWithTHREE(
                `uniform vec3 foo[2];`,
                ["foo: [number, number, number, number, number, number] | Float32Array | [[number, number, number], [number, number, number]] | [THREE.Vector3, THREE.Vector3] | [THREE.Color, THREE.Color]"],
                [Vector3, Color]
            );
    
            testWithTHREE(
                `uniform vec4 foo;`,
                ["foo: [number, number, number, number] | Float32Array | THREE.Vector4 | THREE.Quaternion"],
                [
                    'export type Vector4 = { x: number, y: number, z: number, w: number, isVector4: true };',
                    'export type Quaternion = { x: number, y: number, z: number, w: number, isQuaternion: true };',
                ]
            );
        })

        describe('matrix', () => {
            testWithTHREE(
                `uniform mat2 foo;`,
                ['foo: [number, number, number, number] | Float32Array | [[number, number], [number, number]]'],
            );

            testWithTHREE(
                `uniform mat3 foo;`,
                ['foo: [number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number], [number, number, number], [number, number, number]] | THREE.Matrix3'],
                ['export type Matrix3 = { elements: number[], setFromMatrix4: unknown };']
            );

            testWithTHREE(
                `uniform mat4 foo;`,
                ['foo: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]] | THREE.Matrix4'],
                ['export type Matrix4 = { elements: number[], setFromMatrix3: unknown };']
            );

            testWithTHREE(
                `uniform mat2 foo[2];`,
                ['foo: [number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number, number], [number, number, number, number]] | [[[number, number], [number, number]], [[number, number], [number, number]]]'],
            );

            testWithTHREE(
                `uniform mat3 foo[2];`,
                ['foo: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number, number, number, number, number, number, number], [number, number, number, number, number, number, number, number, number]] | [[[number, number, number], [number, number, number], [number, number, number]], [[number, number, number], [number, number, number], [number, number, number]]] | [THREE.Matrix3, THREE.Matrix3]'],
                ['export type Matrix3 = { elements: number[], setFromMatrix4: unknown };']
            );

            testWithTHREE(
                `uniform mat4 foo[2];`,
                ['foo: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number], [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]] | [[[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]], [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]]] | [THREE.Matrix4, THREE.Matrix4]'],
                ['export type Matrix4 = { elements: number[], setFromMatrix3: unknown };']
            );
        })
        describe('dynamic array length', () => {
            testWithTHREE(
                `uniform vec2 foo[bar];`,
                ['foo: Array<number> | Float32Array | Array<[number, number]> | Array<THREE.Vector2>'],
                [Vector2]
            );

            testWithTHREE(
                `uniform vec3 foo[bar];`,
                ['foo: Array<number> | Float32Array | Array<[number, number, number]> | Array<THREE.Vector3> | Array<THREE.Color>'],
                [Vector3, Color]
            );
        })
    })
});