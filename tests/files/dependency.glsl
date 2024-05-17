#pragma glslify: export(foo)

precision highp float;

float foo(vec3 normal) {
    return dot(vec3(0, 1, 0), normal);
}