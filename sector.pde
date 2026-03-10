// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/

// Cubic sectors of the flowsphere. Have Perlin Noise force vectors that act on particles.
class Sector {
  // Flat floats instead of PVectors to avoid per-frame object allocation in hot loops.
  private final int gridX, gridY, gridZ;
  private final float posX, posY, posZ;
  private float forceX, forceY, forceZ;
  private final boolean active;

  Sector(int gridX, int gridY, int gridZ, float posX, float posY, float posZ, boolean active) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.gridZ = gridZ;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.active = active;
    forceX = forceY = forceZ = 0;
  }

  void update() {
    float t = frameCount;
    float n1 = sampleNoise(posX, posY, posZ, t, 0);
    float n2 = sampleNoise(posX, posY, posZ, t, NOISE_OFFSET);
    float n3 = sampleNoise(posX, posY, posZ, t, NOISE_OFFSET * 2);

    // Cross-subtraction keeps net force near zero: each sample contributes positively to one
    // axis and negatively to another, so the sum (forceX+forceY+forceZ) = 0 by construction.
    forceX = n1 - n2;
    forceY = n2 - n3;
    forceZ = n3 - n1;
  }

  private float sampleNoise(float x, float y, float z, float time, float offset) {
    return (noise((x + time) * NOISE_SPEED + offset,
                  (y + time) * NOISE_SPEED + offset,
                  (z + time) * NOISE_SPEED + offset) - NOISE_CENTER_OFFSET) * NOISE_INFLUENCE;
  }

  void display() {
    pushMatrix();
      float halfRes = SECTOR_RES / 2.0;
      float lineX = map(forceX, -0.5, 0.5, -halfRes, halfRes);
      float lineY = map(forceY, -0.5, 0.5, -halfRes, halfRes);
      float lineZ = map(forceZ, -0.5, 0.5, -halfRes, halfRes);

      translate(posX, posY, posZ);
      strokeWeight(1);
      line(0, 0, 0, lineX, lineY, lineZ);
      strokeWeight(3);
      point(lineX, lineY, lineZ);
    popMatrix();
  }

  int getGridX() { return gridX; }
  int getGridY() { return gridY; }
  int getGridZ() { return gridZ; }
  float getPositionX() { return posX; }
  float getPositionY() { return posY; }
  float getPositionZ() { return posZ; }
  float getForceX() { return forceX; }
  float getForceY() { return forceY; }
  float getForceZ() { return forceZ; }
  boolean isActive() { return active; }
}
