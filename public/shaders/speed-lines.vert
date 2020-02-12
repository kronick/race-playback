precision highp float;

uniform mat4 u_matrix;

attribute vec2 a_pos;
attribute vec2 a_extrude;
attribute float a_time;
uniform float u_width;
uniform float u_zoom_factor;

varying float v_time;

void main() {
    gl_Position = u_matrix * vec4(a_pos + a_extrude * u_width * u_zoom_factor, 0, 1.0);
    v_time = a_time;
}