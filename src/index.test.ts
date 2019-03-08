import BloomFilter from ".";

describe("BloomFilter", () => {
  it("should return true for items that have been added and false for those that haven't", () => {
    const filter = new BloomFilter(10000, 4);
    const present = "abc";
    const absent = "123";
    filter.add(present);
    expect(filter.check(present)).toEqual(true);
    expect(filter.check(absent)).toEqual(false);
  });
});
