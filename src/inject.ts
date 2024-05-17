export { injectConstants }

type Types = typeof types[number];

const types = ['int', 'float'] as const;

const cast = (value: number, type: Types): string => (
    type === 'int' ? String(Math.round(value))
    : value % 1 === 0 ? `${value}.0`
    : String(value)
);

const injectConstants = (shader: string) => (map: Record<string, number>) => {
    if(!map) return shader;

    const variables = Object.keys(map);

    const declaration = new RegExp(
        `const (${types.join('|')}) (${variables.join("|")}) = .+?;`,
        'g'
    );

    return shader.replace(declaration, (_, type, name) => {
        const value = cast(map[name], type);

        return `const ${type} ${name} = ${value};`;
    });
};
