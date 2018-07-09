import sha256 from "js-sha256";
const bs58checkBase = require("bs58check/base");

export const ERR_INVALID_ADDR_EMPTY = "ERR_INVALID_ADDR_EMPTY";
export const ERR_INVALID_ADDR_TOOSHORT = "ERR_INVALID_ADDR_TOOSHORT";
export const ERR_INVALID_ADDR_TOOLONG = "ERR_INVALID_ADDR_TOOLONG";
export const ERR_INVALID_ADDR_NETWORKPREFIX = "ERR_INVALID_ADDR_NETWORKPREFIX";
export const ERR_INVALID_ADDR_CHECKSUM = "ERR_INVALID_ADDR_CHECKSUM";

// isValidAddress performs a simple set of validations for a given address in
// the given network (either testnet or mainnet).
//
// Returns an error identifier or null if the address is valid.
//
// Validations Performed:
// 1) Length - Too short, too long, or empty
// 2) Network - Either mainnet or testnet
// 3) Checksum - https://github.com/bitcoinjs/bs58check/blob/master/test/base.js

// Injected checksum function
function _sha256x2(buffer) {
  buffer = sha256
    .create()
    .update(buffer)
    .digest();
  return sha256
    .create()
    .update(buffer)
    .digest();
}

export function isValidAddress(addr, network) {
  if (!addr || !addr.trim().length) {
    return ERR_INVALID_ADDR_EMPTY;
  }
  if (addr.length < 25) {
    return ERR_INVALID_ADDR_TOOSHORT;
  }
  if (addr.length > 36) {
    return ERR_INVALID_ADDR_TOOLONG;
  }

  if (network === "testnet" && addr[0] !== "T") {
    return ERR_INVALID_ADDR_NETWORKPREFIX;
  }
  if (network === "mainnet" && addr[0] !== "2") {
    return ERR_INVALID_ADDR_NETWORKPREFIX;
  }

  try {
    const bs58check = bs58checkBase(_sha256x2);
    bs58check.decode(addr, _sha256x2);
  } catch (error) {
    return ERR_INVALID_ADDR_CHECKSUM;
  }

  return null;
}
