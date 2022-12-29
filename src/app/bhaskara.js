// Helpful things for bhaskaraSine
const ONE_OVER_PI = 1 / Math.PI;
const FIVE_PI_SQUARED = 5 * Math.PI * Math.PI;
const HALF_PI = Math.PI * 0.5;

/**
 * Fast replacement for `Math.sin()` using Bhaskara I's approximation.
 * @param {number} input 
 * @returns {number} 
 */
export function bhSin(input) {
  // this function works for 0 < x < π, so first translate our input to that range
  const translate = input < 0 ? Math.PI : 0;
  const absInput = Math.abs(input) + translate;
  const wholePis = Math.floor(absInput * ONE_OVER_PI);
  const x = absInput - wholePis * Math.PI;

  // result should be <= 0 when wholePis is odd (because sine(π < x < 2π) <= 0)
  const flip = (wholePis + 1) % 2 * 2 - 1;

  // calc and return
  const piMinusInput = Math.PI - x;
  return 16 * x * piMinusInput / (FIVE_PI_SQUARED - 4 * x * piMinusInput) * flip;
}

/**
 * Fast replacement for `Math.cos()` using Bhaskara I's approximation.
 * @param {number} input 
 * @returns {number} 
 */
export function bhCos(input) { return bhSin(input + HALF_PI); }
