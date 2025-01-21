
precision mediump float;

attribute vec2 a_xy;
attribute vec2 a_uv0;
attribute vec4 a_rgba;

varying vec2 v_uv0;
varying vec4 v_rgba;

uniform vec2 u_texres0;
uniform vec2 u_fbres;
uniform float u_time;

void main() {
    v_uv0 = a_uv0;
    v_rgba = a_rgba;

    float x = a_xy.x / u_fbres.x;
    float y = a_xy.y / u_fbres.y;

    gl_Position = vec4(
        (x * 2.0) - 1.0, 
        (y * 2.0) - 1.0, 
        0.0, 1.0);
}

