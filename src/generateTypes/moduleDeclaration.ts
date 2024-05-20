export { getModuleDeclaration, renderModuleDeclaration };

import { curlyPad, curlyInline, displayName } from '@lib/str.js';
import * as constants from '../translationLayer/constants.js';

const getModuleDeclaration = (code: string, moduleId: string): string => {
    const matches = constants.matchDeclarations(code)
        .map(([type, name]) => `${name}?: ${constants.constructType(type)}`)     
    
    return renderModuleDeclaration(moduleId, matches);
};

const renderModuleDeclaration = (moduleId: string, constants: string[]) => {
    const name = displayName(moduleId);

    const declarations = [
        `const ${name}: string;`,
        renderConstDeclaration(constants),
        renderExportDeclaration(name, constants)
    ];

    return `declare module '${moduleId}' ${curlyPad(declarations)}`
};

const renderConstDeclaration = (args: string[]) =>
    args.length && `const inject: (map: ${curlyInline(args)}) => string;`;

const renderExportDeclaration  = (
    name: string,
    constants: string[],
) => 'export ' + curlyInline([
    `${name} as default`,
    constants.length && name,
    constants.length && 'inject',
]) + ';'