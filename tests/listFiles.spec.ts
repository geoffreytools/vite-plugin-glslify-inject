import { listFiles } from "../src/generateTypes/listFiles";
import { join, sep } from 'node:path';

const dir = join(__dirname, 'directory');

const cleanupPaths = (paths: string[]) => (
    paths.map(path => path.replace(dir + sep, ''))
);

describe('recursively list files in a directory', () => {
    test('all files', () => {
        return listFiles(dir)
            .then(cleanupPaths)
            .then(paths => expect(paths).toEqual([
                "bar.vert",
                "foo.frag",
                `lib${sep}bibi.glsl`,
                `lib${sep}bobo.glsl`,
                `lib${sep}bubu.glsl`,
            ]))
    })

    test('.glsl only', () => {
        return listFiles(dir,['.glsl'])
            .then(cleanupPaths)
            .then(paths => expect(paths).toEqual([
                `lib${sep}bibi.glsl`,
                `lib${sep}bobo.glsl`,
                `lib${sep}bubu.glsl`,
            ]))
    })

    test('.frag and .vert only', () => {
        return listFiles(dir, ['.frag', '.vert'])
            .then(cleanupPaths)
            .then(paths => expect(paths).toEqual([
                "bar.vert",
                "foo.frag",
            ]))
    })
})