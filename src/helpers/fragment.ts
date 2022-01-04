export default function fragment(fomula: string): string {
  return `
    precision mediump float;
    const float PI = 3.1415926;
    const vec2 offset = vec2(0.5);
    // uniform float time;
    uniform vec2 resolution;

    // https://www.shadertoy.com/view/MsS3Wc
    // Smooth HSV to RGB conversion 
    vec3 hsv2rgb_smooth( in vec3 c ) {
      vec3 rgb = clamp(abs(mod( c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) -3.0) -1.0, 0.0, 1.0 );
      rgb = rgb * rgb * (3.0 - 2.0*rgb); // cubic smoothing
      return c.z * mix( vec3(1.0), rgb, c.y);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy / resolution.xy);
      vec3 color = hsv2rgb_smooth( vec3(0.33, 0.46, 0.92) );
      ${fomula}
      gl_FragColor = vec4(color, 1.0);
    }
  `;
};
