import { injectConstants } from '../src/injectConstants'

test('inject one constant out of 2', () => {
    const shader = `
        const int foo = 0;
        const vec2 bar = vec2(0);
    `;

    const out = `
        const int foo = 2;
        const vec2 bar = vec2(0);
    `;
    
    expect(injectConstants(shader)({ foo: 2 })).toBe(out);
})

test('inject a bool', () => {
    const shader = `const bool val = true;`;
    const out = `const bool val = false;`;
    
    expect(injectConstants(shader)({ val: false })).toBe(out);
})

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

test('inject a bvec2', () => {
    const shader = `const bvec2 val = bvec2(true);`;
    const out = `const bvec2 val = bvec2(true, false);`;

    expect(injectConstants(shader)({ val: [true, false] })).toBe(out);
})

test('inject a bvec3', () => {
    const shader = `const bvec3 val = bvec3(true);`;
    const out = `const bvec3 val = bvec3(true, false, true);`;

    expect(injectConstants(shader)({ val: [true, false, true] })).toBe(out);
})

test('inject a bvec4', () => {
    const shader = `const bvec4 val = bvec4(true);`;
    const out = `const bvec4 val = bvec4(true, false, true, false);`;

    expect(injectConstants(shader)({ val: [true, false, true, false] })).toBe(out);
})

describe('Given a ivec2', () => {
    const shader = `const ivec2 val = ivec2(0);`;

    test('inject a float tuple', () => {
        const out = `const ivec2 val = ivec2(2, 4);`;

        expect(injectConstants(shader)({ val: [2.3, 3.5] })).toBe(out);
    })

    test('inject an int tuple', () => {
        const out = `const ivec2 val = ivec2(2, 3);`;

        expect(injectConstants(shader)({ val: [2, 3] })).toBe(out);
    })
})

describe('Given a ivec3', () => {
    const shader = `const ivec3 val = ivec3(0);`;

    test('inject a float tuple', () => {
        const out = `const ivec3 val = ivec3(2, 4, 5);`;

        expect(injectConstants(shader)({ val: [2.3, 3.5, 4.5] })).toBe(out);
    })

    test('inject an int tuple', () => {
        const out = `const ivec3 val = ivec3(2, 3, 4);`;

        expect(injectConstants(shader)({ val: [2, 3, 4] })).toBe(out);
    })
})

describe('Given a ivec4', () => {
    const shader = `const ivec4 val = ivec4(0);`;

    test('inject a float tuple', () => {
        const out = `const ivec4 val = ivec4(2, 4, 5, 6);`;

        expect(injectConstants(shader)({ val: [2.3, 3.5, 4.5, 5.5] })).toBe(out);
    })

    test('inject an int tuple', () => {
        const out = `const ivec4 val = ivec4(2, 3, 4, 5);`;

        expect(injectConstants(shader)({ val: [2, 3, 4, 5] })).toBe(out);
    })
})

describe('Given a vec2', () => {
    const shader = `const vec2 val = vec2(0.0);`;

    test('inject a float tuple', () => {
        const out = `const vec2 val = vec2(2.5, 3.5);`;

        expect(injectConstants(shader)({ val: [2.5, 3.5] })).toBe(out);
    })

    test('inject an int tuple', () => {
        const out = `const vec2 val = vec2(2.0, 3.0);`;

        expect(injectConstants(shader)({ val: [2, 3] })).toBe(out);
    })
})

describe('Given a vec3', () => {
    const shader = `const vec3 val = vec3(0.0);`;

    test('inject a float tuple', () => {
        const out = `const vec3 val = vec3(2.5, 3.5, 4.5);`;

        expect(injectConstants(shader)({ val: [2.5, 3.5, 4.5] })).toBe(out);
    })

    test('inject an int tuple', () => {
        const out = `const vec3 val = vec3(2.0, 3.0, 4.0);`;

        expect(injectConstants(shader)({ val: [2, 3, 4] })).toBe(out);
    })
})

describe('Given a vec4', () => {
    const shader = `const vec4 val = vec4(0.0);`;

    test('inject a float tuple', () => {
        const out = `const vec4 val = vec4(2.5, 3.5, 4.5, 5.5);`;

        expect(injectConstants(shader)({ val: [2.5, 3.5, 4.5, 5.5] })).toBe(out);
    })

    test('inject an int tuple', () => {
        const out = `const vec4 val = vec4(2.0, 3.0, 4.0, 5.0);`;

        expect(injectConstants(shader)({ val: [2, 3, 4, 5] })).toBe(out);
    })
})

describe('Given a mat2', () => {
    const shader = `const mat2 val = mat2(0.0);`;

    test('inject a float nested tuple', () => {
        const out = `const mat2 val = mat2(2.5, 3.5, 4.5, 5.5);`;
    
        expect(injectConstants(shader)({ val: [[2.5, 3.5], [4.5, 5.5]] })).toBe(out);
    })

    test('inject an int nested tuple', () => {
        const out = `const mat2 val = mat2(2.0, 3.0, 4.0, 5.0);`;
    
        expect(injectConstants(shader)({ val: [[2, 3], [4, 5]] })).toBe(out);
    })
})

describe('Given a mat3', () => {
    const shader = `const mat3 val = mat3(0.0);`;

    test('inject a float nested tuple', () => {
        const out = `const mat3 val = mat3(2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5);`;
    
        expect(injectConstants(shader)({ val: [[2.5, 3.5, 4.5], [5.5, 6.5, 7.5], [8.5, 9.5, 10.5]] })).toBe(out);
    })


    test('inject an int nested tuple', () => {
        const out = `const mat3 val = mat3(2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0);`;
    
        expect(injectConstants(shader)({ val: [[2, 3, 4], [5, 6, 7], [8, 9, 10]] })).toBe(out);
    })
})

describe('Given a mat4', () => {
    const shader = `const mat4 val = mat4(0.0);`;

    test('inject a float nested tuple', () => {

        const out = `const mat4 val = mat4(2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5, 16.5, 17.5);`;
    
        expect(injectConstants(shader)({ val: [[2.5, 3.5, 4.5, 5.5], [6.5, 7.5, 8.5, 9.5], [10.5, 11.5, 12.5, 13.5], [14.5, 15.5, 16.5, 17.5]] })).toBe(out);
    })

    test('inject an int nested tuple', () => {
        const out = `const mat4 val = mat4(2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0);`;
    
        expect(injectConstants(shader)({ val: [[2, 3, 4, 5], [6, 7, 8, 9], [10, 11, 12, 13], [14, 15, 16, 17]] })).toBe(out);
    })
})
