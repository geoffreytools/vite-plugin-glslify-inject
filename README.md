# vite-plugin-glslify-inject

[Why](#why)
| [How to use](#how-to-use)
| [Output](#output)
| [How to set up](#how-to-set-up)

- Write GLSL in distinct files with the [glslify](https://github.com/glslify/glslify) module system;
- Import them as ES6 modules;
- Inject contants at runtime;
- Auto-generate TS types for your modules, constants and uniforms;
- Compatible with linters such as [GLSL Lint](https://github.com/hsimpson/vscode-glsllint#shader-code-in-string-literals).

## Why

Organising code in distinct files and dedicated file types is a matter of preference.

This plugin enables a setup where you keep GLSL seperate from your JS while having all the advantages of glslify module resolution and runtime code injection, without having to deal with string interpolation, potentially loosing GLSL linting in the process, and in what I consider a cleaner format.

Getting TS types for your uniforms at the TS/GLSL interface is also nice to have. You probably already do it for other APIs.

## How to use
In this example we create a material that takes a grayscales texture and styles it with false colors.

### main.ts
```typescript
import passThrough from '@shaders/passThrough.vert';
import { falseColorsWith, FalseColorsUniforms } from '@shaders/falseColors.frag';

const gradient = ["#00178f", "#006172", "#47dd00"];
const steps = gradient.length;

const material = new THREE.RawShaderMaterial({
    uniforms: parseUniforms<FalseColorsUniforms>()({ gradient, myTexture }),
    vertexShader: passThrough,
    fragmentShader: falseColorsWith({ steps })
});
```
I don't detail `parseUniforms` but even with a library like threejs you probably do some processing on your uniforms before passing them to your material.

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
## Output

### Runtime values
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

### Types

The following types are auto generated next to their source and updated live while the dev server is running. A variety of exports are available to enable different import patterns.

```typescript
declare module '@shaders/passThrough.vert' {
    const passThrough: string;

    export { passThrough as default, passThrough as glsl, passThrough };
}
```
```typescript
declare module '#shaders/falseColors.frag' {
    namespace THREE {
        export type Vector3 = { x: number, y: number, z: number, isVector3: true };
        export type Color = { r: number, g: number, b: number, isColor: true };
        export type Texture = { image: unknown, isTexture: true, isCubeTexture?: never };
    }

    const falseColors: string;

    const inject: (map: { steps?: number }) => string;

    type Uniforms = {
        gradient: Array<number> | Float32Array | Array<[number, number, number]> | Array<THREE.Vector3> | Array<THREE.Color>,
        myTexture: WebGLTexture | THREE.Texture
    };

    export {
        falseColors as default,
        falseColors as glsl,
        falseColors,
        inject,
        inject as falseColorsWith,
        Uniforms,
        Uniforms as FalseColorsUniforms
    };
}
```
Because `gradient` is an array which length is defined by a constant, and because constants can be injected at runtime, `Uniform.gradient` lists array types instead of tuples.

See [How to set up](#how-to-set-up) to control this output.

## How to set up

```bash
npm install --save-dev vite-plugin-glslify-inject
```

The `vite.config.js` corresponding to the above example:
- we invoke the plugin;
- we pass in your include/exclude patterns;
- we pass a path alias pointing to the location of your shaders for `.d.ts` modules to be generated;
- we pass a library preset to generate threejs types (in addition to native types) for uniforms.

```typescript
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glslify-inject'

export default defineConfig({
    plugins: [
        glsl({
            include: './src/shaders/**/*.(vert|frag)',
            exclude: 'node_modules/**',
            types: { alias: '@shaders', library: 'threejs' }
        })
    ],
    resolve: {
        alias: {
          '@shaders': "/src/shaders/",
        }
    }
})
```
### Uniforms

You can disable the generation of type definitions for uniforms if you don't need them. There is no need to specify a library if you do so:

```typescript
glsl({
    include: './src/shaders/**/*.(vert|frag)',
    exclude: 'node_modules/**',
    types: { alias: '@shaders', uniforms: false }
})
```

### Libraries
You are likely using a library which bundles your uniforms for you and enables higher level data structures than flat/typed arrays, hence the `library` field.

In the example above we pass in the string `threejs`. I *may* add types for other libraries, but you can also inject your own types using the `types` fields in the configuration.

#### Array types

The plugin can handle the nesting of types in arrays for you, but your library definition needs to opt-in for it. It is the case of the built-in `threejs` for example.

Here is a minimal example for the trivial shader `uniform vec2 foo[2]`:

```typescript
// config
library: { nesting: true }
```

```typescript
// output
type Uniforms = {
    foo: [number, number, number, number] | Float32Array |  [[number, number],  [number, number]]
};
```

#### Base types

The `library` field takes a `types` field which is a record of type definition lists. Each GLSL type accepts an array of TS types (they only need to be specific enough to be safe. Don't copy and paste the whole definitions).

Here are a few ways you could add a `vec2` type definition for the trivial shader `uniform vec2 foo;`. The choice of variant only affects tooltips.

##### Inline
```typescript
// config
library: {
    types: {
        vec2: ['{ x: number, y: number, isVector2: true }']
    }
}
```

```typescript
// output
type Uniforms = {
    foo: [number, number] | Float32Array | { x: number, y: number, isVector2: true }
};
```

##### Alias
```typescript
// config
library: {
    types: {
        vec2: [{
            alias: 'Vector2',
            type: '{ x: number, y: number, isVector2: true }'
        }]
    }
}
```

```typescript
// output
type Vector2 = { x: number, y: number, isVector2: true };
type Uniforms = {
    foo: [number, number] | Float32Array | Vector2
};
```

##### Namespaced alias

```typescript
// config
library: {
    namespace: 'THREE'
    types: {
        vec2: [{
            alias: 'Vector2',
            type: '{ x: number, y: number, isVector2: true }'
        }]
    }
}
```

```typescript
// output
namespace THREE {
    export type Vector2 = { x: number, y: number, isVector2: true };
}
type Uniforms = {
    foo: [number, number] | Float32Array | THREE.Vector2
};
```