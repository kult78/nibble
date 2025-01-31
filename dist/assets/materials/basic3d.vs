
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

uniform bool u_fog_enable;
uniform vec3 u_fog_color;
uniform float u_fog_start;
uniform float u_fog_end;

uniform bool u_wind_enable;
uniform vec3 u_wind_dir;
uniform float u_wind_strength;

void main() {
    
    vec4 worldPos = u_model_mtx * vec4(a_xyz, 1.0);

    worldPos.x = worldPos.x + 0.04 * worldPos.y * sin(u_time + worldPos.x + worldPos.z);
    worldPos.z = worldPos.z + 0.04 * worldPos.y * cos(u_time + worldPos.x + worldPos.z);

    vec4 viewPos = u_view_mtx * worldPos;

    gl_Position = u_projection_mtx * viewPos;
    v_nxnynz = (u_normal_mtx * vec4(a_nxnynz, 0.0)).xyz;

    //vec3 lv = normalize(vec3(-1.0, -1.0, -1.0));
    //float l = dot(normalize(v_nxnynz), lv);

    v_uv0 = a_uv0;
    //v_rgba = vec4(a_rgba.x * l, a_rgba.y * l, a_rgba.z * l, a_rgba.w);
    v_rgba = a_rgba;
}
