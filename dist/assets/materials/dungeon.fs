
precision mediump float;

varying vec3 v_nxnynz;
varying vec2 v_uv0;
varying vec4 v_rgba;
varying float v_depth;

uniform sampler2D u_tex0;

uniform bool u_fog_enable;
uniform vec4 u_fog_color;
uniform float u_fog_start;
uniform float u_fog_end;

void main() {
    vec4 texelColor = texture2D(u_tex0, v_uv0);
    vec4 finalColor = texelColor * v_rgba;
    
    if (u_fog_enable) { 
        float fragDepth = v_depth;
        float fogFactor = clamp((u_fog_end - fragDepth) / (u_fog_end - u_fog_start), 0.0, 1.0);
        finalColor.rgb = mix(u_fog_color.rgb, finalColor.rgb, fogFactor);
    }
    
    gl_FragColor = finalColor; 

    //gl_FragColor = vec4(v_depth, v_depth, v_depth, 1.0);
}

