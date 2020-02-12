precision mediump float;

uniform mediump float u_time_min;
uniform mediump float u_time_max;
uniform bool u_persist_trace;

varying float v_time;
varying float v_speed;

struct Gradient {
	vec4 color;
    float stop;
};

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}
    
vec4  pickGradient(Gradient gradient[2], float value) {
    if (value < gradient[0].stop) {
        return gradient[0].color;
    }
    if (value < gradient[1].stop) {
        return mix(gradient[0].color, gradient[1].color,
                   map(value, gradient[0].stop, gradient[1].stop, 0., 1.)
                  );
    }
	return gradient[1].color;
}
vec4  pickGradient(Gradient gradient[3], float value) {
	if (value < gradient[0].stop) {
        return gradient[0].color;
    }
    if (value < gradient[1].stop) {
        return mix(gradient[0].color, gradient[1].color,
                   map(value, gradient[0].stop, gradient[1].stop, 0., 1.)
                  );
    }
    if (value < gradient[2].stop) {
        return mix(gradient[1].color, gradient[2].color,
                   map(value, gradient[1].stop, gradient[2].stop, 0., 1.)
                  );
    }
	return gradient[2].color;
}

vec4  pickGradient(Gradient gradient[4], float value) {
	if (value < gradient[0].stop) {
        return gradient[0].color;
    }
    if (value < gradient[1].stop) {
        return mix(gradient[0].color, gradient[1].color,
                   map(value, gradient[0].stop, gradient[1].stop, 0., 1.)
                  );
    }
    if (value < gradient[2].stop) {
        return mix(gradient[1].color, gradient[2].color,
                   map(value, gradient[1].stop, gradient[2].stop, 0., 1.)
                  );
    }
    if (value < gradient[3].stop) {
        return mix(gradient[2].color, gradient[3].color,
                   map(value, gradient[2].stop, gradient[3].stop, 0., 1.)
                  );
    }
	return gradient[3].color;
}


vec4  pickGradient(Gradient gradient[5], float value) {
	if (value < gradient[0].stop) {
        return gradient[0].color;
    }
    if (value < gradient[1].stop) {
        return mix(gradient[0].color, gradient[1].color,
                   map(value, gradient[0].stop, gradient[1].stop, 0., 1.)
                  );
    }
    if (value < gradient[2].stop) {
        return mix(gradient[1].color, gradient[2].color,
                   map(value, gradient[1].stop, gradient[2].stop, 0., 1.)
                  );
    }
    if (value < gradient[3].stop) {
        return mix(gradient[2].color, gradient[3].color,
                   map(value, gradient[2].stop, gradient[3].stop, 0., 1.)
                  );
    }
    if (value < gradient[4].stop) {
        return mix(gradient[3].color, gradient[4].color,
                   map(value, gradient[3].stop, gradient[4].stop, 0., 1.)
                  );
    }
	return gradient[4].color;
}

void main() {
    Gradient gradient[5];
    gradient[0] = Gradient(vec4(0.0,    0.2470,     0.3608, 1.0), 0.0);
    gradient[1] = Gradient(vec4(0,      0.247,      0.3607, 1.0), 2.5);
    gradient[2] = Gradient(vec4(0.6588, 0.3137,     0.5647, 1.0), 5.0);
    gradient[3] = Gradient(vec4(1.0,    0.3882,     0.3882, 1.0), 7.5);
    gradient[4] = Gradient(vec4(1.0,    0.651,      0.0, 1.0), 10.0);

    // float timeAlpha = step(v_time, u_time_min) *
    //     (smoothstep(u_time_max, mix(u_time_max, u_time_min, 0.8), v_time));
    // float timeAlpha = step(v_time, u_time_min) *
    //     (step(u_time_max, v_time));

    // float timeAlpha = step(v_time, u_time_min) * 
    //                   (step(u_time_max, v_time) / 2.0 +
    //                   (u_persist_trace ? 0.5 : 0.0));

    float timeAlpha = step(v_time, u_time_min) * 
                      (step(u_time_max, v_time)+
                      (u_persist_trace ? 1.0 : 0.0));

    vec4 color = pickGradient(gradient, v_speed);
    color.a *= timeAlpha;
    gl_FragColor = color;
}