import { useState } from 'preact/hooks';

type Props = {
  title: string;
  index: number;
  hsvs: { h: number, s: number, v: number }[];
  setHSV: (value: {
      h: number;
      s: number;
      v: number;
  }[] | ((prevState: {
      h: number;
      s: number;
      v: number;
  }[]) => {
      h: number;
      s: number;
      v: number;
  }[])) => void;
  smoothsteps: { e1: number, e2: number, x: number }[];
  setSmoothsteps: (value: {
      e1: number;
      e2: number;
      x: number;
  }[] | ((prevState: {
      e1: number;
      e2: number;
      x: number;
  }[]) => {
      e1: number;
      e2: number;
      x: number;
  }[])) => void;
};

const ColorRange = ({
  title,
  index,
  hsvs,
  setHSV,
  smoothsteps,
  setSmoothsteps
}: Props) => {

  const onChange = (e: any) => {
    const newHsvs = [...hsvs];
    const temp = {...newHsvs[index]};
    const newSmoothsteps = [...smoothsteps];
    const tempSmoothsteps = {...newSmoothsteps[index]};
    
    switch (e.target.name) {
      case '0':
        temp.h = parseFloat( e.target.value );
        newHsvs[index] = temp;
        setHSV(newHsvs);
        break;
      case '1':
        temp.s = parseFloat( e.target.value );
        newHsvs[index] = temp;
        setHSV(newHsvs);
        break;
      case '2':
        temp.v = parseFloat( e.target.value );
        newHsvs[index] = temp;
        setHSV(newHsvs);
        break;
      case '3':
        tempSmoothsteps.e1 = parseFloat( e.target.value );
        newSmoothsteps[index] = tempSmoothsteps;
        setSmoothsteps(newSmoothsteps);
        break;
      case '4':
        tempSmoothsteps.e2 = parseFloat( e.target.value );
        newSmoothsteps[index] = tempSmoothsteps;
        setSmoothsteps(newSmoothsteps);
        break;
      case '5':
        tempSmoothsteps.x = parseFloat( e.target.value );
        newSmoothsteps[index] = tempSmoothsteps;
        setSmoothsteps(newSmoothsteps);
        break;
      default:
        break;
    }
  }

  return (
    <>
      <p>{title}</p>
      <div>
        <label name={`h-${index}`}>H</label>
        <input id={`h-${index}`} name="0" type="range" step="0.001" min="0" max="1.0" value={hsvs[index].h} onChange={onChange} />
        <span>{hsvs[index].h}</span>
      </div>
      <div>
        <label name={`s-${index}`}>S</label>
        <input id={`s-${index}`} name="1" type="range" step="0.001" min="0" max="1.0" value={hsvs[index].s} onChange={onChange}  />
        <span>{hsvs[index].s}</span>
      </div>
      <div>
        <label name={`v-${index}`}>V</label>
        <input id={`v-${index}`} name="2" type="range" step="0.001" min="0" max="1.0" value={hsvs[index].v} onChange={onChange}  />
        <span>{hsvs[index].v}</span>
      </div>
      {index !== 0 && (
        <div>
          <p>Smoothstep</p>
          <div>
            <label name={`edge1-${index}`}>Edge 1</label>
            <input id={`edge1-${index}`} name="3" type="range" step="0.1" min="0" max="1.0" value={smoothsteps[index].e1} onChange={onChange}  />
            <span>{smoothsteps[index].e1}</span>
          </div>
          <div>
            <label name={`edge2-${index}`}>Edge 2</label>
            <input id={`edge2-${index}`} name="4" type="range" step="0.1" min="0" max="1.0" value={smoothsteps[index].e2} onChange={onChange}  />
            <span>{smoothsteps[index].e2}</span>
          </div>
          <div>
            <label name={`x-${index}`}>X</label>
            <input id={`x-${index}`} name="5" type="range" step="0.1" min="0" max="1.0" value={smoothsteps[index].x} onChange={onChange}  />
            <span>{smoothsteps[index].x}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ColorRange;
