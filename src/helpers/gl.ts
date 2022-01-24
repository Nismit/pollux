import { NISGL, NISGLProgram, NISGLBuffer } from 'nisgl-ts';
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
  private program: NISGLProgram;
  private indexBuffer: NISGLBuffer;
  private resolution = { width: 0, height: 0 };
  private hsvs = [{ h: 0.5, s: 0.5, v: 0.9 }];
  private smooths = [{ e1: 0.0, e2: 1.0, x: 0.5 }];
  private frameId: number;

  constructor(props: WebGL2RenderingContext) {
    this.frameId = 0;
    this.nisgl = new NISGL(props);
    this.nisgl.clear();
    this.program = <NISGLProgram>this.nisgl.createProgram(Vertex, Fragment(''));
    this.program.use();

    const vertex_data = new Float32Array([
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ]);

    const vertex_index = new Int16Array(
      [
        0, 2, 1,
        1, 2, 3
      ]
    );

    const positionBuffer = <NISGLBuffer>this.nisgl.arrayBuffer(new Float32Array(vertex_data));
    this.indexBuffer = <NISGLBuffer>this.nisgl.indexBuffer(new Int16Array(vertex_index));

    if (!positionBuffer || !this.indexBuffer) {
      return;
    }

    positionBuffer.attrib("position", 3);
    positionBuffer.attribPointer(this.program);
    this.indexBuffer.bind();

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
      const isCompiled = this.program.compile(Vertex, Fragment(code));

      if (!isCompiled) {
        console.log('Failed Fragment Shader Compling');
        return;
      }

      this.program.use();
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
      this.program.uniform2fv(uniformResolution, u_resolution);
    }

    // const uniformHsv = this.program.getUniformLocation('u_hsv');
    // if (uniformHsv && uniformHsv !== null) {
    //   this.program?.uniform3fv(uniformHsv, u_hsv);
    // }

    // this.nisgl.context.drawElements(this.nisgl.context.TRIANGLES, 6, this.nisgl.context.UNSIGNED_SHORT, 0);
    this.indexBuffer.drawTriangles(6, 0);
    this.nisgl.flush();

    this.frameId = requestAnimationFrame(this.draw);
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }
}