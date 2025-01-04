export const Fragment = `
uniform float u_intensity;
uniform float u_time;
uniform vec3 u_color;

varying vec2 vUv;
varying float vDisplacement;

void main() {
  float distort = 0.75 * vDisplacement * u_intensity;

  vec3 color = vec3(u_color * (2.0 - distort));
  
  gl_FragColor = vec4(color , 1.0);
}
`;