import { NISGL, NISGLProgram, NISGLShader } from 'nisgl-ts';
import Vertex from './vertex';
import Fragment from './fragment';

type HSV = {
  h: number;
  s: number;
  v: number;
};

type Smooth = {
  e1: number;
  e2: number;
  x: number;
};

export default class GL {
  private nisgl: NISGL;
  private program: NISGLProgram | null;
  private vartexShader: NISGLShader;
  private fragmentShader: NISGLShader;
  private resolution = { width: 0, height: 0 };
  private hsvs = [{ h: 0.5, s: 0.5, v: 0.9 }];
  private smooths = [{ e1: 0.0, e2: 1.0, x: 0.5 }];
  private frameId: number;

  constructor(props: WebGL2RenderingContext) {
    this.frameId = 0;
    this.nisgl = new NISGL(props);
    this.nisgl.clear();
    this.vartexShader = this.nisgl.createShader(this.nisgl.context.VERTEX_SHADER)!;
    this.vartexShader.compile(Vertex);
    this.fragmentShader = this.nisgl.createShader(this.nisgl.context.FRAGMENT_SHADER)!;
    this.fragmentShader.compile(Fragment(''));

    this.program = this.nisgl.createProgram();

    if (this.vartexShader === null || this.fragmentShader === null || this.program === null) {
      return;
    }

    this.program.linkProgram([this.vartexShader, this.fragmentShader]);
    this.nisgl.useProgram(this.program);

    const positionBuffer = this.nisgl.createBuffer()!;
    const indexBuffer = this.nisgl.createBuffer()!;
    positionBuffer.createVertexPosition(
      new Float32Array([
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
      ])
    );

    indexBuffer.createVertexIndex(
      new Int16Array(
        [
          0, 2, 1,
          1, 2, 3
        ]
      )
    );

    if (positionBuffer === null || indexBuffer === null) {
      return;
    }

    this.program.setAttribute('position', 3, positionBuffer);
    indexBuffer.bindBuffer('index');

    this.draw = this.draw.bind(this);
    this.stop = this.stop.bind(this);
  }

  setResolution( width: number, height: number ) {
    this.resolution = { width: width, height: height };
  }

  setParams(hsvs: HSV[], smooths: Smooth[]) {
    this.hsvs = hsvs;
    this.smooths = smooths;
    const code = this.getNewColorCode();
    this.reCompile(code);
  }

  getNewColorCode() {
    const mix = this.hsvs.map((val, i) => {
      if (i === 0) {
        return `
          color = vec3(
            ${val.h},
            ${val.s},
            ${val.v}
          );
        `;
      }

      return `
        color = mix(color, 
          hsv2rgb_smooth( 
            vec3(
              ${val.h},
              ${val.s},
              ${val.v}
            )
          ),
          smoothstep(
            ${Number(this.smooths[i].e1).toFixed(2)},
            ${Number(this.smooths[i].e2).toFixed(2)},
            ${Number(this.smooths[i].x).toFixed(2)}
          )
        );
      `;
    });
    
    return mix.join('');
  }

  reCompile(code: string) {
    try {
      const tempFragment = this.nisgl.createShader(this.nisgl.context.FRAGMENT_SHADER);
      tempFragment?.compile(Fragment(code));

      if (!tempFragment?.isCompiled || tempFragment === null) {
        console.log('Failed Fragment Shader Compling');
        return;
      }

      this.nisgl.context.detachShader(this.program!.getProgram, this.fragmentShader.getShader());
      this.fragmentShader = tempFragment;
      this.program!.linkProgram([this.fragmentShader]);
      this.nisgl.useProgram(this.program!);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log('Err:', e.message);
      }
    }
  }

  draw() {
    if (this.program === null) return;
  
    const u_resolution = new Float32Array([ this.resolution.width, this.resolution.height ]);
    // const u_hsv = new Float32Array([ this.hsv.h, this.hsv.s, this.hsv.v ]);
    this.nisgl.clear();

    // Uniform
    const uniformResolution = this.program.getUniformLocation('resolution');
    if (uniformResolution && uniformResolution !== null) {
      this.program?.uniform2fv(uniformResolution, u_resolution);
    }

    // const uniformHsv = this.program.getUniformLocation('u_hsv');
    // if (uniformHsv && uniformHsv !== null) {
    //   this.program?.uniform3fv(uniformHsv, u_hsv);
    // }

    this.nisgl.context.drawElements(this.nisgl.context.TRIANGLES, 6, this.nisgl.context.UNSIGNED_SHORT, 0);
    this.nisgl.context.flush();

    this.frameId = requestAnimationFrame(this.draw);
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }
}