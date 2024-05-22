export { matchDeclarations, constructType };
export type { Keys, Library };

import { listJoin, squareInline, unwrap } from '#lib/str.js';
import { groupBy, repeat } from '#lib/list.js';
import { flow, pipe } from '#lib/fn.js';
import { Vec } from './utils.js';

const constructType = (type: Keys, length: number, lib: Library) => {
    if (!(type in nativeTypes)) throw TypeError(`type ${type} is not supported`);

    const libraryTypes = lib.types?.[type]?.map(type =>
        typeof type === 'string' ? type
        : `${lib.namespace ? (lib.namespace + '.') : ''}${type.alias}`
    ) || [];

    if (!length) return listJoin(' | ')([...nativeTypes[type], ...libraryTypes]);

    const { standalone=[], repeatable=[] } = groupBy(nativeTypes[type], splitByRepeatability);
    
    const { tuple=[], naked=[] } = groupBy(repeatable, splitByTupleness);

    const wrappedNativeTuple = lib.nesting ? tuple.map(tupleRepeat(length)) : [];
    const flatennedNativeTuple = tuple.map(flow(unwrap, repeat(length), squareInline));
    const wrappedNativeNaked = naked.length && pipe(naked, listJoin(' | '), tupleRepeat(length));
    const wrappedLib = lib.nesting ? libraryTypes.map(tupleRepeat(length)) : [] ;

    return listJoin(' | ')([
        wrappedNativeNaked,
        ...flatennedNativeTuple,
        ...standalone,
        ...wrappedNativeTuple,
        ...wrappedLib
    ]);
}

const tupleRepeat = (length: number) => flow(repeat(length)<string>, squareInline);

const splitByRepeatability = (a: string) => (
    ['Int32Array', 'Float32Array'].includes(a) ? 'standalone' : 'repeatable'
);

const splitByTupleness = (a: string) => (
    a.includes('[') ? 'tuple' : 'naked'
);

const nativeTypes = {
    bool: ['boolean', 'number'],
    uint: ['number'],
    int: ['number'],
    float: ['number'],

    bvec2: [Vec(2, 'number'), 'Int32Array'],
    bvec3: [Vec(3, 'number'), 'Int32Array'],
    bvec4: [Vec(4, 'number'), 'Int32Array'],

    ivec2: [Vec(2, 'number'), 'Int32Array'],
    ivec3: [Vec(3, 'number'), 'Int32Array'],
    ivec4: [Vec(4, 'number'), 'Int32Array'],

    vec2: [Vec(2, 'number'), 'Float32Array'],
    vec3: [Vec(3, 'number'), 'Float32Array'],
    vec4: [Vec(4, 'number'), 'Float32Array'],

    mat2: [Vec(2*2, 'number'), 'Float32Array'],
    mat3: [Vec(3*3, 'number'), 'Float32Array'],
    mat4: [Vec(4*4, 'number'), 'Float32Array'],

    sampler2D: ['WebGLTexture'],
    samplerCube: ['WebGLTexture'],
};

type Keys = keyof typeof nativeTypes;
const keys = Object.keys(nativeTypes) as Keys[];

const declaration = new RegExp(`^(\\s*)uniform (${keys.join('|')}) (\\w+?)(?:\\[(\\d)\\])*;`, 'gm');

type UniformMatches = [type: Keys, name: string, length: number];

const matchDeclarations = (code: string) =>
    Array.from(code.matchAll(declaration))
         .map(([,, type, name, length]) =>
            [type, name, length ? Number(length) : 0] as unknown as UniformMatches);

type Library = { namespace?: string, types?: { [K in Keys]?: LibraryType[] }, nesting?: boolean };

type LibraryType = string | { alias: string, type: string };