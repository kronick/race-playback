precision highp float;

uniform mat4 u_matrix;
uniform mediump float u_time_min;
uniform mediump float u_time_max;

attribute vec2 a_pos;
attribute vec2 a_extrude;
attribute float a_time;
attribute float a_speed;
uniform float u_width;
uniform float u_zoom_factor;

varying float v_time;
varying float v_speed;

void main() {
    float timeWidth = (smoothstep(u_time_max, mix(u_time_max, u_time_min, 0.8), a_time)) + 0.25;
    gl_Position = u_matrix * vec4(a_pos + a_extrude * u_width * timeWidth * u_zoom_factor, 0, 1.0);
    v_time = a_time;
    v_speed = a_speed;
}