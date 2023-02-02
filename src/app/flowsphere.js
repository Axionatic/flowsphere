import { createNoise2D, createNoise4D } from "simplex-noise";
import p5 from "p5";

import { bhaskara } from "./fast-trigs";
import { graphSketch, loopSketch } from "./demos";

const p5Container = document.getElementById('p5_container') ?? undefined;

// sketch settings
const FRAMERATE = 60;
const SPHERE_RADIUS = 500;
const SECTOR_SIZE = SPHERE_RADIUS / 10;

/** @param {p5} p */
const sketch = p => {
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

function initSectors() {
  // 
}

function preCalcNoise() {
  
}
