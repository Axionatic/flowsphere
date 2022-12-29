// class Trig -----------------------
function Trig(cos, sin) {
  this.cos = cos;
  this.sin = sin;
}


// ------------- Cordic variables -------------
// Number of bits for Cordic ratio units (cru).
//  1 = 2^14 = 16384
var NBITS = 14;

// 360 degrees = 65536 Cordic angle units (cau).
var CAU_BASE = 65536;

// Quadrants for angles in Cordic calculations.
var QUAD1 = 1;
var QUAD2 = 2;
var QUAD3 = 3;
var QUAD4 = 4;

var arcTan = [];
var xInit = 0;
var cordicBase = 0;
var halfBase = 0;
var quad2Boundary = 0;
var quad3Boundary = 0;
// --------------------------------------------

/*
 *  Output should be:
 *  ------------------------------------------
 *  theta_cau = 1820, sin = 2847, cos = 16134
 *  theta_cau = 3641, sin = 5605, cos = 15393
 *  theta_cau = 5461, sin = 8191, cos = 14191
 *  theta_cau = 7282, sin = 10531, cos = 12551
 *  ------------------------------------------
 *
 *  These angles are 10 degrees, 20 degrees, 30 degrees, and 40 degrees.
 *   For the first line, 10 degrees = (10 / 360) * 65536 ~ 1820 cau
 *   sin(10 deg) = 0.1736 and 0.1736 * 16384 =  2845.05 ~  2847 cru
 *   cos(10 deg) = 0.9848 and 0.9848 * 16384 = 16135.09 ~ 16134 cru
 */


jQuery(document).ready(function () {
  var theta_cau = 0;
  var sOut = "";

  // Call initially, one time only.  
  sinCosSetup();

  // 10 degrees, 20 degrees, 30 degrees, and 40 degrees.
  for (var theta_degrees = 10; theta_degrees < 50; theta_degrees += 10) {
    theta_cau = Math.floor((theta_degrees * CAU_BASE + 180) / 360);
    var trig = sinCos(theta_cau);
    //printf("theta_cau = %d, sin = %5d, cos = %5d\n", theta_cau, sin, cos);
    sOut += "theta_cau = " + theta_cau + ", sin = " + trig.sin + ", cos = " + trig.cos + "\n";
  }

  $("pre").text(sOut);
});


function sinCosSetup() {
  // USE:  Load globals used by sinCos().
  // OUT:  Loads these globals:
  //        cordicBase    = base for Cordic angle units (cau's)
  //        halfBase      = cordicBase / 2
  //        quad2Boundary = 2 * cordicBase
  //        quad3Boundary = 3 * cordicBase
  //        arcTan[]      = the arctans of 1/(2^i)
  //        xInit         = initial value for x projection
  // NOTE: Must be called once only to initialize before calling sinCos().
  //       xInit is less than cordicBase by exactly the amount required to
  //       compensate for the accumulated expansions in all the rotations.

  var f;      // to calc initial x projection
  var powr;   // powers of 2 up to 2^(2*(NBITS-1))

  cordicBase = 1 << NBITS;
  halfBase = cordicBase >> 1;
  quad2Boundary = cordicBase << 1;
  quad3Boundary = cordicBase + quad2Boundary;

  // arcTans are diminishingly small angles calculated in Cordic ratio units (CRUs).
  powr = 1;
  for (var i = 0; i < NBITS; i++) {
    arcTan[i] = Math.floor(Math.atan(1.0 / powr) / (Math.PI / 2) * cordicBase + 0.5);
    powr <<= 1;
  }

  // xInit is the initial value of the x projection to compensate for all the expansions.
  // f = 1/sqrt(2/1 * 5/4 * ...). Multiply by cordicBase to normalize as an NBITS binary
  // fraction and store in xInit. Calculated values will be f = 0.607253 and xInit = 9949
  // = 0x26DD for NBITS = 14.
  f = 1.0;
  powr = 1;
  for (i = 0; i < NBITS; i++) {
    f = (f * (powr + 1)) / powr;
    powr <<= 2;
  }
  f = 1.0 / Math.sqrt(f);
  xInit = Math.floor(cordicBase * f + 0.5);
}


function sinCos(theta) {
  // USE:  Calculate sin and cos with integer Cordic routine.
  // IN :  theta = incoming angle in Cordic angle units
  // RET:  Trig object with cos and sin in Cordic ratio units
  // NOTE: The incoming angle theta is in Cordic angle units, which subdivide
  //       the circle into 64K parts, with 0 deg = 0, 90 deg = 16384 (CordicBase),
  //       180 deg = 32768, 270 deg = 49152, etc. The calculated sine and cosine
  //       ratios are in Cordic ratio units : an integer considered as a fraction
  //       of 16384 (CordicBase).

  var quadrant;  // quadrant of incoming angle
  var z;         // incoming angle moved to 1st quad
  var x, y;      // projections onto axes
  var x1, y1;    // projections of rotated vector

  // Determine quadrant of incoming angle, translate to
  //  1st quadrant. Note use of previously calculated
  //  values cordicBase, etc. for speed.
  if (theta < cordicBase) {
    quadrant = QUAD1;
    z = theta;
  }
  else if (theta < quad2Boundary) {
    quadrant = QUAD2;
    z = quad2Boundary - theta;
  }
  else if (theta < quad3Boundary) {
    quadrant = QUAD3;
    z = theta - quad2Boundary;
  }
  else {
    quadrant = QUAD4;
    // Line below works with 16-bit ints but fails if ints are larger!
    //z = - ((int) theta);
    z = CAU_BASE - theta;
  }

  // Initialize projections.
  x = xInit;
  y = 0;

  // Negate z, so same rotations taking angle z to 0
  // will take (x, y) = (xInit, 0) to (cos, sin).
  z = -z;

  // Rotate NBITS times.
  for (var i = 0; i < NBITS; i++) {
    if (z < 0) {
      // Counter-clockwise rotation.
      z += arcTan[i];
      y1 = y + (x >> i);
      x1 = x - (y >> i);
    }
    else {
      // Clockwise rotation.
      z -= arcTan[i];
      y1 = y - (x >> i);
      x1 = x + (y >> i);
    }

    // Put new projections into (x,y) for next go.
    x = x1;
    y = y1;
  }  // for i

  // Attach signs depending on quadrant.
  var cos = (quadrant == QUAD1 || quadrant == QUAD4) ? x : -x;
  var sin = (quadrant == QUAD1 || quadrant == QUAD2) ? y : -y;

  var trig = new Trig(cos, sin);
  return trig;
}