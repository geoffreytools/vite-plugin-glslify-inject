# vite-plugin-glslify-inject

- write GLSL in distinct files with the [glslify](https://github.com/glslify/glslify) module system;
- import them as ES6 modules;
- inject contants at runtime;
- compatible with linters such as [GLSL Lint](https://github.com/hsimpson/vscode-glsllint#shader-code-in-string-literals).

## How to install

```bash
npm install --save-dev vite-plugin-glslify-inject
```

In your `vite.config.js`

```typescript
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glslify-inject'

export default defineConfig({
    plugins: [
        glsl({
            include: './src/shaders/*',
            exclude: 'node_modules/**',
        })
    ]
})
```

If you are using Typescript, Add the following `.d.ts` file to your project
```typescript
type Inject = (map: Record<string, number>) => string;

declare module '*.vert' {
    const text: string;
    const inject: Inject
    export {text as default, text, inject };
}

declare module '*.frag' {
    const text: string;
    const inject: Inject
    export {text as default, text, inject };
}
```

## How to use
In this example we create a material that takes a grayscales texture and styles it with false colors.
```typescript
import passThrough from './shaders/passThrough.vert';
import * as falseColors from './shaders/falseColors.frag';

const gradient = ["#00178f", "#006172", "#47dd00"];
const steps = gradient.length;

const material = new THREE.RawShaderMaterial({
    uniforms: parseUniforms({ gradient, myTexture }),
    vertexShader: passThrough,
    fragmentShader: falseColors.inject({ steps })
});
```

### flaseColors.frag

We import the `interColor` util with a [glslify pragma](https://github.com/glslify/glslify?tab=readme-ov-file#importing-a-glsl-module).

We define `uniform vec3 gradient[steps]` where `steps` can be overwritten at runtime.

```glsl
#pragma glslify: interColor = require(./lib/interColor.glsl)

precision highp float;
precision highp int;

varying vec2 vUv;

const int steps = 2; // overwritten at runtime

uniform vec3 gradient[steps];
uniform sampler2D myTexture;

void main() {
    float alpha = texture2D(myTexture, vUv).r;

    vec3 rgb = interColor(gradient, alpha);

    gl_FragColor = vec4(rgb, 1);
}
```

### lib/interColor.glsl
```glsl
#pragma glslify: export(interColor)

precision highp float;

vec3 interColor (vec3 gradient[2], float t) {
    return mix(gradient[0], gradient[1], t);
}

vec3 interColor (vec3 gradient[3], float t) {
    vec3 color;
    if(t <= 0.5) {
        color = mix(gradient[0], gradient[1], t * 2.0);
    }  else {
        color = mix(gradient[1], gradient[2], (t - 0.5) * 2.0);
    }
    return color;
}

vec3 interColor (vec3 gradient[4], float t) {

// [...]
```

### output
At current, precision specifiers are not deduplicated and there is no compile-time check to see if they are consistent.

```glsl
precision highp float;

vec3 interRGB(vec3 from, vec3 to, float t) {
    return vec3(
        (to[0] - from[0]) * t + from[0],
        (to[1] - from[1]) * t + from[1],
        (to[2] - from[2]) * t + from[2]
    );
}

vec3 interColor (vec3 gradient[2], float t) {
    return interRGB(gradient[0], gradient[1], t);
}

vec3 interColor (vec3 gradient[3], float t) {
    vec3 color;
    if(t <= 0.5) {
        color = interRGB(gradient[0], gradient[1], t * 2.0);
    }  else {
        color = interRGB(gradient[1], gradient[2], (t - 0.5) * 2.0);
    }
    return color;
}

vec3 interColor (vec3 gradient[4], float t) {

// [...]

precision highp float;
precision highp int;
#define GLSLIFY 1

varying vec2 vUv;

const int steps = 2; // overwritten at runtime

uniform vec3 gradient[steps];
uniform sampler2D myTexture;

void main() {
    float alpha = texture2D(myTexture, vUv).r;

    vec3 rgb = interColor(gradient, alpha);

    gl_FragColor = vec4(rgb, 1);
}
```