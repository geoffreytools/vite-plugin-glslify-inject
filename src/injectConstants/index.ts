export { injectConstants };

import { replaceDeclaration, constructValue, UserTypes } from '../translationLayer.js';

const injectConstants = (shader: string) => (values: Record<string, UserTypes>) => (
    !values ? shader
    : replaceDeclaration(shader, (original, leftpad, type, name) =>
        values[name] === undefined ? original
        : `${leftpad}const ${type} ${name} = ${constructValue(values[name], type)};`
    )
);