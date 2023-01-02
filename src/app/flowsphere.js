import { createNoise2D } from "simplex-noise";
import p5 from "p5";

import { cordic, bhaskara, diagonal } from "./fast-trigs";
import { TRIG_SIN, TRIG_COS, TRIG_BOTH } from "./fast-trigs";
import { graphSketch, loopSketch } from "./demos";

const p5Container = document.getElementById('p5_container') ?? undefined;
const noise2D = createNoise2D();

// sketch settings
const FRAMERATE = 60;

/** @param {p5} p */
const sketch = (p) => {
  p.setup = function () {
    p.frameRate(FRAMERATE);
    p.createCanvas(800, 800);
    p.noStroke();
    p.fill(255);
  };

  p.draw = function () {

  };
}
// switch out the sketch passed to p5 to see demos
// export default function flowsphere() { return new p5(graphSketch, p5Container); }
// export default function flowsphere() { return new p5(loopSketch, p5Container); }
export default function flowsphere() { return new p5(sketch, p5Container); }

/**
 * Get a random noise value that loops seamlessly over time.
 * Achieved by moving through 2D noise along the circumference of a unit circle
 * @param {number} n Treated as radians - i.e. output will loop every `n / 2π`.
 * @returns {number} A value between -1 and 1
 */
export function loopingNoise(n) {
  // pick one of the following trig approximations
  const trigs = cordic(n, TRIG_BOTH);
  // const trigs = bhaskara(n, TRIG_BOTH);
  // const trigs = diagonal(n, TRIG_BOTH);
  return noise2D(trigs[TRIG_SIN], trigs[TRIG_COS]);
}
