export default class FlowSector {
  /** @type {number} This sector's X index */
  #x;
  /** @type {number} This sector's Y index */
  #y;
  /** @type {number} This sector's Z index */
  #z;

  /**
   * @param {number} x The sector's X index.
   * @param {number} y The sector's Y index.
   * @param {number} z The sector's Z index.
   */
  constructor(x, y, z) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }
}