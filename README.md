# vite-plugin-glslify-inject

[How to use](#how-to-use)
| [How to set up](#how-to-set-up)
| [Documentation](#documentation)

- write GLSL in distinct files with the [glslify](https://github.com/glslify/glslify) module system;
- import them as ES6 modules;
- inject contants at runtime;
- compatible with linters such as [GLSL Lint](https://github.com/hsimpson/vscode-glsllint#shader-code-in-string-literals);
- auto-generation of TS types for your modules, constants and uniforms.



## How to use
In this example we create a material that takes a grayscales texture and styles it with false colors.

### main.ts
```typescript
import passThrough from '@shaders/passThrough.vert';
import { falseColorsWith, FalseColorsUniforms } from '@shaders/falseColors.frag';

const gradient = ["#00178f", "#006172", "#47dd00"];
const steps = gradient.length;

const material = new THREE.RawShaderMaterial({
    uniforms: parseUniforms({ gradient, myTexture }) satisfies FalseColorsUniforms,
    vertexShader: passThrough,
    fragmentShader: falseColorsWith({ steps })
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

### output value
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

### output types

The following types are auto generated next to their source and updated live while the dev server is running. A variety of exports are available to enable different import patterns.

```typescript
declare module '@shaders/passThrough.vert' {
    const passThrough: string;
    export { passThrough as default, passThrough as glsl, passThrough };
}
```
```typescript
namespace THREE {
    export type Vector3 = { x: number, y: number, z: number, isVector3: true };
    export type Color = { r: number, g: number, b: number, isColor: true };
    export type Texture = { image: unknown, isTexture: true, isCubeTexture?: never };
}
declare module '@shaders/falseColors.frag' {
    const falseColors: string;
    const inject: (map: { steps?: number }) => string;
    type Uniforms = {
        gradient: [number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number], [number, number, number], [number, number, number]] | [THREE.Vector3, THREE.Vector3, THREE.Vector3] | [THREE.Color, THREE.Color, THREE.Color];
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

See [How to set up](#how-to-set-up) to control this output.

## How to set up

```bash
npm install --save-dev vite-plugin-glslify-inject
```

In your `vite.config.js`, invoke the plugin, pass in your include/exclude patterns and optionally share a path alias pointing to the location of your shaders if you want `.d.ts` files to be generated, and a library preset or configuration to contrl this output.

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

In the example above we pass in the string `threejs`. I *may* add types for other libraries, but you can also inject your own types (see [Documentation](#documentation)).

## Documentation

You can inject custom types using the `types` fields in the configuration. Each GLSL type accepts an array of TS types.

> They only need to be specific enough to be safe. Don't copy and paste the whole definitions.

### Base types

Here are a few ways you could add a `vec2` type definition for the trivial shader `uniform vec2 foo;`. The choice of variant only affects tooltips.

#### Inline
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

#### Alias
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

#### Namespaced alias

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

### Array types

The plugin can handle the nesting of types in arrays for you, but your library definition needs to opt-in for it. It is the case of the built-in `threejs` for example.

Here is an example for `uniform vec2 foo[2]`:

```typescript
// config
library: {
    nesting: true,
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
    foo: [number, number, number, number] | Float32Array |  [[number, number],  [number, number]][Vector2, Vector2]
};
```