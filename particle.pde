// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/

// particles get pushed around the flowsphere
class Particle {
  Sector sec;
  // should these be PVectors? But inside all our loops this is probably more efficient
  float px, py, pz; // pos
  float vx, vy, vz; // velocity
  
  Particle(Sector spawn) {
    sec = spawn;
    setDefaults();
  }
  
  void setDefaults() {
    // random starting position
    float halfSec = SECTOR_RES / 2.0;
    px = sec.px + random(-halfSec, halfSec);
    py = sec.py + random(-halfSec, halfSec);
    pz = sec.pz + random(-halfSec, halfSec);
    
    //starting velocity
    vx = random(P_MIN_VEL, P_MAX_VEL);
    vy = random(P_MIN_VEL, P_MAX_VEL);
    vz = random(P_MIN_VEL, P_MAX_VEL);
  }
  
  void update() {
    vx = constrain(vx + sec.fx, P_MIN_VEL, P_MAX_VEL);
    vy = constrain(vy + sec.fy, P_MIN_VEL, P_MAX_VEL);
    vz = constrain(vz + sec.fz, P_MIN_VEL, P_MAX_VEL);
    px += vx;
    py += vy;
    pz += vz;
    
    // check if we moved to a new sector or if we need to wrap around
    if (!checkWrapAround()) {
      checkMoveNewSec();
    }
    
    // decay velocity according to friction
    vx = applyFriction(vx);
    vy = applyFriction(vy);
    vz = applyFriction(vz);
    
    // sometimes particles get stuck in the dead sectors for some reason
    if (abs(vx) < 0.0001 && abs(vy) < 0.0001 && abs(vz) < 0.0001) {
      sec = getSpawnSector();
      setDefaults();
    }
  }
  
  void display() {
    // the faster a particle is moving, the more colourful it gets
    // use a bit of cleverness to make particles fade to grey rather than black when they slow down
    float speed = sqrt(vx*vx + vy*vy + vz*vz) / sqrt(3.0);
    float f = map(speed, 0, 1, 127, 0);
    
    noStroke();
    fill(f,f,f);
    
    pushMatrix();
      translate(px, py, pz);
      sphere(P_SIZE);
    popMatrix();
  }
  
  // check if we have moved to a new sector
  boolean checkMoveNewSec() {
    int movedX = checkNewSecForAxis(px, sec.px);
    int movedY = checkNewSecForAxis(py, sec.py);
    int movedZ = checkNewSecForAxis(pz, sec.pz);
    
    if ((movedX != 0) || (movedY != 0) || (movedZ != 0)) {
      movedX += sec.ix;
      movedY += sec.iy;
      movedZ += sec.iz;
      // There's some kind of weird edge case where particles occasionally get put out of bounds
      if ((movedX < 0) || (movedX > secCount) ||
          (movedY < 0) || (movedY > secCount) ||
          (movedZ < 0) || (movedZ > secCount)) {
        sec = getSpawnSector();
        setDefaults();
      }
      else {
        sec = sectors[movedX][movedY][movedZ];
      }
      return true;
    }
    return false;
  }
  
  int checkNewSecForAxis(float pos, float secPos) {
    float hs = SECTOR_RES / 2.0;
    if (pos > secPos + hs) {
      return 1;
    }
    else if (pos < secPos - hs) {
      return -1;
    }
    return 0;
  }
  
  boolean checkWrapAround() {
    // if we have left the flowsphere, wrap around
    if (sq(px) + sq(py) + sq(pz) > sq(fieldRadius)) {
      px *= -1;
      py *= -1;
      pz *= -1;
      
      // make sure we are properly inside the new sector
      px *= P_WRAP_BUMP;
      py *= P_WRAP_BUMP;
      pz *= P_WRAP_BUMP;
      
      // find indices of new sector
      float baseline = (sectors[0][0][0].px * -1) + (SECTOR_RES / 2); // py or pz would also work here
      int newSecX = int((baseline + px) / SECTOR_RES);
      int newSecY = int((baseline + py) / SECTOR_RES);
      int newSecZ = int((baseline + pz) / SECTOR_RES);
      sec = sectors[newSecX][newSecY][newSecZ];
      return true;
    }
    return false;
  }
  
  // cheat a bit with friction - don't let the particles come to a *complete* stop
  float applyFriction(float v) {
    if (v > P_FRICTION) {
      return v - P_FRICTION;
    }
    else if (v < -P_FRICTION) {
      return v + P_FRICTION;
    }
    return 0;
  }
}
