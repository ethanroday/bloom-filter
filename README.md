# Bloom Filter

A simple Bloom filter implementation in Typescript. To get started, clone the repo:

```
git clone https://github.com/ethanroday/bloom-filter
```

Then, install [Yarn](https://yarnpkg.com/) if necessary and run

```
yarn install
```

To run the test suite, run

```
yarn test
```

You can also use the code in another project by importing it directly. If this were a real-world scenario, it would be properly packaged and published on npm.

```typescript
import BloomFilter from "./pathto/bloom-filter/src";

const filter = new BloomFilter({
  size: 10000,            // the desired size of the underlying bit array (commonly seen as m)
  numHashes: 4,           // the number of hash functions to use (commonly seen as k)
  falsePositiveRate: null // the highest acceptable false positive rate (commonly seen as p)
  maxCapacity: null,      // the maximum expected cardinality of the set (commonly seen as n)
  hashFunction: null      // optionally, a custom hash function (by default, uses FNV-1a)
});
```

The constructor accepts the following combinations of property values to maximize flexibility:

- If `size` and `numHashes` are both given, they will be used, regardless of other property values.
- If `maxCapacity` and `size` are given, the optimal `numHashes` will be calculated.
- If `maxCapacity` and `falsePositiveRate` are given, `size` and `numHashes` will be calculated.
- Otherwise, if `size` and/or `numHashes` are given, they will be used, or else default values will be used.

It is also possible to pass no properties object, in which case the defaults for `size` and `numHashes` are used:

```typescript
const filter = new BloomFilter(); // size is 10000 and numHashes is 4
```

## API

### `BloomFilter.add(value: Stringifiable): void`

Add a value to the set.

### `BloomFilter.check(value: Stringifiable): boolean`

Check the set for the given value. If `false`, the value is definitely _not_ in the set. If `true`, the value _may_ be in the set.

### `BloomFilter.getSize(): number`

Get the size of the underlying bit array.

### `BloomFilter.getNumHashes(): number`

Get the number of hash functions being used for adding and checking values.

### `Stringifiable`

An interface representing anything that has a `toString()` method or is already a string.

## Next steps

Given additional time, I would make the following enhancements:

- Allow more combinations of input properties
- Perform more validation on the existing allowed combinations to catch bad values
- Implement more utility functions (e.g. copy, intersect, union)
- Implement a resizable variant that stays within a given false positive tolerance
- Add a build process to properly package this as a distributable module
- Implement performance benchmarks
- Verify correctness of current salting method
