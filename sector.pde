// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/

// cubic sectors of the flowsphere. Have Perlin Noise force vectors that act on particles
public class Sector {
  // should these be PVectors? But inside all our loops this is probably more efficient
  // (duplicating data here for the sake of CPU cycles)
  int ix, iy, iz; // index in sectors[][][]
  float px, py, pz; // pos
  float fx, fy, fz; // force
  boolean active;
  
  // Flat floats instead of PVectors to avoid per-frame object allocation in hot loops.
  Sector(int ix, int iy, int iz, float px, float py, float pz, boolean active) {
    this.ix = ix;
    this.iy = iy;
    this.iz = iz;
    this.px = px;
    this.py = py;
    this.pz = pz;
    this.active = active;
    fx = fy = fz = 0;
  }
  
  // calc force vector using Perlin Noise
  void update() {
    // noise returns 0->1, we want -0.5->0.5
    float t = frameCount;
    float n1 = (noise((px+t)*NOISE_SPEED, (py+t)*NOISE_SPEED, (pz+t)*NOISE_SPEED) - 0.5) * NOISE_INFLUENCE;
    float n2 = (noise((px+t)*NOISE_SPEED + NOISE_OFFSET, (py+t)*NOISE_SPEED + NOISE_OFFSET, (pz+t)*NOISE_SPEED + NOISE_OFFSET) - 0.5) * NOISE_INFLUENCE;
    float n3 = (noise((px+t)*NOISE_SPEED + NOISE_OFFSET*2, (py+t)*NOISE_SPEED + NOISE_OFFSET*2, (pz+t)*NOISE_SPEED + NOISE_OFFSET*2) - 0.5) * NOISE_INFLUENCE;

    // Cross-subtraction keeps net force near zero: each n contributes positively to one axis
    // and negatively to another, so the sum (fx+fy+fz) = 0 by construction.
    fx = n1 - n2;
    fy = n2 - n3;
    fz = n3 - n1;
  }
  
  void display() {
    pushMatrix();
      float sr = SECTOR_RES / 2.0;
      float lx = map(fx,-0.5,0.5,-sr, sr);
      float ly = map(fy,-0.5,0.5,-sr, sr);
      float lz = map(fz,-0.5,0.5,-sr, sr);
      
      translate(px, py, pz);
      strokeWeight(1);
      line(0,0,0,lx,ly,lz);
      strokeWeight(3);
      point(lx,ly,lz);
    popMatrix();
  }
}
