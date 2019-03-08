export type HashFunction = (value: string) => number;

export interface BloomFilterParameters {
  size: number;
  numHashes: number;
}

/**
 * An interface representing anything that can be stringified.
 */
export interface Stringifiable {
  toString: () => string;
}

/**
 * An interface for the Bloom filter input properties object.
 */
export interface BloomFilterInputProperties extends Partial<BloomFilterParameters> {
  falsePositiveRate?: number;
  maxCapacity?: number;
  hashFunction?: HashFunction;
}
