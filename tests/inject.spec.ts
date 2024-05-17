import { injectConstants } from '../src/inject'

describe('Given an int', () => {
    const shader =`const int val = 0;`;

    test('inject a float', () => {
        const up = `const int val = 3;`;
        const down = `const int val = 2;`;
        
        expect(injectConstants(shader)({ val: 2.5 })).toBe(up);
        expect(injectConstants(shader)({ val: 2.3 })).toBe(down);
    })

    test('inject an int', () => {
        const out = `const int val = 2;`;

        expect(injectConstants(shader)({ val: 2 })).toBe(out);
    })
})

describe('Given a float', () => {
    const shader = `const float val = 0.0;`;

    test('inject a float', () => {
        const out = `const float val = 2.5;`;

        expect(injectConstants(shader)({ val: 2.5 })).toBe(out);
    })

    test('inject an int', () => {
        const out = `const float val = 2.0;`;

        expect(injectConstants(shader)({ val: 2 })).toBe(out);
    })
})