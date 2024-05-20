import { resolveAliasConfig, getModuleId } from "../src/generateTypes/paths";

test('convert alias config array representation to object', () => {
    const map = resolveAliasConfig([
        { find: 'foo', replacement: 'hello' },
        { find: 'bar', replacement: 'world' },
    ]);
    expect(map).toEqual({ foo: 'hello', bar: 'world' })
})

describe('get module id from path, alias config and alias', () => {
    const macro = (id: string) => expect(id).toBe('@shaders/colorize.frag');

    test('given a unix-like path', () => {
        macro(getModuleId(
            "/src/shaders/",
            '@shaders',
            'F:/codebases/project/src/shaders/colorize.frag'
        ))
    })

    test('given a windows-like path', () => {
        macro(getModuleId(
            "/src/shaders/",
            '@shaders',
            'F:\\codebases\\project\\src\\shaders\\colorize.frag'
        ))
    })
})