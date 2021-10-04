import SimplexNoise from "simplex-noise";
import p5 from "p5";

const simplex = new SimplexNoise();
const p5Container = document.getElementById('p5_container');
const FRAMERATE = 60;
const LOOP_FRAMES = 180;
const BLOB_VERTICES = 16;
const BASE_RADIUS = 100;
const NOISE_SPEED = 0.5;
const NOISE_INF = 0.5;
const NOISE_STEP = 0.2;

var rotate = Math.PI * 2 / BLOB_VERTICES;

const sketch = (p) => {
  p.setup = function () {
    p.frameRate(FRAMERATE);
    p.createCanvas(500, 500);
    p.noStroke();
    p.fill(255);
  };

  p.draw = function () {
    p.background(0);
    // current frame in loop
    let f = (p.frameCount % LOOP_FRAMES) / LOOP_FRAMES * p.TWO_PI;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    for (let i = 0; i < BLOB_VERTICES; i++) {
      // generate noise for current vertex
      let noise = simplex.noise2D((Math.sin(i * NOISE_STEP)), Math.cos(f) * NOISE_SPEED);
      noise = p.map(noise, -1, 1, 1 - NOISE_INF, 1 + NOISE_INF);
      // apply noise and draw
      p.rotate(rotate);
      p.fill(255 * (i * rotate / p.TWO_PI), 128, 128);
      p.ellipse(BASE_RADIUS * noise, 0, 10, 10);
    }
    p.pop();
  };
}

export const flowsphere = () => { new p5(sketch, p5Container); }