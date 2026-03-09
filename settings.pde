// licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
// https://creativecommons.org/licenses/by-sa/4.0/

// mess with these to change the sketch's behaviour
final float MOUSE_SENSITIVITY = 0.01; // affects click and drag to rotate
final int INIT_ZOOM = 20; // initial zoom (remember this will be multiplied by ZOOM_STEP!)
final float ZOOM_STEP = 0.0625; // how much we zoom in/out by on mouse wheel
final int MIN_ZOOM = 1; // minimum zoom level
final int MAX_ZOOM = 160; // maximum zoom level
final int SPHERE_RGB = 200; // sphere RGB
final int SPHERE_ALPHA = 100; // sphere alpha
final int SPHERE_RES = 20; // how finely our sphere is drawn

// sector settings
final int SECTOR_RES = 20; // each sector of the flow field is n*n*n pixels
final int RADIUS_DIVISOR = 3; // field radius = sketch width divided by this number
final int FIELD_PADDING = 1; // (minimum) number of empty sectors around edge of flowsphere.
final int NOISE_OFFSET = 10000; // noise offset (probably don't change this)
final float NOISE_SPEED = 0.005; // rate at which we move through Perlin Noise
final float NOISE_INFLUENCE = 0.25; // strength of vectors created by noise

// particle settings
final int P_COUNT = 10000; // number of particles
final int P_SIZE = 2; // particle size
final int P_RES = 3; // each particle is actually a tiny sphere, this determines how finely they are drawn
final float P_MIN_VEL = -1; // minimum particle velocity (in X/Y/Z)
final float P_MAX_VEL = 1; // maximum particle velocity (in X/Y/Z)
final float P_FRICTION = 0.01; // particle velocity decay
final boolean P_RANDOM_SPAWN = true; // should particles spawn in random starting sectors? Or the centre?
final float P_WRAP_BUMP = 0.99; // move particles inwards slightly after wrapping

final boolean DEBUG = false;
