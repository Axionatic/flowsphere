// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/
//
// Instructions: Click and drag to rotate around origin (0,0,0), scroll to zoom 

Quaternion rot;
PVector rotateAround, eulers;
boolean rotApplied;
int sketchScale;
float baseX, baseY;
float deltaX, deltaY;
float fieldRadius;
int secCount;
Sector[][][] sectors;
Particle[] particles;

void setup() {
  size(1440, 900, P3D);
  //fullScreen(P3D);
  frameRate(60);
  colorMode(RGB, COLOR_MAX);
  rot = new Quaternion();
  rotateAround = new PVector(0,0,0);
  eulers = new PVector(0,0,0);
  rotApplied = true;
  sketchScale = INIT_ZOOM;
  fieldRadius = width / RADIUS_DIVISOR;
  
  // build sector arrays. Maybe a bit wasteful to have all these empty sectors,
  // but it saves a lot of trouble in calculating particle movement between sectors
  secCount = int((fieldRadius*2) / SECTOR_RES) + (FIELD_PADDING * 2);
  sectors = new Sector[secCount+1][secCount+1][secCount+1]; // counting is hard
  float radSectors = secCount / 2.0;
  int i = 0;
  for (float x = -radSectors; x <= radSectors; x++) {
    int j = 0;
    float secX = x * SECTOR_RES;
    for (float y = -radSectors; y <= radSectors; y++) {
      int k = 0;
      float secY = y * SECTOR_RES;
      for (float z = -radSectors; z <= radSectors; z++) {
        float secZ = z * SECTOR_RES;
        boolean active = false;
        if (sq(secX) + sq(secY) + sq(secZ) <= sq(fieldRadius)) {
          active = true;
        }
        sectors[i][j][k] = new Sector(i, j, k, secX, secY, secZ, active);
        k++;
      }
      j++;
    }
    i++;
  }
  
  // create Particle array
  particles = new Particle[P_COUNT];
  for (i = 0; i < P_COUNT; i++) {
    particles[i] = new Particle(getSpawnSector());
  }
}

Sector getSpawnSector() {
  Sector spawn = sectors[0][0][0];
  // lazy random starting location. Probably should find a better way
  if (P_RANDOM_SPAWN) {
    while (!spawn.active) {
      spawn = sectors[round(random(-RANDOM_FIX,secCount+RANDOM_FIX))][round(random(-RANDOM_FIX,secCount+RANDOM_FIX))][round(random(-RANDOM_FIX,secCount+RANDOM_FIX))];
    }    
  }
  else {
    int centre = int((secCount+1) / 2);
    spawn = sectors[centre][centre][centre];
  }
  return spawn;
}

void draw() {
  background(COLOR_MAX);
  if (DEBUG && frameCount % 30 == 0) {println(frameRate);}
  if (!rotApplied) {
    // rotation vector is created by moving the mouse 1 or more pixels 
    float a = rotateAround.mag() * MOUSE_SENSITIVITY;
    // need to rotate around the perpendicular (in X,Y) vector
    rotateAround.rotate(HALF_PI);
    // create the rotation... 
    Quaternion rotNext = new Quaternion(a, rotateAround);
     //... then apply it!
    rot = rot.mult(rotNext);
    // and translate into euler angles
    eulers = rot.eulers();
    // remember not to apply the same rotation more than once
    rotApplied = true;
  }
  
  pushMatrix();
    translate(width/2, height/2, 0);
    rotateZ(eulers.z); // why do we have to rotate in this order?
    rotateY(eulers.y); // I actually have no idea!
    rotateX(eulers.x); // It works, though...
    scale(sketchScale * ZOOM_STEP);

    // process sectors
    for (int i = 0; i <= secCount; i++) {
      for (int j = 0; j <= secCount; j++) {
        for (int k = 0; k <= secCount; k++) {
          Sector s = sectors[i][j][k];
          if (s.active) {
            //s.display(); //uncomment to show sector force vectors
            s.update();
          }
        }
      }
    }
    
    // process particles
    noStroke();
    sphereDetail(P_RES);
    for (int i = 0; i < P_COUNT; i++) {
      particles[i].display();
      particles[i].update();
    }
    
    // draw sphere
    noFill();
    stroke(SPHERE_RGB,SPHERE_RGB,SPHERE_RGB,SPHERE_ALPHA);
    strokeWeight(1);
    sphereDetail(SPHERE_RES);
    sphere(fieldRadius);
  popMatrix();
}

// remember where the mouse was when clicked
void mousePressed() {
  baseX = mouseX;
  baseY = mouseY;
}

// create vectors based on mouse movements for rotations
void mouseDragged() {
  if ((baseX != mouseX) || (baseY != mouseY)) {
    deltaX = mouseX - baseX;
    deltaY = mouseY - baseY;
    rotateAround = new PVector(deltaX, deltaY);
    
    baseX = mouseX;
    baseY = mouseY;
    rotApplied = false; // new rotation ready to be applied!
  }
}

void mouseWheel(MouseEvent event) {
  float e = event.getCount();
  sketchScale = constrain(sketchScale - int(e), MIN_ZOOM, MAX_ZOOM);
}
