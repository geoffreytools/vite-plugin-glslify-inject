# vite-plugin-glslify-inject

- write GLSL in distinct files with the [glslify](https://github.com/glslify/glslify) module system;
- import them as ES6 modules;
- inject contants at runtime with automatic static type checking;
- compatible with linters such as [GLSL Lint](https://github.com/hsimpson/vscode-glsllint#shader-code-in-string-literals).

## How to install

```bash
npm install --save-dev vite-plugin-glslify-inject
```

In your `vite.config.js`, invoke the plugin, pass in your include/exclude patterns and optionally share a path alias pointing to the location of your shaders if you want `.d.ts` files to be generated.

```typescript
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glslify-inject'

export default defineConfig({
    plugins: [
        glsl({
            include: './src/shaders/**/*.(vert|frag)',
            exclude: 'node_modules/**',
            types: { alias: '@shaders' }
        })
    ],
    resolve: {
        alias: {
          '@shaders': "/src/shaders/",
        }
    }
})
```


## How to use
In this example we create a material that takes a grayscales texture and styles it with false colors.

### main.ts
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

The following types are auto generated next to their source and updated live while the dev server is running:

```typescript
declare module '@shaders/passThrough.vert' {
    const text: string;
    export { text as default };
}
```
```typescript
declare module '@shaders/falseColors.frag' {
    const text: string;
    const inject: (map: { steps?: number }) => string;
    export { text as default, text, inject };
}
```
I also plan to include typings for uniforms.

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