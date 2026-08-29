import assert from "node:assert/strict";

import { isPrivateIp } from "../src/lib/private-ip";

const blocked = [
  "fe80::",
  "febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
  "fec0::",
  "feff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
  "fc00::",
  "fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
  "::ffff:127.0.0.1",
  "::ffff:169.254.1.2",
  "::192.168.1.2",
  "not-an-ip",
  "2001:::1",
  "1:2:3:4:5:6:7:8::9",
  "gggg::1",
];

for (const address of blocked) {
  assert.equal(isPrivateIp(address), true, `${address} must be blocked`);
}

const allowed = [
  "8.8.8.8",
  "1.1.1.1",
  "::ffff:8.8.8.8",
  "2606:4700:4700::1111",
  "2001:4860:4860::8888",
];

for (const address of allowed) {
  assert.equal(isPrivateIp(address), false, `${address} must remain allowed`);
}

console.log(`Private-IP guard passed ${blocked.length + allowed.length} focused cases.`);