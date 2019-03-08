import fnv1a = require("@sindresorhus/fnv1a");
import BitArray = require("bit-array");
import { PROPERTY_ERROR_PREFIX, DEFAULT_ARRAY_SIZE, DEFAULT_NUM_HASHES } from "./constants";
import { HashFunction, BloomFilterInputProperties, BloomFilterParameters, Stringifiable } from "./types";

/**
 * A simple Bloom filter implementation in Typescript. Takes a configuration object with the following properties:
 *   size: optionally, the desired size of the underlying bit array (commonly seen as m) (default 10000)
 *   numHashes: optionally, the number of hash functions to use when adding and checking values (commonly seen as k) (default 4)
 *   falsePositiveRate: optionally, the highest acceptable false positive rate when checking values (commonly seen as p)
 *   maxCapacity: optionally, the maximum expected cardinality of the set (commonly seen as n)
 *   hashFunction: optionally, a custom hash function used to hash the pre-salted values
 * If size and numHashes are both given, they will be used, regardless of other property values.
 * If maxCapacity and size are given, the optimal numHashes will be calculated.
 * If maxCapacity and falsePositiveRate are given, size and numHashes will be calculated.
 * Otherwise, if size and/or numHashes are given, they will be used, or else default values will be used.
 */
export default class BloomFilter {
  private bitArray: BitArray;
  private numHashes: number;
  private hashFunction: HashFunction;

  constructor(props?: BloomFilterInputProperties) {
    const { size, numHashes } = this.checkProperties(props || {});
    this.numHashes = numHashes;
    this.hashFunction = (props && props.hashFunction) || fnv1a;
    this.bitArray = new BitArray(size);
  }

  /**
   * Validate the input properties and compute size and/or numHashes if needed.
   * @param props The input properties given to the constructor
   */
  private checkProperties({
    size,
    numHashes,
    falsePositiveRate,
    maxCapacity
  }: BloomFilterInputProperties): BloomFilterParameters {
    // Validate the range of the input properties
    if (size <= 0) {
      throw new TypeError(`${PROPERTY_ERROR_PREFIX}: property \`size\` must be greater than 0`);
    }
    if (numHashes <= 0) {
      throw new TypeError(`${PROPERTY_ERROR_PREFIX}: property \`numHashes\` must be greater than 0`);
    }
    if (falsePositiveRate <= 0 || falsePositiveRate > 1) {
      throw new TypeError(
        `${PROPERTY_ERROR_PREFIX}: property \`falsePositiveRate\` must be greater than 0 and less than 1`
      );
    }
    if (maxCapacity <= 0) {
      throw new TypeError(`${PROPERTY_ERROR_PREFIX}: property \`maxCapacity\` must be greater than 0`);
    }

    let sizeCalculated: number, numHashesCalculated: number;
    if (size !== undefined && numHashes !== undefined) {
      // Given size and numHashes, just use them
      sizeCalculated = size;
      numHashesCalculated = numHashes;
    } else if (size !== undefined && maxCapacity !== undefined) {
      // Given maxCapacity and size, calculate numHashes
      sizeCalculated = size;
      numHashesCalculated = this.calculateNumHashes(size, maxCapacity);
    } else if (maxCapacity !== undefined && falsePositiveRate !== undefined) {
      // Given maxCapacity and falsePositiveRate, calculate size and numHashes
      sizeCalculated = this.calculateSize(maxCapacity, falsePositiveRate);
      numHashesCalculated = this.calculateNumHashes(sizeCalculated, maxCapacity);
    } else {
      // Otherwise, use whatever is given and default for the rest
      sizeCalculated = size || DEFAULT_ARRAY_SIZE;
      numHashesCalculated = numHashes || DEFAULT_NUM_HASHES;
    }
    // Return the result
    return {
      size: sizeCalculated,
      numHashes: numHashesCalculated
    };
  }

  /**
   * Add a value to the set.
   * Values can be of any type but will be stringified
   * if they are not already strings.
   * @param value The value to add
   */
  public add(value: Stringifiable) {
    this.getHashes(value).forEach(index => {
      this.bitArray.set(index, true);
    });
  }

  /**
   * Check whether a value might be in the set.
   * @param value The value to check
   * @returns false if the value is definitely not
   * in the set and true if it *might* be in the set.
   */
  public check(value: Stringifiable) {
    return this.getHashes(value).every(index => this.bitArray.get(index));
  }

  /**
   * Return the size of the bit array.
   */
  public getSize() {
    return this.bitArray.size();
  }

  /**
   * Return the number of hash functions being used.
   */
  public getNumHashes() {
    return this.numHashes;
  }

  /**
   * Calculate the optimal number of hashes given the size of the bit
   * array and the expected maximum cardinality of the set.
   * Formula from https://en.wikipedia.org/wiki/Bloom_filter#Probability_of_false_positives
   * @param size The size of the bit array
   * @param maxCapacity The expected maximum cardinality of the set
   */
  private calculateNumHashes(size: number, maxCapacity: number) {
    return Math.round((size / maxCapacity) * Math.log(2));
  }

  /**
   * Calculate the optimal size of the bit array given the expected maximum
   * cardinality of the set and the highest acceptable false positive rate.
   * Formula from https://en.wikipedia.org/wiki/Bloom_filter#Probability_of_false_positives
   * @param maxCapacity The expected maximum cardinality of the set
   * @param falsePositiveRate The highest acceptable false positive rate
   */
  private calculateSize(maxCapacity: number, falsePositiveRate: number) {
    return Math.ceil((-maxCapacity * Math.log(falsePositiveRate)) / Math.log(2) ** 2);
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
      hashes[i] = this.hashFunction(stringified + i) % this.bitArray.size();
    }
    return hashes;
  }

  private stringify(value: Stringifiable) {
    return typeof value === "string" ? value : value.toString();
  }
}
