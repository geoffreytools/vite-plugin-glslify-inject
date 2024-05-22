export { THREE as default };

import { Library } from "./uniforms.js";
import { Mat } from './utils.js';

const namespace = 'THREE';

const nesting = true;

const types = {
    vec2: [{alias: 'Vector2', type: '{ x: number, y: number, isVector2: true }' }],
    vec3: [
        { alias: 'Vector3', type: '{ x: number, y: number, z: number, isVector3: true }' },
        { alias: 'Color', type: '{ r: number, g: number, b: number, isColor: true }' }],
    vec4: [
        { alias: 'Vector4', type: '{ x: number, y: number, z: number, w: number, isVector4: true }' },
        { alias: 'Quaternion', type: '{ x: number, y: number, z: number, w: number, isQuaternion: true }' }],

    mat2: [Mat(2)],
    mat3: [Mat(3), { alias: 'Matrix3', type: '{ elements: number[], setFromMatrix4: unknown }' }],
    mat4: [Mat(4), { alias: 'Matrix4', type: '{ elements: number[], setFromMatrix3: unknown }' }],

    sampler2D: [{ alias: 'Texture', type: '{ image: unknown, isTexture: true, isCubeTexture?: never }' }],
    samplerCube: [{ alias: 'CubeTexture', type: '{ images: unknown, isTexture: true, isCubeTexture: true }'}]
}

const THREE = { types, namespace, nesting } satisfies Library;