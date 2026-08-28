import assert from "node:assert/strict";
import { getImapConnectionConfig } from "../src/lib/imap";

assert.deepEqual(getImapConnectionConfig({}), {
  host: "imap.123-reg.co.uk",
  port: 993,
  user: "hello@bdefarmtrac.co.uk",
  proxyUrl: undefined,
  connectionTimeout: 15_000,
});

assert.deepEqual(
  getImapConnectionConfig({
    TITAN_IMAP_HOST: " mail.example.test ",
    TITAN_IMAP_PORT: "1993",
    TITAN_IMAP_USER: " inbox@example.test ",
    TITAN_IMAP_PROXY_URL: " socks5://user:pass@proxy.example.test:1080 ",
    TITAN_IMAP_CONNECTION_TIMEOUT_MS: "7000",
  }),
  {
    host: "mail.example.test",
    port: 1993,
    user: "inbox@example.test",
    proxyUrl: "socks5://user:pass@proxy.example.test:1080",
    connectionTimeout: 7000,
  },
);

assert.equal(getImapConnectionConfig({ TITAN_IMAP_PORT: "invalid" }).port, 993);
assert.equal(
  getImapConnectionConfig({ TITAN_IMAP_CONNECTION_TIMEOUT_MS: "-1" }).connectionTimeout,
  15_000,
);

console.log("Titan IMAP configuration tests passed");