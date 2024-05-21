export { Vec, Mat, matchDeclarationsFactory, Size }

type Size = 2 | 3 | 4;

const Vec = <T>(size: Size, val: T,) =>
    `[${ Array.from({length: size}, () => val).join(', ') }]`;

const Mat = (size: Size) =>
    `[${ Array.from({length: size}, () => Vec(size, 'number')).join(', ') }]`;

const matchDeclarationsFactory = <T>(reg: RegExp) => (code: string) =>
    Array.from(code.matchAll(reg))
        .map(([,, type, name]) => [type, name]) as unknown as T[]