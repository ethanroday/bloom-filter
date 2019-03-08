import fnv1a from "./fnv1a";

interface Stringifiable {
  toString: () => string;
}

/**
 * A simple Bloom filter implementation in Typescript.
 * @param size the desired size of the Bloom filter
 * @param numHashes the number of hash functions to use when adding and checking values
 */
export default class BloomFilter {
  private bitArray: boolean[];
  private numHashes: number;

  constructor(size: number, numHashes: number) {
    this.bitArray = new Array(size).fill(false);
    this.numHashes = numHashes;
  }

  /**
   * Add a value to the set.
   * Values can be of any type but will be stringified
   * if they are not already strings.
   * @param value The value to add
   */
  public add(value: Stringifiable) {
    this.getHashes(value).forEach(index => {
      this.bitArray[index] = true;
    });
  }

  /**
   * Check whether a value might be in the set.
   * @param value The value to check
   * @returns false if the value is definitely not
   * in the set and true if it *might* be in the set.
   */
  public check(value: Stringifiable) {
    return this.getHashes(value).every(index => this.bitArray[index]);
  }

  /**
   * Given a value, compute the indices in the bit array that
   * the value maps to.
   * @param value The value for which to compute hashes
   */
  private getHashes(value: Stringifiable) {
    // First, stringify the value.
    const stringified = this.stringify(value);
    const hashes = new Array(this.numHashes);
    for (let i = 0; i < this.numHashes; i++) {
      hashes[i] = fnv1a(stringified + i) % this.bitArray.length;
    }
    return hashes;
  }

  private stringify(value: Stringifiable) {
    return typeof value === "string" ? value : value.toString();
  }
}
