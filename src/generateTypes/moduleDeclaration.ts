export { getModuleDeclaration, renderModuleDeclaration };

import { curlyPad, curlyInline, capitalize, displayName, listJoin, curlyDynamic, } from '#lib/str.js';
import * as Constants from '../translationLayer/constants.js';
import * as Uniforms from '../translationLayer/uniforms.js';

const getModuleDeclaration = (
    code: string,
    moduleId: string,
    library: Uniforms.Library = { namespace: undefined, types: {}, nesting: false },
    uniformsWasSet?: boolean
): string => {
    const generateUniforms = uniformsWasSet === undefined ? true : uniformsWasSet;

    const constants = Constants.matchDeclarations(code)
        .map(([type, name]) => `${name}?: ${Constants.constructType(type)}`);

    const init = { uniforms: [] as string[], keys: [] as Uniforms.Keys[] };
        
    const { uniforms, keys } = !generateUniforms ? init : Uniforms.matchDeclarations(code)
        .map(([type, name, length]) => [
            type, `${name}: ${Uniforms.constructType(type, length, library)}`
        ] as const)
        .reduce(
            (acc, [key, value]) => {
                acc.uniforms.push(value);
                acc.keys.push(key)
                return acc;
            },
            init
        );
    
    return listJoin('\n')([
        generateUniforms && renderTypeAliases(keys, library),
        renderModuleDeclaration(moduleId, constants, uniforms)
    ]);
};

const isAlias = (x: unknown): x is { alias: string, type: string } =>
        typeof x !== 'string';

const renderTypeAliases = (
    keys: Uniforms.Keys[],
    { types, namespace }: Uniforms.Library,
) => {
    const _types = Array.from(new Set(keys)).flatMap(key =>
        !types || !(key in types) ? []
        : types[key]!.filter(isAlias).map(({ alias, type }) =>`type ${alias} = ${type};`)
    );

    return _types.length && (
        namespace
        ? `namespace ${namespace} ${curlyPad(_types.map(x => `export ${x}`))}`
        : listJoin('\n')(_types)
    )
}

const renderModuleDeclaration = (
    moduleId: string,
    constants: string[] = [],
    uniforms: string[] = []
) => {
    const name = displayName(moduleId);

    const declarations = [
        `const ${name}: string;`,
        renderConstDeclaration(constants),
        renderUniformsDeclaration(name, uniforms),
        renderExportDeclaration(name, constants, uniforms)
    ];

    return `declare module '${moduleId}' ${curlyPad(declarations)}`
};

const renderConstDeclaration = (args: string[]) =>
    args.length && `const inject: (map: ${curlyInline(args)}) => string;`;

const renderUniformsDeclaration = (name: string, args: string[]) =>
    args.length && `type Uniforms = ${curlyPad(args, ',', 2)};`;

const renderExportDeclaration  = (
    name: string,
    constants: string[],
    uniforms: string[]
) => {
    const lines = [
        `${name} as default`,
        `${name} as glsl`,
        name,
        constants.length && 'inject',
        constants.length && `inject as ${name}With`,
        uniforms.length && `Uniforms`,
        uniforms.length && `Uniforms as ${capitalize(name)}Uniforms`
    ].filter(Boolean);

    return `export ${curlyDynamic(lines, 2)};`
}