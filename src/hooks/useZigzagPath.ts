export function useZigzagPath(progress: number) {

  const amplitude = 8;   
  const frequency = 3;   

  const baseX = 35 - progress * 55;         
  const zigzagX = Math.sin(progress * Math.PI * frequency) * amplitude;
  const x = baseX + zigzagX;                 

    
  const y = progress * 70;                      

  return { x, y };
}