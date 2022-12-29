import SimplexNoise from "simplex-noise";
import p5 from "p5";

// CORDIC constants
const omegaTable = [];
const arctanTable = [];
const CRD_MAX_ITERS = 100;
const CRD_DEF_ITERS = 20;
const SINE = 0;
const COSINE = 1;
const BOTH = 2;

for (let i = 0; i < CRD_MAX_ITERS; i++) {
  omegaTable.push(Math.pow(2, -i));
  arctanTable.push(Math.atan(omegaTable[i]));
}

// sketch constants
const simplex = new SimplexNoise();
const p5Container = document.getElementById('p5_container');
const FRAMERATE = 60;
const BLOB_VERTICES = 50;
const BASE_RADIUS = 200;
const LOOP_SECONDS = 10;
const NOISE_INFLUENCE = 0.4;

const loopFrames = FRAMERATE * LOOP_SECONDS;
const rotate = Math.PI * 2 / BLOB_VERTICES;

/** @param {p5} p */
const sketch = (p) => {
  p.setup = function () {
    p.frameRate(FRAMERATE);
    p.createCanvas(800, 800);
    p.noStroke();
    p.fill(255);
  };

  p.draw = function () {
    p.background(0);
    // prepare to draw. Derive noise input from framecount
    let n = (p.frameCount % loopFrames) / loopFrames * p.TWO_PI;

    p.push();
    p.translate(p.width / 2, p.height / 2);
    for (let i = 0; i < BLOB_VERTICES; i++) {
      // offset vertex noise calc by position in blob
      let vertexStep = i / BLOB_VERTICES * p.TWO_PI;

      // generate and scale noise to act as multiplier for base radius
      const x = n - vertexStep;
      const t = cordic(x, BOTH);
      const noise = p.map(simplex.noise2D(t[SINE], t[COSINE]), -1, 1, 1 - NOISE_INFLUENCE, 1 + NOISE_INFLUENCE);

      // draw
      p.rotate(rotate);
      p.fill(255 * (i * rotate / p.TWO_PI), 128, 128);
      p.ellipse(BASE_RADIUS * noise, 0, 10, 10);
    }
    p.pop();
  };

  /**
   * sort-of sin & cos, but all straight lines instead of curves. Also with a period of 4 (so sin(x * PI/2))
   * plotted on a graph, the output would have the same apogees/nadirs, but be diagonal
   * @param {number} frameCount the sketch's current frame count
   * @returns {[number, number]} [sin-ish, cos-ish] of given number
   */
  const diagonalTrigs = (frameCount) => {
    let s = (frameCount + 3) % 4;
    let c = frameCount % 4;
    return [
      Math.abs(2 - s) - 1,
      Math.abs(2 - c) - 1
    ];
  }
}

// const sketch = p => {
//   p.setup = function () {
//     p.frameRate(FRAMERATE);
//     p.createCanvas(1600, 1200);
//     p.strokeWeight(1);

//     for (let i = 0; i < 25; i++) {
//       const x = Math.random() * p.TWO_PI;
//       console.log(`At: ${x}`);
//       const actual = Math.sin(x);
//       for (let j = 5; j <= 40; j += 5) {
//         const diff = Math.abs(Math.abs(actual) - Math.abs(cordic(x, CORDIC_SINE, j)));
//         console.log(`diff at ${j} iters: ${diff.toFixed(20)}`);
//       }
//       console.log('');
//     }

//     p.clear();
//     for (let i = 0; i <= 1000; i++) {
//       const x = p.TWO_PI * 4 * (i / 1000) - p.TWO_PI * 2;
//       const cord = cordic(x, CORDIC_BOTH);
//       const diag = diagTrigs(x);
//       p.stroke(255, 100, 50);
//       p.point((x + p.TWO_PI * 2) * 50, 100 - Math.sin(x) * 100);
//       p.point((x + p.TWO_PI * 2) * 50, 400 - cord[CORDIC_SINE] * 100);
//       p.point((x + p.TWO_PI * 2) * 50, 700 - diag[CORDIC_SINE] * 100);
//       p.stroke(50, 255, 100);
//       p.point((x + p.TWO_PI * 2) * 50, 100 - Math.cos(x) * 100);
//       p.point((x + p.TWO_PI * 2) * 50, 400 - cord[CORDIC_COS] * 100);
//       p.point((x + p.TWO_PI * 2) * 50, 700 - diag[CORDIC_COS] * 100);
//       p.stroke(0);
//       p.line(p.TWO_PI * 2 * 50, 0, p.TWO_PI * 2 * 50, 1200);
//     }
//   };

//   p.draw = function () { }
// }

export const flowsphere = () => { new p5(sketch, p5Container); }

/**
 * Approximate cosine and sine of a given angle using the CORDIC method
 * @param {number} input Value to calculate sine/cos for
 * @param {number} returnMode `0` = return sine only, `1` = return cosine only, all else = return `[sine, cosine]`
 * @param {number} iterations Number of calc iterations. Higher = slower but more accurate result.
 * Default (40) returns accurate sine/cos to 10 decimal places. Values above `MAX_ITERS` (100) will be treated as `MAX_ITERS` instead.
 * @returns number|number[]
 */
function cordic(input, returnMode = SINE, iterations = CRD_DEF_ITERS) {
  // translate input to positive value, if required
  let flipCos = 1;
  if (input < 0) {
    input = Math.abs(input) + Math.PI;
    flipCos = -1;
  }

  // init
  let x = 1;
  let y = 0;
  let r = 1;
  const iters = Math.min(iterations, CRD_MAX_ITERS);

  for (let i = 0; i < iters; i++) {
    while (input > arctanTable[i]) {
      // calc next iteration
      let dx = x - y * omegaTable[i];
      let dy = y + x * omegaTable[i];
      let rx = r * Math.sqrt(1 + Math.pow(omegaTable[i], 2));

      // update values
      input -= arctanTable[i];
      x = dx;
      y = dy;
      r = rx;
    }
  }

  if (returnMode == SINE)
    return y / r; // Sine = Opposed / hypotenus
  else if (returnMode == COSINE)
    return x / r * flipCos; // Cos = Adjacent / hypotenus
  else
    return [y / r, x / r * flipCos];
}

// const HALF_PI = Math.PI / 2;
// const ONE_OVER_PI = 1 / Math.PI;
// /**
//  * sort-of sin & sort-of-cos, but all straight lines instead of curves.
//  * plotted on a graph, the output would have the same peaks/troughs, but be diagonal
//  * @param {number} x the value to calculate trigs for
//  * @returns {[number, number]} [sin-ish, cos-ish] of given number
//  */
// function diagTrigs(x) {
//   // translate input to positive value, if required
//   let flipCos = 1;
//   if (x < 0) {
//     x = Math.abs(x) + Math.PI;
//     flipCos = -1;
//   }

//   return [
//     Math.abs(2 - Math.abs(x - HALF_PI) * ONE_OVER_PI % 2 * 2) - 1,
//     (Math.abs(2 - x * ONE_OVER_PI % 2 * 2) - 1) * flipCos
//   ];
// }