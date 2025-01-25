
precision mediump float;

attribute vec3 a_xyz;
attribute vec3 a_nxnynz;
attribute vec2 a_uv0;
attribute vec4 a_rgba;

varying vec3 v_nxnynz;
varying vec2 v_uv0;
varying vec4 v_rgba;

uniform vec2 u_texres0;
uniform vec2 u_fbres;
uniform float u_time;

uniform mat4 u_model_mtx;
uniform mat4 u_view_mtx;
uniform mat4 u_projection_mtx;
uniform mat4 u_normal_mtx;

void main() {
    gl_Position = u_projection_mtx * u_view_mtx * u_model_mtx * vec4(a_xyz, 1.0);
    v_nxnynz = (u_normal_mtx * vec4(a_nxnynz, 0.0)).xyz;
    v_uv0 = a_uv0;
    v_rgba = a_rgba;
}
