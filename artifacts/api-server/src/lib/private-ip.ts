/**
 * Returns true when an IP address is private, reserved, malformed, or otherwise
 * unsafe for a privileged server-side fetch.
 */
export function isPrivateIp(addr: string): boolean {
  const a = addr.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");

  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(a);
  if (v4) {
    const [, o1, o2, o3, o4] = v4.map(Number);
    return (
      [o1, o2, o3, o4].some((octet) => octet < 0 || octet > 255) ||
      o1 === 0 ||
      o1 === 10 ||
      o1 === 127 ||
      (o1 === 100 && o2 >= 64 && o2 <= 127) ||
      (o1 === 169 && o2 === 254) ||
      (o1 === 172 && o2 >= 16 && o2 <= 31) ||
      (o1 === 192 && o2 === 0 && o3 === 0) ||
      (o1 === 192 && o2 === 168) ||
      (o1 === 192 && o2 === 0 && o3 === 2) ||
      (o1 === 192 && o2 === 31 && o3 === 196) ||
      (o1 === 192 && o2 === 52 && o3 === 193) ||
      (o1 === 192 && o2 === 88 && o3 === 99) ||
      (o1 === 198 && (o2 === 18 || o2 === 19)) ||
      (o1 === 198 && o2 === 51 && o3 === 100) ||
      (o1 === 203 && o2 === 0 && o3 === 113) ||
      o1 >= 224
    );
  }

  if (a.includes(":")) {
    const parts = a.includes(".") ? (() => {
      const split = a.lastIndexOf(":");
      const dotted = a.slice(split + 1).split(".").map(Number);
      if (
        dotted.length !== 4 ||
        dotted.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
      ) return null;
      const hexTail =
        `${((dotted[0] << 8) | dotted[1]).toString(16)}:` +
        `${((dotted[2] << 8) | dotted[3]).toString(16)}`;
      return `${a.slice(0, split + 1)}${hexTail}`;
    })() : a;
    if (!parts) return true;

    const halves = parts.split("::");
    if (halves.length > 2) return true;
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
    if (halves.length === 2 && left.length + right.length > 7) return true;
    const groups = halves.length === 2
      ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right]
      : parts.split(":");
    if (
      groups.length !== 8 ||
      groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))
    ) return true;

    const value = groups.reduce(
      (result, group) => (result << 16n) | BigInt(parseInt(group, 16)),
      0n,
    );
    const low32 = Number(value & 0xffffffffn);

    if ((value >> 32n) === 0xffffn || (value >> 32n) === 0n) {
      const mappedV4 =
        `${low32 >>> 24}.${(low32 >>> 16) & 255}.` +
        `${(low32 >>> 8) & 255}.${low32 & 255}`;
      return isPrivateIp(mappedV4) || (value >> 32n) === 0n;
    }
    if (value === 0n || value === 1n) return true;
    if ((value >> 121n) === 0x7en) return true; // fc00::/7 — unique-local

    const top10 = value >> 118n;
    if (top10 >= 0x3fan && top10 <= 0x3fbn) return true; // fe80::/10 + fec0::/10

    if ((value >> 120n) === 0xffn) return true;
    if ((value >> 96n) === 0x20010db8n) return true;
    if ((value >> 80n) === 0x200100000002n) return true;
    return false;
  }

  return true;
}