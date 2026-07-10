/**
 * Self-contained MD5 implementation.
 *
 * The browser's Web Crypto (`crypto.subtle.digest`) covers the SHA family but
 * deliberately omits MD5, so we implement it here to keep ToolNest dependency-free.
 * Operates on a UTF-8 byte array and returns a lowercase hex digest.
 *
 * MD5 is a legacy hash — fine for checksums/fingerprinting, not for security.
 */

function toBytesLE(words: number[]): Uint8Array {
  const bytes = new Uint8Array(words.length * 4);
  for (let i = 0; i < words.length; i++) {
    bytes[i * 4] = words[i] & 0xff;
    bytes[i * 4 + 1] = (words[i] >>> 8) & 0xff;
    bytes[i * 4 + 2] = (words[i] >>> 16) & 0xff;
    bytes[i * 4 + 3] = (words[i] >>> 24) & 0xff;
  }
  return bytes;
}

function rotl(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c));
}

/** Compute the MD5 digest of `input` bytes as a lowercase hex string. */
export function md5(input: Uint8Array): string {
  // Per-round shift amounts.
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21,
  ];
  // Precomputed sine-derived constants K[i] = floor(2^32 * abs(sin(i+1))).
  const K: number[] = [];
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32);
  }

  const originalLenBits = input.length * 8;

  // Padding: append 0x80, then zeros, until length ≡ 56 (mod 64), then 64-bit length.
  const paddedLen = ((input.length + 8) >> 6 << 6) + 64;
  const msg = new Uint8Array(paddedLen);
  msg.set(input);
  msg[input.length] = 0x80;
  // Append original length in bits as a 64-bit little-endian integer.
  for (let i = 0; i < 8; i++) {
    msg[paddedLen - 8 + i] =
      Math.floor(originalLenBits / 2 ** (8 * i)) & 0xff;
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let chunk = 0; chunk < paddedLen; chunk += 64) {
    const M: number[] = [];
    for (let i = 0; i < 16; i++) {
      const j = chunk + i * 4;
      M[i] =
        msg[j] | (msg[j + 1] << 8) | (msg[j + 2] << 16) | (msg[j + 3] << 24);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, s[i])) | 0;
    }

    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const digest = toBytesLE([a0, b0, c0, d0]);
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}
