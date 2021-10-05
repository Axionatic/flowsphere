import SimplexNoise from "simplex-noise";
import p5 from "p5";

const simplex = new SimplexNoise();
const p5Container = document.getElementById('p5_container');
const FRAMERATE = 60;
const BLOB_VERTICES = 50;
const BASE_RADIUS = 200;
const LOOP_SECONDS = 10;
const NOISE_INFLUENCE = 0.4;

let loopFrames = FRAMERATE * LOOP_SECONDS;
let rotate = Math.PI * 2 / BLOB_VERTICES;

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
      // generate noise and scale to act as multiplier for base radius
      let noise = simplex.noise2D(Math.sin(n - vertexStep), Math.cos(n - vertexStep));
      noise = p.map(noise, -1, 1, 1 - NOISE_INFLUENCE, 1 + NOISE_INFLUENCE);
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

export const flowsphere = () => { new p5(sketch, p5Container); }