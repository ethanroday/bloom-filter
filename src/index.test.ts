import BloomFilter from ".";
import { DEFAULT_NUM_HASHES, DEFAULT_ARRAY_SIZE } from "./constants";

describe("BloomFilter", () => {
  it("should return true for items that have been added and false for those that haven't", () => {
    const filter = new BloomFilter({ size: 10000, numHashes: 4 });
    const present = "abcdefgh";
    const absent = "12345678";
    filter.add(present);
    expect(filter.check(present)).toEqual(true);
    expect(filter.check(absent)).toEqual(false);
  });

  describe("when performing input validation", () => {
    it("should validate the size property", () => {
      expect(() => new BloomFilter({ size: 0 })).toThrow();
      expect(() => new BloomFilter({ size: -1 })).toThrow();
      expect(() => new BloomFilter({ size: 1 })).not.toThrow();
    });
    it("should validate the numHashes property", () => {
      expect(() => new BloomFilter({ numHashes: 0 })).toThrow();
      expect(() => new BloomFilter({ numHashes: -1 })).toThrow();
      expect(() => new BloomFilter({ numHashes: 1 })).not.toThrow();
    });
    it("should validate the maxCapacity property", () => {
      expect(() => new BloomFilter({ maxCapacity: 0 })).toThrow();
      expect(() => new BloomFilter({ maxCapacity: -1 })).toThrow();
      expect(() => new BloomFilter({ maxCapacity: 1 })).not.toThrow();
    });
    it("should validate the falsePositiveRate property", () => {
      expect(() => new BloomFilter({ falsePositiveRate: 0 })).toThrow();
      expect(() => new BloomFilter({ falsePositiveRate: 2 })).toThrow();
      expect(() => new BloomFilter({ falsePositiveRate: 0.005 })).not.toThrow();
    });
  });

  describe("when computing property values", () => {
    const size = 100000;
    const numHashes = 4;
    const maxCapacity = 10000;
    const falsePositiveRate = 0.05;

    it("should use size and numHashes if given", () => {
      const filter = new BloomFilter({ size, numHashes, maxCapacity, falsePositiveRate });
      expect(filter.getSize()).toEqual(size);
      expect(filter.getNumHashes()).toEqual(numHashes);
    });

    it("should calculate numHashes given maxCapacity and size", () => {
      const filter = new BloomFilter({ maxCapacity, size });
      const expectedNumHashes = 7; // manually calculated
      expect(filter.getNumHashes()).toEqual(expectedNumHashes);
    });

    it("should calculate size and numHashes given maxCapacity and falsePositiveRate", () => {
      const filter = new BloomFilter({ maxCapacity, falsePositiveRate });
      const expectedSize = 62353; // manually calculated
      const expectedNumHashes = 4; // manually calculated
      expect(filter.getSize()).toEqual(expectedSize);
      expect(filter.getNumHashes()).toEqual(expectedNumHashes);
    });

    it("should use default values if not given enough information", () => {
      const filter = new BloomFilter({ size });
      expect(filter.getSize()).toEqual(size);
      expect(filter.getNumHashes()).toEqual(DEFAULT_NUM_HASHES);

      const anotherFilter = new BloomFilter({ numHashes });
      expect(anotherFilter.getSize()).toEqual(DEFAULT_ARRAY_SIZE);
      expect(anotherFilter.getNumHashes()).toEqual(numHashes);
    });
  });
});
