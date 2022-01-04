import { useState, useRef, useEffect } from 'preact/hooks';
import GL from './helpers/gl';
import ColorRange from './components/ColorRange';

let gl: any;

export function App() {
  const size = { width: 0, height: 0 };
  const baseHSV = { h: 0.5, s: 0.5, v: 0.9 };
  const baseSmoothstep = { e1: 0.0, e2: 1.0, x: 0.5 };
  const ref = useRef<HTMLCanvasElement>(null);
  const [hsvs, setHSVs] = useState([baseHSV]);
  const [smoothsteps, setSmoothsteps] = useState([baseSmoothstep]);
  const increment = () => {
    setHSVs([...hsvs, baseHSV]);
    setSmoothsteps([...smoothsteps, baseSmoothstep]);
  };
  const decrement = () => {
    if (hsvs.length === 1) return;
    setHSVs(hsvs.slice(0, hsvs.length -1));
    setSmoothsteps(smoothsteps.slice(0, smoothsteps.length -1));
  }

  const onHandleResize = () => {
    if (ref.current) {
      size.width = ref.current.clientWidth;
      size.height = ref.current.clientHeight;
    }
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const ctx = ref.current.getContext('webgl2');
    if (!ctx || !(ctx instanceof WebGL2RenderingContext)) {
      throw new Error('Failed to get WebGL2 context');
    }

    window.addEventListener('resize', onHandleResize);
    size.width = ref.current.clientWidth;
    size.height = ref.current.clientHeight;

    gl = new GL(ctx);
    gl.setResolution(size.width, size.height);
    gl.draw();

    return () => {
      window.removeEventListener('resize', onHandleResize);
    }
  }, []);

  useEffect(() => {
    // console.log('hsv changed', hsvs);
    // console.log('smooth changed', smoothsteps);
    if (gl) {
      gl.setParams(hsvs, smoothsteps);
    }
  }, [hsvs, smoothsteps]);

  return (
    <>
      <canvas ref={ref} />
      <div className='container'>
        <button onClick={increment}>Add Color</button>
        <button onClick={decrement}>Remove Color</button>
        {hsvs.map((hsv, i) => (
          <ColorRange
            key={i}
            title={i === 0 ? 'Base' : 'Child'}
            index={i}
            hsvs={hsvs}
            setHSV={setHSVs}
            smoothsteps={smoothsteps}
            setSmoothsteps={setSmoothsteps}
          />
        ))}
      </div>
    </>
  )
}
