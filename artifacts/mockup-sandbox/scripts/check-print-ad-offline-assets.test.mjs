import assert from "node:assert/strict";
import test from "node:test";

import { findNetworkResources } from "./check-print-ad-offline-assets.mjs";

test("allows embedded resources and normal clickable destination links", () => {
  const html = `
    <a href="https://bdefarmtrac.co.uk">Visit BDE Farm Trac</a>
    <img src="data:image/png;base64,AAAA" srcset="data:image/png;base64,BBBB 2x">
    <style>.logo { background-image: url(data:image/svg+xml;base64,CCCC) }</style>
  `;

  assert.deepEqual(findNetworkResources(html), []);
});

test("rejects network-loaded HTML resources", () => {
  const html = `
    <img src="./photo.jpg">
    <script src="https://example.com/ad.js"></script>
    <link rel="stylesheet" href="/print.css">
    <link rel="preload" as="font" href="font.woff2">
    <video src="movie.mp4" poster="poster.jpg"><source srcset="small.mp4 1x, large.mp4 2x"></video>
    <audio src="//example.com/audio.mp3"></audio>
  `;

  assert.deepEqual(
    findNetworkResources(html).map(({ kind, value }) => [kind, value]),
    [
      ["img[src]", "./photo.jpg"],
      ["script[src]", "https://example.com/ad.js"],
      ["link[href]", "/print.css"],
      ["link[href]", "font.woff2"],
      ["video[src]", "movie.mp4"],
      ["video[poster]", "poster.jpg"],
      ["source[srcset]", "small.mp4"],
      ["source[srcset]", "large.mp4"],
      ["audio[src]", "//example.com/audio.mp3"],
    ],
  );
});

test("rejects CSS font, image, and imported stylesheet resources", () => {
  const html = `
    <style>
      @import "https://example.com/fonts.css";
      @font-face { src: url('./font.woff2') format('woff2'); }
      .hero { background: url(/hero.jpg); }
    </style>
  `;

  assert.deepEqual(
    findNetworkResources(html).map(({ kind, value }) => [kind, value]),
    [
      ["@import", "https://example.com/fonts.css"],
      ["url()", "./font.woff2"],
      ["url()", "/hero.jpg"],
    ],
  );
});