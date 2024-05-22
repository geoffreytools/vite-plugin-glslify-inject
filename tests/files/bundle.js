export { entrypoint as default, entrypoint as glsl, entrypoint, inject };
import { injectConstants } from 'vite-plugin-glslify-inject/injectConstants';
const entrypoint = "\n\nprecision highp float;\n\nfloat foo(vec3 normal) {\n    return dot(vec3(0, 1, 0), normal);\n}\n\nprecision highp float;\n#define GLSLIFY 1\n\nconst int bar = 0; // runtime\n\nvoid main () {\n    float a = foo(vec3(0, 1, 0));\n}";
const inject = injectConstants(entrypoint);