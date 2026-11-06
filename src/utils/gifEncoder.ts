/**
 * Pure TypeScript GIF89a Encoder for client-side animated GIF creation.
 * Supports multi-frame ImageData sequences, custom frame delay (ms), looping,
 * 256-color 3-3-2 RGB quantization, and LZW compression.
 */

function quantizePixel332(r: number, g: number, b: number): number {
  const rq = (r >> 5) & 0x07;
  const gq = (g >> 5) & 0x07;
  const bq = (b >> 6) & 0x03;
  return (rq << 5) | (gq << 2) | bq;
}

function build332Palette(): Uint8Array {
  const palette = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const rq = (i >> 5) & 0x07;
    const gq = (i >> 2) & 0x07;
    const bq = i & 0x03;
    palette[i * 3] = Math.round((rq * 255) / 7);
    palette[i * 3 + 1] = Math.round((gq * 255) / 7);
    palette[i * 3 + 2] = Math.round((bq * 255) / 3);
  }
  return palette;
}

function lzwEncode(indices: Uint8Array, minCodeSize = 8): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;

  const outputBytes: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  const emitCode = (code: number, size: number) => {
    bitBuffer |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      outputBytes.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  // Dictionary mapping (prefix << 8) | suffix -> code
  const dict = new Int32Array(4096 * 256);
  dict.fill(-1);

  emitCode(clearCode, codeSize);

  if (indices.length === 0) {
    emitCode(endCode, codeSize);
    if (bitCount > 0) outputBytes.push(bitBuffer & 0xff);
    return new Uint8Array(outputBytes);
  }

  let prefix = indices[0];

  for (let i = 1; i < indices.length; i++) {
    const suffix = indices[i];
    const key = (prefix << 8) | suffix;
    const existing = dict[key];

    if (existing !== -1) {
      prefix = existing;
    } else {
      emitCode(prefix, codeSize);
      if (nextCode < 4096) {
        dict[key] = nextCode;
        if (nextCode === 1 << codeSize && codeSize < 12) {
          codeSize++;
        }
        nextCode++;
      } else {
        emitCode(clearCode, codeSize);
        dict.fill(-1);
        codeSize = minCodeSize + 1;
        nextCode = endCode + 1;
      }
      prefix = suffix;
    }
  }

  emitCode(prefix, codeSize);
  emitCode(endCode, codeSize);

  if (bitCount > 0) {
    outputBytes.push(bitBuffer & 0xff);
  }

  return new Uint8Array(outputBytes);
}

export interface GifFrameInput {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  delayMs?: number;
}

export function encodeGif89a(
  frames: GifFrameInput[],
  defaultDelayMs = 120,
  loop = true
): Uint8Array {
  if (frames.length === 0) {
    throw new Error('At least one frame is required to encode a GIF.');
  }

  const width = frames[0].width;
  const height = frames[0].height;
  const bytes: number[] = [];

  const writeByte = (b: number) => bytes.push(b & 0xff);
  const writeShort = (s: number) => {
    bytes.push(s & 0xff, (s >> 8) & 0xff);
  };
  const writeAscii = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) & 0xff);
    }
  };

  // 1. Header: GIF89a
  writeAscii('GIF89a');

  // 2. Logical Screen Descriptor
  writeShort(width);
  writeShort(height);
  writeByte(0xf7); // Global color table flag (1), color res (7), sort (0), size of GCT (7 -> 256 colors)
  writeByte(0); // Background color index
  writeByte(0); // Pixel aspect ratio

  // 3. Global Color Table (256 * 3 bytes)
  const palette = build332Palette();
  for (let i = 0; i < palette.length; i++) {
    writeByte(palette[i]);
  }

  // 4. Netscape 2.0 Application Extension for infinite looping
  if (loop) {
    writeByte(0x21); // Extension Introducer
    writeByte(0xff); // Application Extension Label
    writeByte(11); // Block Size
    writeAscii('NETSCAPE2.0');
    writeByte(3); // Sub-block size
    writeByte(1); // Sub-block ID
    writeShort(0); // Loop count (0 = infinite)
    writeByte(0); // Block terminator
  }

  // 5. Encode each frame
  for (const frame of frames) {
    const delayCs = Math.max(2, Math.round((frame.delayMs ?? defaultDelayMs) / 10));

    // Graphic Control Extension
    writeByte(0x21);
    writeByte(0xf9);
    writeByte(4);
    writeByte(0x04); // Disposal method 1 (do not dispose)
    writeShort(delayCs);
    writeByte(0); // Transparent color index (unused)
    writeByte(0); // Terminator

    // Image Descriptor
    writeByte(0x2c);
    writeShort(0); // Left
    writeShort(0); // Top
    writeShort(width);
    writeShort(height);
    writeByte(0x00); // No local color table

    // Quantize RGBA pixels to 8-bit 3-3-2 palette indices
    const pixelCount = width * height;
    const indexed = new Uint8Array(pixelCount);
    const rgba = frame.data;
    for (let p = 0; p < pixelCount; p++) {
      const offset = p * 4;
      const a = rgba[offset + 3];
      if (a < 16) {
        // Blend transparent pixels onto dark slate (#0f172a)
        indexed[p] = quantizePixel332(15, 23, 42);
      } else {
        indexed[p] = quantizePixel332(rgba[offset], rgba[offset + 1], rgba[offset + 2]);
      }
    }

    // LZW Minimum Code Size = 8
    writeByte(8);
    const compressed = lzwEncode(indexed, 8);
    let offset = 0;
    while (offset < compressed.length) {
      const chunkLen = Math.min(255, compressed.length - offset);
      writeByte(chunkLen);
      for (let k = 0; k < chunkLen; k++) {
        writeByte(compressed[offset + k]);
      }
      offset += chunkLen;
    }
    writeByte(0); // Sub-block terminator
  }

  // 6. GIF Trailer
  writeByte(0x3b);

  return new Uint8Array(bytes);
}
