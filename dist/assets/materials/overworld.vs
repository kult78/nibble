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

uniform bool u_wind_enable;
uniform float u_wind_strength;

uniform vec4 u_scene_albedo;
uniform float u_camera_near;
uniform float u_camera_far; 

uniform float u_time;

uniform vec3 u_sun_direction;
uniform vec4 u_sun_color;

void main() {
    // Transform vertex position to world space
    vec4 worldPos = u_model_mtx * vec4(a_xyz, 1.0);

    // Apply wind effect
    if (u_wind_enable) {
        worldPos.x += u_wind_strength * worldPos.y * sin(u_time + worldPos.x + worldPos.z);
        worldPos.z += u_wind_strength * worldPos.y * cos(u_time + worldPos.x + worldPos.z);
    }

    // Transform to view space
    vec4 viewPos = u_view_mtx * worldPos;
    gl_Position = u_projection_mtx * viewPos;

    // Transform normal using normal matrix
    v_nxnynz = normalize((u_normal_mtx * vec4(a_nxnynz, 0.0)).xyz);

    // Compute depth for fog effects
    v_depth = -viewPos.z;

    // Compute diffuse lighting
    float diffuse = max(dot(v_nxnynz, normalize(-u_sun_direction)), 0.0);

    // Apply lighting effect
    vec4 lightEffect = u_sun_color * diffuse;
    lightEffect.a = a_rgba.a;  // Preserve alpha

    // Combine base color with lighting
    v_rgba = a_rgba * (u_scene_albedo + lightEffect);

    // Pass texture coordinates
    v_uv0 = a_uv0;
}
