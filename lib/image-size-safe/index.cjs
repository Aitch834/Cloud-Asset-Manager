"use strict";

const fs = require("node:fs");

const supportedTypes = ["bmp", "gif", "jpg", "ktx", "png", "psd", "svg", "tiff", "webp"];

function fail(message = "unsupported or invalid image") {
  throw new TypeError(message);
}

function inputBuffer(input) {
  if (typeof input === "string") return fs.readFileSync(input);
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }
  return fail("image input must be a file path, Buffer, or Uint8Array");
}

function has(buffer, offset, length) {
  return Number.isSafeInteger(offset) && offset >= 0 && offset + length <= buffer.length;
}

function read24LE(buffer, offset) {
  if (!has(buffer, offset, 3)) fail();
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function dimensions(width, height, type) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) fail();
  return { width, height, type };
}

function png(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) return null;
  return dimensions(buffer.readUInt32BE(16), buffer.readUInt32BE(20), "png");
}

function gif(buffer) {
  if (buffer.length < 10 || !/^GIF8[79]a$/.test(buffer.subarray(0, 6).toString("ascii"))) return null;
  return dimensions(buffer.readUInt16LE(6), buffer.readUInt16LE(8), "gif");
}

function bmp(buffer) {
  if (buffer.length < 26 || buffer.subarray(0, 2).toString("ascii") !== "BM") return null;
  return dimensions(Math.abs(buffer.readInt32LE(18)), Math.abs(buffer.readInt32LE(22)), "bmp");
}

const jpegSizeMarkers = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function jpg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) break;
    const marker = buffer[offset++];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) continue;
    if (!has(buffer, offset, 2)) fail();
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || !has(buffer, offset, segmentLength)) fail();
    if (jpegSizeMarkers.has(marker)) {
      if (segmentLength < 7) fail();
      return dimensions(buffer.readUInt16BE(offset + 5), buffer.readUInt16BE(offset + 3), "jpg");
    }
    offset += segmentLength;
  }
  return fail();
}

function webp(buffer) {
  if (
    buffer.length < 30 ||
    buffer.subarray(0, 4).toString("ascii") !== "RIFF" ||
    buffer.subarray(8, 12).toString("ascii") !== "WEBP"
  ) return null;
  const chunk = buffer.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") {
    return dimensions(1 + read24LE(buffer, 24), 1 + read24LE(buffer, 27), "webp");
  }
  if (chunk === "VP8L") {
    if (!has(buffer, 20, 5) || buffer[20] !== 0x2f) fail();
    const width = 1 + (buffer[21] | ((buffer[22] & 0x3f) << 8));
    const height = 1 + ((buffer[22] >> 6) | (buffer[23] << 2) | ((buffer[24] & 0x0f) << 10));
    return dimensions(width, height, "webp");
  }
  if (chunk === "VP8 ") {
    const end = Math.min(buffer.length - 9, 64);
    for (let offset = 20; offset <= end; offset += 1) {
      if (buffer[offset] === 0x9d && buffer[offset + 1] === 0x01 && buffer[offset + 2] === 0x2a) {
        return dimensions(
          buffer.readUInt16LE(offset + 3) & 0x3fff,
          buffer.readUInt16LE(offset + 5) & 0x3fff,
          "webp",
        );
      }
    }
  }
  return fail();
}

function psd(buffer) {
  if (buffer.length < 26 || buffer.subarray(0, 4).toString("ascii") !== "8BPS") return null;
  return dimensions(buffer.readUInt32BE(18), buffer.readUInt32BE(14), "psd");
}

function svg(buffer) {
  const source = buffer.subarray(0, Math.min(buffer.length, 65536)).toString("utf8");
  if (!/<svg[\s>]/i.test(source)) return null;
  const openingTag = source.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  const numericAttribute = (name) => {
    const value = openingTag.match(new RegExp(`\\b${name}\\s*=\\s*["']\\s*([0-9]+(?:\\.[0-9]+)?)`, "i"));
    return value ? Number(value[1]) : undefined;
  };
  const width = numericAttribute("width");
  const height = numericAttribute("height");
  if (width && height) return dimensions(width, height, "svg");
  const viewBox = openingTag.match(
    /\bviewBox\s*=\s*["']\s*[-+0-9.eE]+\s+[-+0-9.eE]+\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/i,
  );
  if (viewBox) return dimensions(Number(viewBox[1]), Number(viewBox[2]), "svg");
  return fail();
}

function tiff(buffer) {
  if (buffer.length < 8) return null;
  const marker = buffer.subarray(0, 2).toString("ascii");
  if (marker !== "II" && marker !== "MM") return null;
  const littleEndian = marker === "II";
  const read16 = (offset) => {
    if (!has(buffer, offset, 2)) fail();
    return littleEndian ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset);
  };
  const read32 = (offset) => {
    if (!has(buffer, offset, 4)) fail();
    return littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
  };
  if (read16(2) !== 42) return null;
  const directoryOffset = read32(4);
  const entryCount = read16(directoryOffset);
  if (entryCount > 4096) fail();
  let width;
  let height;
  for (let index = 0; index < entryCount; index += 1) {
    const offset = directoryOffset + 2 + index * 12;
    if (!has(buffer, offset, 12)) fail();
    const tag = read16(offset);
    if (tag !== 256 && tag !== 257) continue;
    const type = read16(offset + 2);
    const count = read32(offset + 4);
    if (count < 1 || (type !== 3 && type !== 4)) fail();
    const value = type === 3 ? read16(offset + 8) : read32(offset + 8);
    if (tag === 256) width = value;
    if (tag === 257) height = value;
  }
  return dimensions(width, height, "tiff");
}

const ktx1Signature = "ab4b5458203131bb0d0a1a0a";
const ktx2Signature = "ab4b5458203230bb0d0a1a0a";

function ktx(buffer) {
  if (buffer.length < 28) return null;
  const signature = buffer.subarray(0, 12).toString("hex");
  if (signature === ktx2Signature) {
    return dimensions(buffer.readUInt32LE(20), buffer.readUInt32LE(24), "ktx");
  }
  if (signature !== ktx1Signature || buffer.length < 44) return null;
  const marker = buffer.readUInt32LE(12);
  if (marker === 0x04030201) {
    return dimensions(buffer.readUInt32LE(36), buffer.readUInt32LE(40), "ktx");
  }
  if (marker === 0x01020304) {
    return dimensions(buffer.readUInt32BE(36), buffer.readUInt32BE(40), "ktx");
  }
  return fail();
}

const parsers = [png, gif, bmp, jpg, webp, psd, svg, tiff, ktx];

function imageSize(input) {
  const buffer = inputBuffer(input);
  for (const parser of parsers) {
    const result = parser(buffer);
    if (result) return result;
  }
  return fail();
}

module.exports = imageSize;
module.exports.default = imageSize;
module.exports.imageSize = imageSize;
module.exports.types = supportedTypes;