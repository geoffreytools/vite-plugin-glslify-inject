export { mapJoin, curlyInline, parenInline, squareInline, curlyPad, options, capitalize, listJoin, displayName, unwrap };

export type { Showable };

import { flow, pipe } from "./fn.js";
import { basename } from 'node:path'

type Falsy = false | 0 | null | undefined;

type Showable = string | number | bigint | boolean | null | undefined;

const unwrap = (a: string) => a.substring(1, a.length-1);
const wrap = (a: string, c: string) => (b: Showable) =>
    b === undefined ? b : a + b + c;
const curlyWrap = wrap('{ ', ' }');
const parenWrap = wrap('(', ')');
const squareWrap = wrap('[', ']');

const mapJoin = <T>(f: (a: T) => Showable, sep: string) => (a: T[]) =>
    a.filter(Boolean).map(f).join(sep);

const listJoin = (sep: string) => (a: Array<Showable | Falsy>) =>
    a.filter(Boolean).join(sep);

const curlyInline = flow(listJoin(', '), curlyWrap);
const parenInline = flow(listJoin(', '), parenWrap);
const squareInline = flow(listJoin(', '), squareWrap);
const options = flow(listJoin('|'), parenWrap);
const curlyPad = (lines: Showable[], sep: string = '', rep = 1) => pipe(
    lines,
    mapJoin(a => '    '.repeat(rep) + a, sep + '\n'),
    wrap('{\n', '\n'+ '    '.repeat(rep - 1) + '}')
);

const capitalize = (a: string) => a[0].toUpperCase() + a.substring(1);
const displayName = (path: string) => basename(path).split('.')[0];