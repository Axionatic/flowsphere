// Various ways to get close(ish) approximations of sine/cosine with less CPU power than the real thing


// Things we only want to calculate a single time
const ONE_OVER_PI = 1 / Math.PI;
const FIVE_PI_SQUARED = 5 * Math.PI * Math.PI;
const HALF_PI = Math.PI * 0.5;

// CORDIC settings
export const CRD_MAX_ITERS = 100;
export const CRD_DEF_ITERS = 20;

// Enums? Never heard of them.
/** Specify that a trig approximation should return sine only */
export const TRIG_SIN = 0;
/** Specify that a trig approximation should return cosine only */
export const TRIG_COS = 1;
/** Specify that a trig approximation should return both sine and cosine */
export const TRIG_BOTH = 2;

// CORDIC lookup tables
const omegaTable = Array.from(Array(100)).map((x, i) => Math.pow(2, -i));
const arctanTable = omegaTable.map(r => Math.atan(r));
/**
 * Approximate trig values of a given angle (in radians) using the CORDIC method.
 * Probably(?) the best choice of all options in this file.
 * @param {number} input Value to calculate sine/cos for
 * @param {number} returnMode Whether to return sine, cosine or both of input. Expected `TRIG_SIN|TRIG_COS|TRIG_BOTH`.
 * Defaults to `TRIG_BOTH`. If returning both, results are in an array `[sine(input), cosine(input)]`.
 * @param {number} iterations Number of calc iterations. Higher = slower but more accurate result.
 * Brief testing indicates that 20 iterations gives approximations accurate to at least 5 decimal places,
 * while 40 iterations gives approximations accurate to at least 10 decimal places.
 * Values above `MAX_ITERS` (100) will be treated as `MAX_ITERS` instead.
 * @returns {number[]|number}
 */
export function cordic(input, returnMode = TRIG_BOTH, iterations = CRD_DEF_ITERS) {
  // translate input to positive value, if required
  let flipCos = 1;
  if (input < 0) {
    input = Math.abs(input) + Math.PI;
    flipCos = -1;
  }

  // init
  let x = 1;
  let y = 0;
  let r = 1;
  const iters = Math.min(iterations, CRD_MAX_ITERS);

  for (let i = 0; i < iters; i++) {
    while (input > arctanTable[i]) {
      // calc next iteration
      let dx = x - y * omegaTable[i];
      let dy = y + x * omegaTable[i];
      let rx = r * Math.sqrt(1 + Math.pow(omegaTable[i], 2));

      // update values
      input -= arctanTable[i];
      x = dx;
      y = dy;
      r = rx;
    }
  }

  if (returnMode == TRIG_SIN)
    return y / r; // Sine = Opposed / hypotenus
  else if (returnMode == TRIG_COS)
    return x / r * flipCos; // Cos = Adjacent / hypotenus
  else
    return [y / r, x / r * flipCos];
}

/**
 * Fast replacement for `Math.sin()` using Bhaskara I's approximation.
 * @param {number} input 
 * @param {number} returnMode Whether to return sine, cosine or both of input. Expected `TRIG_SIN|TRIG_COS|TRIG_BOTH`.
 * Defaults to `TRIG_BOTH`. If returning both, results are in an array `[sine(input), cosine(input)]`.
 * @returns {number[]|number} 
 */
export function bhaskara(input, returnMode = TRIG_BOTH) {
  // unlike the other functions, bhaskara only computes a single result so here we cheat(?) to get cosine
  if (returnMode == TRIG_COS)
    return bhaskara(input + HALF_PI, TRIG_SIN);

  // this function works for 0 < x < π, so first translate our input to that range
  const translate = input < 0 ? Math.PI : 0;
  const absInput = Math.abs(input) + translate;
  const wholePis = Math.floor(absInput * ONE_OVER_PI);
  const x = absInput - wholePis * Math.PI;

  // result should be <= 0 when wholePis is odd (because sine(π < x < 2π) <= 0)
  const flip = (wholePis + 1) % 2 * 2 - 1;

  // calc and return
  const piMinusInput = Math.PI - x;
  if (returnMode == TRIG_SIN)
    return 16 * x * piMinusInput / (FIVE_PI_SQUARED - 4 * x * piMinusInput) * flip;
  else
    return [
      16 * x * piMinusInput / (FIVE_PI_SQUARED - 4 * x * piMinusInput) * flip, //@ts-ignore
      bhaskara(input + HALF_PI, TRIG_SIN)
    ];
}

/**
 * Mark's ghetto homebrew attempt at fast trig approximation.
 * Sort-of-sin & sort-of-cos, but all straight lines instead of curves.
 * It's not particularly accurate.
 * @param {number} x the value to calculate trigs for
 * @param {number} returnMode Whether to return sine, cosine or both of input. Expected `TRIG_SIN|TRIG_COS|TRIG_BOTH`.
 * Defaults to `TRIG_BOTH`. If returning both, results are in an array `[sine(input), cosine(input)]`.
 * @returns {number[]|number}
 */
export function diagonal(x, returnMode = TRIG_BOTH) {
  // translate input to positive value, if required
  let flipCos = 1;
  if (x < 0) {
    x = Math.abs(x) + Math.PI;
    flipCos = -1;
  }

  if (returnMode == TRIG_SIN)
    return Math.abs(2 - Math.abs(x - HALF_PI) * ONE_OVER_PI % 2 * 2) - 1;
  else if (returnMode == TRIG_COS)
    return (Math.abs(2 - x * ONE_OVER_PI % 2 * 2) - 1) * flipCos;
  else
    return [
      Math.abs(2 - Math.abs(x - HALF_PI) * ONE_OVER_PI % 2 * 2) - 1,
      (Math.abs(2 - x * ONE_OVER_PI % 2 * 2) - 1) * flipCos
    ];
}