"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const imageSize = require("./index.cjs");

const png = Buffer.alloc(24);
Buffer.from("89504e470d0a1a0a", "hex").copy(png);
png.writeUInt32BE(320, 16);
png.writeUInt32BE(180, 20);
assert.deepEqual(imageSize(png), { width: 320, height: 180, type: "png" });

const gif = Buffer.alloc(10);
gif.write("GIF89a", 0, "ascii");
gif.writeUInt16LE(40, 6);
gif.writeUInt16LE(30, 8);
assert.deepEqual(imageSize(gif), { width: 40, height: 30, type: "gif" });

const bmp = Buffer.alloc(26);
bmp.write("BM", 0, "ascii");
bmp.writeInt32LE(640, 18);
bmp.writeInt32LE(480, 22);
assert.deepEqual(imageSize(bmp), { width: 640, height: 480, type: "bmp" });

const jpg = Buffer.from("ffd8ffc0000708012c0190ffd9", "hex");
assert.deepEqual(imageSize(jpg), { width: 400, height: 300, type: "jpg" });

const webp = Buffer.alloc(30);
webp.write("RIFF", 0, "ascii");
webp.write("WEBP", 8, "ascii");
webp.write("VP8X", 12, "ascii");
webp[24] = 0xff;
webp[25] = 0x01;
webp[27] = 0x7f;
assert.deepEqual(imageSize(webp), { width: 512, height: 128, type: "webp" });

const psd = Buffer.alloc(26);
psd.write("8BPS", 0, "ascii");
psd.writeUInt32BE(1080, 14);
psd.writeUInt32BE(1920, 18);
assert.deepEqual(imageSize(psd), { width: 1920, height: 1080, type: "psd" });

assert.deepEqual(
  imageSize(Buffer.from('<svg viewBox="0 0 24 16"></svg>')),
  { width: 24, height: 16, type: "svg" },
);

const ktx = Buffer.alloc(44);
Buffer.from("ab4b5458203131bb0d0a1a0a", "hex").copy(ktx);
ktx.writeUInt32LE(0x04030201, 12);
ktx.writeUInt32LE(256, 36);
ktx.writeUInt32LE(128, 40);
assert.deepEqual(imageSize(ktx), { width: 256, height: 128, type: "ktx" });

for (const malicious of [
  Buffer.from("00000000667479706176696600000000", "hex"),
  Buffer.from("69636e73000000106963303700000000", "hex"),
  Buffer.from("ff0a000000000000", "hex"),
]) {
  assert.throws(() => imageSize(malicious), /unsupported or invalid image/);
}

for (const file of ["icon.png", "splash-icon.png"]) {
  const result = imageSize(path.join(__dirname, "../../artifacts/mobile/assets/images", file));
  assert.equal(result.type, "png");
  assert.ok(result.width > 0 && result.height > 0);
}

console.log("safe image-size adapter tests passed");