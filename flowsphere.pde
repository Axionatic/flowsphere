// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/
//
// Instructions: Click and drag to rotate around origin (0,0,0), scroll to zoom

Quaternion rotation;
PVector rotateAround, eulers;
boolean rotApplied;
int sketchScale;
float dragStartX, dragStartY;
float dragDeltaX, dragDeltaY;
FlowField flowField;
Particle[] particles;

void setup() {
  size(1440, 900, P3D);
  frameRate(60);
  colorMode(RGB, 255);
  rotation = new Quaternion();
  rotateAround = new PVector(0, 0, 0);
  eulers = new PVector(0, 0, 0);
  rotApplied = true;
  sketchScale = INIT_ZOOM;

  flowField = new FlowField(width / RADIUS_DIVISOR);

  particles = new Particle[PARTICLE_COUNT];
  for (int i = 0; i < PARTICLE_COUNT; i++) {
    particles[i] = new Particle(flowField, flowField.getRandomActiveSector());
  }
}

void draw() {
  background(255);
  if (DEBUG && frameCount % DEBUG_FRAME_INTERVAL == 0) { println(frameRate); }
  if (!rotApplied) {
    // Rotation vector is created by moving the mouse 1 or more pixels
    float a = rotateAround.mag() * MOUSE_SENSITIVITY;
    // Need to rotate around the perpendicular (in X,Y) vector
    rotateAround.rotate(HALF_PI);
    Quaternion rotNext = new Quaternion(a, rotateAround);
    rotation = rotation.mult(rotNext);
    rotation.normalize();
    // ZYX extrinsic Euler convention (yaw-pitch-roll), matching the eulers() decomposition
    eulers = rotation.eulers();
    rotApplied = true;
  }

  pushMatrix();
    translate(width/2, height/2, 0);
    rotateZ(eulers.z);
    rotateY(eulers.y);
    rotateX(eulers.x);
    scale(sketchScale * ZOOM_STEP);

    flowField.update();
    if (DEBUG) { flowField.displayDebug(); }

    noStroke();
    sphereDetail(PARTICLE_SPHERE_DETAIL);
    for (int i = 0; i < PARTICLE_COUNT; i++) {
      particles[i].display();
      particles[i].update();
    }

    // Draw sphere wireframe
    noFill();
    stroke(SPHERE_RGB, SPHERE_RGB, SPHERE_RGB, SPHERE_ALPHA);
    strokeWeight(1);
    sphereDetail(SPHERE_RES);
    sphere(flowField.getRadius());
  popMatrix();
}

void mousePressed() {
  dragStartX = mouseX;
  dragStartY = mouseY;
}

void mouseDragged() {
  if ((dragStartX != mouseX) || (dragStartY != mouseY)) {
    dragDeltaX = mouseX - dragStartX;
    dragDeltaY = mouseY - dragStartY;
    rotateAround = new PVector(dragDeltaX, dragDeltaY);

    dragStartX = mouseX;
    dragStartY = mouseY;
    rotApplied = false;
  }
}

void mouseWheel(MouseEvent event) {
  float scrollAmount = event.getCount();
  sketchScale = constrain(sketchScale - int(scrollAmount), MIN_ZOOM, MAX_ZOOM);
}
