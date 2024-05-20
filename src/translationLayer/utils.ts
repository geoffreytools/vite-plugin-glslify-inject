export { Vec, Mat, matchDeclarationsFactory }

const Vec = <T>(length: number, val: T,) =>
    `[${ Array.from({length}, () => val).join(', ') }]`;

const Mat = (length: number) =>
    `[${ Array.from({length}, () => Vec(length, 'number')).join(', ') }]`;

const matchDeclarationsFactory = <T>(reg: RegExp) => (code: string) =>
    Array.from(code.matchAll(reg))
        .map(([,, type, name]) => [type, name]) as unknown as T[]