// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/

// Particles get pushed around the flowsphere by sector force vectors.
class Particle {
  private FlowField field;
  private Sector sector;
  private float posX, posY, posZ;
  private float velX, velY, velZ;

  Particle(FlowField field, Sector spawn) {
    this.field = field;
    this.sector = spawn;
    resetPosition();
  }

  private void resetPosition() {
    float halfSector = SECTOR_RES / 2.0;
    posX = sector.getPositionX() + random(-halfSector, halfSector);
    posY = sector.getPositionY() + random(-halfSector, halfSector);
    posZ = sector.getPositionZ() + random(-halfSector, halfSector);

    velX = random(PARTICLE_MIN_VELOCITY, PARTICLE_MAX_VELOCITY);
    velY = random(PARTICLE_MIN_VELOCITY, PARTICLE_MAX_VELOCITY);
    velZ = random(PARTICLE_MIN_VELOCITY, PARTICLE_MAX_VELOCITY);
  }

  void update() {
    velX = constrain(velX + sector.getForceX(), PARTICLE_MIN_VELOCITY, PARTICLE_MAX_VELOCITY);
    velY = constrain(velY + sector.getForceY(), PARTICLE_MIN_VELOCITY, PARTICLE_MAX_VELOCITY);
    velZ = constrain(velZ + sector.getForceZ(), PARTICLE_MIN_VELOCITY, PARTICLE_MAX_VELOCITY);
    posX += velX;
    posY += velY;
    posZ += velZ;

    // Check if we moved to a new sector or if we need to wrap around
    if (!hasWrappedAround()) {
      hasMovedSector();
    }

    // Decay velocity according to friction
    velX = applyFriction(velX);
    velY = applyFriction(velY);
    velZ = applyFriction(velZ);

    // Particles in inactive sectors receive no force, so friction brings them to a halt.
    // Respawn to keep the simulation populated.
    if (abs(velX) < STUCK_VELOCITY_THRESHOLD && abs(velY) < STUCK_VELOCITY_THRESHOLD && abs(velZ) < STUCK_VELOCITY_THRESHOLD) {
      sector = field.getRandomActiveSector();
      resetPosition();
    }
  }

  void display() {
    // Map speed to greyscale: fast particles are dark, slow ones fade to mid-grey
    float speed = sqrt(velX*velX + velY*velY + velZ*velZ) / MAX_SPEED_NORMALIZER;
    float grey = map(speed, 0, 1, SLOW_PARTICLE_GREY, 0);

    noStroke();
    fill(grey, grey, grey);

    pushMatrix();
      translate(posX, posY, posZ);
      sphere(PARTICLE_SIZE);
    popMatrix();
  }

  // Check if the particle has crossed into a neighbouring sector
  private boolean hasMovedSector() {
    int movedX = sectorAxisOffset(posX, sector.getPositionX());
    int movedY = sectorAxisOffset(posY, sector.getPositionY());
    int movedZ = sectorAxisOffset(posZ, sector.getPositionZ());

    if ((movedX != 0) || (movedY != 0) || (movedZ != 0)) {
      int newGridX = movedX + sector.getGridX();
      int newGridY = movedY + sector.getGridY();
      int newGridZ = movedZ + sector.getGridZ();

      // Rounding during sector-transition calculation can produce an out-of-bounds index
      // at the grid boundary. Respawn as a safe recovery.
      int sectorCount = field.getSectorCount();
      if ((newGridX < 0) || (newGridX > sectorCount) ||
          (newGridY < 0) || (newGridY > sectorCount) ||
          (newGridZ < 0) || (newGridZ > sectorCount)) {
        sector = field.getRandomActiveSector();
        resetPosition();
      }
      else {
        sector = field.getSectorAt(newGridX, newGridY, newGridZ);
      }
      return true;
    }
    return false;
  }

  private int sectorAxisOffset(float pos, float sectorPos) {
    float halfSector = SECTOR_RES / 2.0;
    if (pos > sectorPos + halfSector) {
      return 1;
    }
    else if (pos < sectorPos - halfSector) {
      return -1;
    }
    return 0;
  }

  private boolean hasWrappedAround() {
    float radius = field.getRadius();
    if (sq(posX) + sq(posY) + sq(posZ) > sq(radius)) {
      // Teleport to the opposite side of the sphere, slightly inward
      posX *= -PARTICLE_WRAP_BUMP;
      posY *= -PARTICLE_WRAP_BUMP;
      posZ *= -PARTICLE_WRAP_BUMP;

      // Find the sector at the wrapped-around position
      float baseline = (-field.getSectorAt(0, 0, 0).getPositionX()) + (SECTOR_RES / 2);
      int newSecX = int((baseline + posX) / SECTOR_RES);
      int newSecY = int((baseline + posY) / SECTOR_RES);
      int newSecZ = int((baseline + posZ) / SECTOR_RES);
      sector = field.getSectorAt(newSecX, newSecY, newSecZ);
      return true;
    }
    return false;
  }

  // Reduces velocity magnitude by PARTICLE_FRICTION, snapping to zero when below the threshold
  private float applyFriction(float velocity) {
    if (velocity > PARTICLE_FRICTION) {
      return velocity - PARTICLE_FRICTION;
    }
    else if (velocity < -PARTICLE_FRICTION) {
      return velocity + PARTICLE_FRICTION;
    }
    return 0;
  }
}
