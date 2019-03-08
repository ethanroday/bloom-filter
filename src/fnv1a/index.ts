const OFFSET_BASIS_32 = 2166136261;

/**
 * Compute the FNV-1a hash of the given string.
 * Code from https://github.com/sindresorhus/fnv1a, which did not have the
 * correct module configuration to be used as a dependency in an ES6 context.
 * @param string The string for which you want to compute the hash
 */
export default function fnv1a(string: string) {
  let hash = OFFSET_BASIS_32;

  for (let i = 0; i < string.length; i++) {
    hash ^= string.charCodeAt(i);

    // 32-bit FNV prime: 2**24 + 2**8 + 0x93 = 16777619
    // Using bitshift for accuracy and performance. Numbers in JS suck.
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}
