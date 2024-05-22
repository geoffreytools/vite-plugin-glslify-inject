export { flow, pipe };

type Fn = (...args: any[]) => unknown;

const flow: {
    <A, B>(
        f: (a: A) => B
    ): (a: A) => B
    <A, B, C>(
        f: (a: A) => B,
        g: (b: B) => C
    ): (a: A) => C
    <A, B, C, D>(
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D
    ): (a: A) => D
    <A, B, C, D, E>(
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E
    ): (a: A) => E
    <A, B, C, D, E, F>(
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E,
        j: (e: E) => F
    ): (a: A) => F
} = (f?: Fn, g?: Fn, h?: Fn, i?: Fn, j?: Fn) => (a: any) =>
    !f ? a
    : !g ? f!(a)
    : !h ? g!(f!(a))
    : !i ? h!(g!(f!(a)))
    : !j ? i!(h!(g!(f!(a))))
    : j!(i!(h!(g!(f!(a)))));

const pipe: {
    <A, B>(
        a: A,
        f: (a: A) => B
    ): B
    <A, B, C>(
        a: A,
        f: (a: A) => B,
        g: (b: B) => C
    ): C
    <A, B, C, D>(
        a: A,
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D
    ): D
    <A, B, C, D, E>(
        a: A,
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E
    ): E
    <A, B, C, D, E, F>(
        a: A,
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E,
        j: (e: E) => F
    ): F
} = (a: any, f?: Fn, g?: Fn, h?: Fn, i?: Fn, j?: Fn) =>
    !f ? a
    : !g ? f!(a)
    : !h ? g!(f!(a))
    : !i ? h!(g!(f!(a)))
    : !j ? i!(h!(g!(f!(a))))
    : j!(i!(h!(g!(f!(a)))));