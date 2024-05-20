export { getModuleDeclaration, renderModuleDeclaration };

import { matchDeclarations, constructType } from '../translationLayer.js';

const getModuleDeclaration = (code: string, moduleId: string): string => {
    const matches = matchDeclarations(code)
        .map(([type, name]) => `${name}?: ${constructType(type)}`)     
    
    return renderModuleDeclaration(moduleId, matches);
};

const renderModuleDeclaration = (path: string, args: string[]) => {
    const lines = args.length ? [
        'const text: string;',
        `const inject: (map: { ${args.join(', ')} }) => string;`,
        'export { text as default, text, inject };',
    ] : [
        'const text: string;',
        'export { text as default };'
    ];

    return `declare module '${path}' {${format(lines)}}`
};

const format = (lines: string[]) =>
    '\n' + lines.map(padLeft).join('\n') + '\n';

const padLeft = (line: string) => `    ${line}`;