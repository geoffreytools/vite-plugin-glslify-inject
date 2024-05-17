#pragma glslify: foo = require(./dependency.glsl)

precision highp float;

const int bar = 0; // runtime

void main () {
    float a = foo(vec3(0, 1, 0));
}