import p5 from "p5";

import { cordic, bhaskara, diagonal } from "./fast-trigs";
import { TRIG_SIN, TRIG_COS, TRIG_BOTH } from "./fast-trigs";
import { loopingNoise } from "./flowsphere";

const p5Container = document.getElementById('p5_container') ?? undefined;
const FRAMERATE = 60;
const BLOB_VERTICES = 50;
const BASE_RADIUS = 200;
const LOOP_SECONDS = 10;
const NOISE_INFLUENCE = 0.4;

const loopFrames = FRAMERATE * LOOP_SECONDS;
const rotate = Math.PI * 2 / BLOB_VERTICES;

/**
 * Visualise our trig approximations side-by-side to each other (and also actual trig fn outputs)
 * @param {p5} p
 */
export function graphSketch(p) {
  p.setup = function () {
    p.frameRate(FRAMERATE);
    p.createCanvas(1600, 1200);
    p.strokeWeight(1);

    for (let i = 0; i <= 1000; i++) {
      const x = p.TWO_PI * 4 * (i / 1000) - p.TWO_PI * 2;
      const cord = cordic(x);
      const bh = bhaskara(x);
      const diag = diagonal(x);
      p.stroke(255, 100, 50);
      p.point((x + p.TWO_PI * 2) * 50, 100 - Math.sin(x) * 100);
      p.point((x + p.TWO_PI * 2) * 50, 300 - cord[TRIG_SIN] * 100);
      p.point((x + p.TWO_PI * 2) * 50, 500 - bh[TRIG_SIN] * 100);
      p.point((x + p.TWO_PI * 2) * 50, 700 - diag[TRIG_SIN] * 100);
      p.stroke(50, 255, 100);
      p.point((x + p.TWO_PI * 2) * 50, 100 - Math.cos(x) * 100);
      p.point((x + p.TWO_PI * 2) * 50, 300 - cord[TRIG_COS] * 100);
      p.point((x + p.TWO_PI * 2) * 50, 500 - bh[TRIG_COS] * 100);
      p.point((x + p.TWO_PI * 2) * 50, 700 - diag[TRIG_COS] * 100);
      p.stroke(0);
      p.line(p.TWO_PI * 2 * 50, 0, p.TWO_PI * 2 * 50, 1200);
    }
  };
  p.draw = function () { }
}

/**
 * Visualise looping through noise over time
 * @param {p5} p
 */
export function loopSketch(p) {
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
      const noise = p.map(loopingNoise(n - vertexStep), -1, 1, 1 - NOISE_INFLUENCE, 1 + NOISE_INFLUENCE);

      // draw
      p.rotate(rotate);
      p.fill(255 * (i * rotate / p.TWO_PI), 128, 128);
      p.ellipse(BASE_RADIUS * noise, 0, 10, 10);
    }
    p.pop();
  };
}