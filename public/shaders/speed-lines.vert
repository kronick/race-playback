precision highp float;

uniform mat4 u_matrix;
uniform vec2 u_offset;

attribute vec2 a_pos;
attribute vec2 a_extrude;
attribute float a_time;
uniform float u_width;

varying float v_time;

void main() {
    gl_Position = u_matrix * vec4(a_pos + a_extrude * u_width, 0, 1.0);
    v_time = a_time;
}