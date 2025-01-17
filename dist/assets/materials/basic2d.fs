
precision mediump float;

varying vec2 v_uv0;
varying vec4 v_rgba;

uniform sampler2D u_tex0;

void main() {
    vec4 texelColor = texture2D(u_tex0, v_uv0);
    gl_FragColor = texelColor * v_rgba;
}

