export { groupBy, repeat };
export type { Tuple};

type Tuple <L extends number, T = unknown, R extends unknown[] = []> =
    number extends L ? T[]
    : R['length'] extends L ? R : Tuple<L, T, [T, ...R]>;

const groupBy = <A, B extends string>(self: Iterable<A>, f: (a: A) => B): { [K in B]?: A[] } => {
    const out: { [K in B]?: A[] } = {}
    for (const a of self) {
        const k = f(a)
        if (Object.hasOwn(out, k)) {
            out[k]!.push(a)
        } else {
            out[k] = [a]
        }
    }
    return out
}

const repeat = <L extends number>(length: L) => <A>(a: A) =>
    Array.from({length}, () => a) as Tuple<L, A>;