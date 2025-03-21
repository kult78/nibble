precision mediump float;

attribute vec3 a_xyz;
attribute vec3 a_nxnynz;
attribute vec2 a_uv0;
attribute vec4 a_rgba;

varying vec3 v_nxnynz;
varying vec2 v_uv0;
varying vec4 v_rgba;
varying float v_depth;

uniform mat4 u_model_mtx;
uniform mat4 u_view_mtx;
uniform mat4 u_projection_mtx;
uniform mat4 u_normal_mtx;

uniform vec4 u_scene_albedo;

uniform float u_time;

void main() {
    // Transform vertex position to world space
    vec4 worldPos = u_model_mtx * vec4(a_xyz, 1.0);

    // Transform to view space
    vec4 viewPos = u_view_mtx * worldPos;

    gl_Position = u_projection_mtx * viewPos;

    float logDepth = log2(gl_Position.w + 1.0) * 0.5;
    gl_Position.z = logDepth;  

    // Transform normal using normal matrix
    v_nxnynz = normalize((u_normal_mtx * vec4(a_nxnynz, 0.0)).xyz);

    v_depth = gl_Position.z / gl_Position.w;

    v_rgba = a_rgba * u_scene_albedo ;

    // Pass texture coordinates
    v_uv0 = a_uv0;
}
