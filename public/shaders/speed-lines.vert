precision highp float;

uniform mat4 u_matrix;
uniform vec2 u_offset;

attribute vec3 a_pos;

varying float v_time;

void main() {
    gl_Position = u_matrix * vec4(a_pos.xy + u_offset, 0, 1.0);
    v_time = a_pos.z;
}