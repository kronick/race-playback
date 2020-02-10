precision mediump float;

uniform float u_time;

varying float v_time;

float fmod(float x, float y) {
    return x - y * floor(x/y);
}

void main() {
    gl_FragColor = vec4(fmod(u_time, 256.0) / 256.0, 0, 0.5, smoothstep(u_time, u_time - 1.0, v_time));
}