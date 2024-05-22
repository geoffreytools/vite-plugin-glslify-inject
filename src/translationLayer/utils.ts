export { Vec, Mat }

const Vec = <T>(size: number, val: T,) =>
    `[${ Array.from({length: size}, () => val).join(', ') }]`;

const Mat = (size: number) =>
    `[${ Array.from({length: size}, () => Vec(size, 'number')).join(', ') }]`;