export { matchDeclarations, replaceDeclaration, constructValue, constructType, UserTypes };

import { Showable, options, parenInline } from '#lib/str.js';
import { Vec, Mat } from './utils.js';
import type { Tuple } from '#lib/list.js';

type ConstTypes = keyof TypesMap;
type UserTypes = TypesMap[ConstTypes];

type Size = 2 | 3 | 4;
type Bool = boolean;
type Int = number;
type Float = number;
type Mat<S extends number> = Vec<S, Vec<S, number>>;
type Vec<L extends number, T> = Tuple<L, T>;

type TypesMap = {
    bool: Bool,
    int: Int,
    float: Float,

    bvec2: Vec<2, Bool>,
    bvec3: Vec<3, Bool>,
    bvec4: Vec<4, Bool>,

    ivec2: Vec<2, Int>,
    ivec3: Vec<3, Int>,
    ivec4: Vec<4, Int>,

    vec2: Vec<2, Float>,
    vec3: Vec<3, Float>,
    vec4: Vec<4, Float>,

    mat2: Mat<2>,
    mat3: Mat<3>,
    mat4: Mat<4>
};

const constructType = (type: ConstTypes) => {
    if (type in typeConstructors) return typeConstructors[type as ConstTypes];
    throw TypeError(`type ${type} is not supported`)
}

const typeConstructors: Record<ConstTypes, string> = {
    bool: 'boolean',
    int: 'number',
    float: 'number',

    bvec2: Vec(2, 'boolean'),
    bvec3: Vec(3, 'boolean'),
    bvec4: Vec(4, 'boolean'),

    ivec2: Vec(2, 'number'),
    ivec3: Vec(3, 'number'),
    ivec4: Vec(4, 'number'),

    vec2: Vec(2, 'number'),
    vec3: Vec(3, 'number'),
    vec4: Vec(4, 'number'),

    mat2: Mat(2),
    mat3: Mat(3),
    mat4: Mat(4)
};

const constTypes = Object.keys(typeConstructors);

const constructValue = <K extends ConstTypes>(value: TypesMap[K], type: K): string =>
    valueConstructors[type](value);

const bool = String;

const int = (value: number) => String(Math.round(value));

const float = (value: number) => value % 1 === 0 ? `${value}.0` : String(value);

const vec = <I extends Size>(i: I) => (value: TypesMap[`vec${I}`]) =>
    nAryFn('vec', i, value.map(float));

const ivec = <I extends Size>(i: I) => (value: TypesMap[`ivec${I}`]) =>
    nAryFn('ivec', i, value.map(Math.round));

const bvec = <I extends Size>(i: I) => (value: TypesMap[`bvec${I}`]) =>
    nAryFn('bvec', i, value.map(String));

const mat = <I extends Size>(i: I) => (value: TypesMap[`mat${I}`]) =>
    nAryFn('mat', i, value.flatMap(row => row.map(float)));

const nAryFn = (name: string, i: Size, values: Showable[]) =>
    name + i + parenInline(values);

const valueConstructors = {
    bool: bool,
    int: int,
    float: float,

    bvec2: bvec(2),
    bvec3: bvec(3),
    bvec4: bvec(4),

    ivec2: ivec(2),
    ivec3: ivec(3),
    ivec4: ivec(4),

    vec2: vec(2),
    vec3: vec(3),
    vec4: vec(4),

    mat2: mat(2),
    mat3: mat(3),
    mat4: mat(4),
} as const;

const declaration = new RegExp(`^(\\s*)const ${options(constTypes)} (.+?) = .+?;`, 'gm');

type DeclarationMatches = [type: ConstTypes, name: string];

const matchDeclarations = (code: string) =>
    Array.from(code.matchAll(declaration))
         .map(([,, type, name]) =>
            [type, name] as unknown as DeclarationMatches);

const replaceDeclaration = (
    code: string,
    replaceCallback: (...args: [original: string, leftpad: string, ...DeclarationMatches]) => string
) => code.replace(declaration, replaceCallback)