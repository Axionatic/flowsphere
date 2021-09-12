import SimplexNoise from "simplex-noise";
import p5 from "p5";

const simplex = new SimplexNoise();
const p5Container = document.getElementById('p5_container');

const rX = Math.round(Math.random() * 1000);
const rY = Math.round(Math.random() * 1000);

const sketch = (p) => {
  p.setup = function () {
    p.frameRate(60);
    p.createCanvas(500, 500);
    p.ellipseMode(p.RADIUS);
    p.fill(255);
  };

  p.draw = function () {
    p.background(0);
    let n = (p.frameCount % 300) / 300 * p.TWO_PI;
    p.ellipse(
      p.width / 2,
      p.height / 2,
      100 * (simplex.noise2D(Math.sin(n) * 0.4, rX) + 1),
      100 * (simplex.noise2D(Math.cos(n) * 0.4, rY) + 1)
    );
  };
}

export const flowsphere = () => { new p5(sketch, p5Container); }