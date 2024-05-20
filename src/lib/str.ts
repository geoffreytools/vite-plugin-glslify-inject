export { mapJoin, curlyInline, parenInline, curlyPad, options, capitalize, listJoin, displayName };

export type { Showable };

import { flow } from "./fn.js";
import { basename } from 'node:path'

type Falsy = false | 0 | null | undefined;

type Showable = string | number | bigint | boolean | null | undefined;

const wrap = (a: string, c: string) => (b: Showable) => a + b + c;
const curlyWrap = wrap('{ ', ' }');
const parenWrap = wrap('(', ')');

const mapJoin = <T>(f: (a: T) => Showable, sep: string) => (a: T[]) =>
    a.filter(Boolean).map(f).join(sep);

const listJoin = (sep: string) => (a: Array<Showable | Falsy>) =>
    a.filter(Boolean).join(sep);

const curlyInline = flow(listJoin(', '), curlyWrap);
const parenInline = flow(listJoin(', '), parenWrap);
const options = flow(listJoin('|'), parenWrap);
const curlyPad = flow(mapJoin(a => `    ${a}`, '\n'), wrap('{\n', '\n}'));

const capitalize = (a: string) => a[0].toUpperCase() + a.substring(1);
const displayName = (path: string) => basename(path).split('.')[0];