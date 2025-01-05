export const Fragment = `
uniform float u_intensity;
uniform float u_time;
uniform vec3 u_color;

varying vec2 vUv;
varying float vDisplacement;

void main() {
  float distort = 1.5 * vDisplacement * u_intensity;

  vec3 color = vec3(u_color * (2.0 - distort));
  
  gl_FragColor = vec4(color , 1.0);
}
`;

export const TubeFragment = `
uniform vec3 u_color1;
uniform vec3 u_color2; 

varying vec2 vUv;

void main() {
  vec3 color = mix(u_color1, u_color2 * 1.5, vUv.x);

  gl_FragColor = vec4(color, 1.0);
}
`;

