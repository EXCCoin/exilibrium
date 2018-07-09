import {
  isValidAddress,
  ERR_INVALID_ADDR_EMPTY,
  ERR_INVALID_ADDR_TOOSHORT,
  ERR_INVALID_ADDR_TOOLONG,
  ERR_INVALID_ADDR_CHECKSUM
} from "../../../app/helpers/addresses";

const MAINNET_ADDR = "22u6a9if1v93HQ5sA3ACXyvf1i1m2rpXbZAK";
const MAINNET = "mainnet";

describe("Addresses", () => {
  //MAINNET
  test("Empty address should return ERR_INVALID_ADDR_EMPTY", () => {
    expect(isValidAddress("", MAINNET)).toBe(ERR_INVALID_ADDR_EMPTY);
  });

  test("Address with length < 25 should return ERR_INVALID_ADDR_TOOSHORT", () => {
    expect(isValidAddress("12345678901234567890", MAINNET)).toBe(ERR_INVALID_ADDR_TOOSHORT);
  });

  test("Address with length > 36 should return ERR_INVALID_ADDR_TOOLONG", () => {
    expect(isValidAddress("1234567890123456789012345678901234567890", MAINNET)).toBe(
      ERR_INVALID_ADDR_TOOLONG
    );
  });

  test("Valid mainnet address on mainnet should return null", () => {
    expect(isValidAddress(MAINNET_ADDR, MAINNET)).toBe(null);
  });

  test("Invalid mainnet address on mainnet should return ERR_INVALID_ADDR_CHECKSUM", () => {
    expect(isValidAddress(MAINNET_ADDR.replace("H", "h"), MAINNET)).toBe(ERR_INVALID_ADDR_CHECKSUM);
  });
});
