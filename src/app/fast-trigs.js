// Various ways to get close(ish) approximations of sine/cosine with less CPU power than the real thing

// Things we only want to calculate a single time
const ONE_OVER_PI = 1 / Math.PI;
const FIVE_PI_SQUARED = 5 * Math.PI * Math.PI;
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;
const MINUS_PI = -Math.PI;

// CORDIC consts & lookups
const CORD_ITERATIONS = 10;
const CORD_ANGLES = [
  7.8539816339744830962E-01, 4.6364760900080611621E-01,
  2.4497866312686415417E-01, 1.2435499454676143503E-01,
  6.2418809995957348474E-02, 3.1239833430268276254E-02,
  1.5623728620476830803E-02, 7.8123410601011112965E-03,
  3.9062301319669718276E-03, 1.9531225164788186851E-03,
  9.7656218955931943040E-04, 4.8828121119489827547E-04,
  2.4414062014936176402E-04, 1.2207031189367020424E-04,
  6.1035156174208775022E-05, 3.0517578115526096862E-05,
  1.5258789061315762107E-05, 7.6293945311019702634E-06,
  3.8146972656064962829E-06, 1.9073486328101870354E-06,
  9.5367431640596087942E-07, 4.7683715820308885993E-07,
  2.3841857910155798249E-07, 1.1920928955078068531E-07,
  5.9604644775390554414E-08, 2.9802322387695303677E-08,
  1.4901161193847655147E-08, 7.4505805969238279871E-09,
  3.7252902984619140453E-09, 1.8626451492309570291E-09,
  9.3132257461547851536E-10, 4.6566128730773925778E-10,
  2.3283064365386962890E-10, 1.1641532182693481445E-10,
  5.8207660913467407226E-11, 2.9103830456733703613E-11,
  1.4551915228366851807E-11, 7.2759576141834259033E-12,
  3.6379788070917129517E-12, 1.8189894035458564758E-12,
  9.0949470177292823792E-13, 4.5474735088646411896E-13,
  2.2737367544323205948E-13, 1.1368683772161602974E-13,
  5.6843418860808014870E-14, 2.8421709430404007435E-14,
  1.4210854715202003717E-14, 7.1054273576010018587E-15,
  3.5527136788005009294E-15, 1.7763568394002504647E-15,
  8.8817841970012523234E-16, 4.4408920985006261617E-16,
  2.2204460492503130808E-16, 1.1102230246251565404E-16,
  5.5511151231257827021E-17, 2.7755575615628913511E-17,
  1.3877787807814456755E-17, 6.9388939039072283776E-18,
  3.4694469519536141888E-18, 1.7347234759768070944E-18
];
const CORD_KPROD = [
  0.70710678118654752440, 0.63245553203367586640, 0.61357199107789634961,
  0.60883391251775242102, 0.60764825625616820093, 0.60735177014129595905,
  0.60727764409352599905, 0.60725911229889273006, 0.60725447933256232972,
  0.60725332108987516334, 0.60725303152913433540, 0.60725295913894481363,
  0.60725294104139716351, 0.60725293651701023413, 0.60725293538591350073,
  0.60725293510313931731, 0.60725293503244577146, 0.60725293501477238499,
  0.60725293501035403837, 0.60725293500924945172, 0.60725293500897330506,
  0.60725293500890426839, 0.60725293500888700922, 0.60725293500888269443,
  0.60725293500888161574, 0.60725293500888134606, 0.60725293500888127864,
  0.60725293500888126179, 0.60725293500888125757, 0.60725293500888125652,
  0.60725293500888125626, 0.60725293500888125619, 0.60725293500888125617
];
/**
 * Approximate trig values of a given angle (in radians) using the CORDIC method.
 * @param {number} x Angle to calculate sine/cos for
 * @returns {number[]}
 */
export function cordic(x) {
  //  Shift angle to interval [-pi,pi].
  let theta = x < MINUS_PI
    ? MINUS_PI - (MINUS_PI - x) % TWO_PI + TWO_PI
    : MINUS_PI + (x - MINUS_PI) % TWO_PI;

  //  Shift angle to interval [-pi/2,pi/2] and account for signs.
  let sign_factor;
  if (theta < -0.5 * Math.PI) {
    theta = theta + Math.PI;
    sign_factor = -1.0;
  } else if (0.5 * Math.PI < theta) {
    theta = theta - Math.PI;
    sign_factor = -1.0;
  } else {
    sign_factor = +1.0;
  }

  //  Initialize loop variables:
  let cos = 1.0;
  let sin = 0.0;
  let poweroftwo = 1.0;
  let angle = CORD_ANGLES[0];
  let sigma;

  //  Iterations
  for (let i = 1; i <= CORD_ITERATIONS; i++) {
    if (theta < 0.0) {
      sigma = -1.0;
    } else {
      sigma = 1.0;
    }

    const factor = sigma * poweroftwo;
    const c2 = cos - factor * sin;
    const s2 = factor * cos + sin;

    cos = c2;
    sin = s2;
    //  Update the remaining angle.
    theta = theta - sigma * angle;

    poweroftwo = poweroftwo * 0.5;
    //  Update the angle from table, or eventually by just dividing by two.
    if (CORD_ANGLES.length < i + 1) {
      angle = angle * 0.5;
    } else {
      angle = CORD_ANGLES[i];
    }
  }

  //  Adjust length of output vector to be [cos(beta), sin(beta)]
  //  KPROD is essentially constant after a certain point, so if N is
  //  large, just take the last available value.
  cos = cos * CORD_KPROD[Math.min(CORD_ITERATIONS, CORD_KPROD.length) - 1];
  sin = sin * CORD_KPROD[Math.min(CORD_ITERATIONS, CORD_KPROD.length) - 1];

  //  Adjust for possible sign change because angle was originally not in quadrant 1 or 4.
  return [sin * sign_factor, cos * sign_factor];
}

/**
 * Fast replacement for `Math.sin()` using Bhaskara I's approximation.
 * @param {number} x
 * @returns {number} sine(x) maximum error of about 1.8% (at x = 0, π)
 */
export function bhaskara(x) {
  // this function works for 0 < x < π, so first translate our input to that range
  const translate = x < 0 ? Math.PI : 0;
  const absX = Math.abs(x) + translate;
  const wholePis = Math.floor(absX * ONE_OVER_PI);
  const xlated = absX - wholePis * Math.PI;

  // result should be <= 0 when wholePis is odd (because sine(π < x < 2π) <= 0)
  const flip = (wholePis + 1) % 2 * 2 - 1;

  // calc and return
  const piMinusInput = Math.PI - xlated;
  return 16 * xlated * piMinusInput / (FIVE_PI_SQUARED - 4 * xlated * piMinusInput) * flip;
}

/**
 * Mark's ghetto homebrew attempt at fast trig approximation.
 * Sort-of-sin & sort-of-cos, but all straight lines instead of curves.
 * It's not particularly accurate.
 * @param {number} x the value to calculate trigs for
 * @returns {number[]}
 */
export function diagonal(x) {
  // translate input to positive value, if required
  let flipCos = 1;
  if (x < 0) {
    x = Math.abs(x) + Math.PI;
    flipCos = -1;
  }

  return [
    Math.abs(2 - Math.abs(x - HALF_PI) * ONE_OVER_PI % 2 * 2) - 1,
    (Math.abs(2 - x * ONE_OVER_PI % 2 * 2) - 1) * flipCos
  ];
}