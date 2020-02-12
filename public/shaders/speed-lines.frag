precision mediump float;

uniform float u_time_min;
uniform float u_time_max;

varying float v_time;

float fmod(float x, float y) {
    return x - y * floor(x/y);
}

void main() {
    gl_FragColor = vec4(1.0, 0, 0.5,
        step(v_time, u_time_min) *
        (smoothstep(u_time_max, mix(u_time_max, u_time_min, 0.8), v_time))
    );
}