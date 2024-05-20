export {
    dual,
    flow
};

type Fn = (...args: any[]) => any;
type Arity<F extends Fn> = Parameters<F>["length"];

const dual = <L extends Fn, F extends Fn>(arity: (2 | 3) & Arity<F>, f: F): L & F => (
    arity === 2 ? (a, b) => b !== undefined ? f(a, b) : (data: any) => f(data, a)
    : (a, b, c) => c !== undefined ? f(a, b, c) : (data: any) => f(data, a, b)
) as L & F;


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
    <A, B, C, D, E, F, G>(
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E,
        j: (e: E) => F,
        k: (f: F) => G
    ): (a: A) => G
    <A, B, C, D, E, F, G, H>(
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E,
        j: (e: E) => F,
        k: (f: F) => G,
        l: (g: G) => H
    ): (a: A) => H
    <A, B, C, D, E, F, G, H, I>(
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E,
        j: (e: E) => F,
        k: (f: F) => G,
        l: (g: G) => H,
        m: (h: H) => I
    ): (a: A) => I
    <A, B, C, D, E, F, G, H, I, J>(
        f: (a: A) => B,
        g: (b: B) => C,
        h: (c: C) => D,
        i: (d: D) => E,
        j: (e: E) => F,
        k: (f: F) => G,
        l: (g: G) => H,
        m: (h: H) => I,
        n: (i: I) => J
    ): (a: A) => J
} = (f?: Fn, g?: Fn, h?: Fn, i?: Fn, j?: Fn, k?: Fn, l?: Fn, m?: Fn, n?: Fn) => (a: any) =>
    !f ? a
    : !g ? f!(a)
    : !h ? g!(f!(a))
    : !i ? h!(g!(f!(a)))
    : !j ? i!(h!(g!(f!(a))))
    : !k ? j!(i!(h!(g!(f!(a)))))
    : !l ? k!(j!(i!(h!(g!(f!(a))))))
    : !m ? l!(k!(j!(i!(h!(g!(f!(a)))))))
    : !n ? m!(l!(k!(j!(i!(h!(g!(f!(a))))))))
    : n!(m!(l!(k!(j!(i!(h!(g!(f!(a)))))))));