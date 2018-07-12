import { semverCompatible } from "../../../app/actions/VersionActions";

describe("VersionActions > semverCompatible", () => {
  test("should return correct value when version hasn't changed", () => {
    const compatible = semverCompatible("1.0.0", "1.0.0");
    const compatible2 = semverCompatible("1.1.0", "1.1.0");
    const compatible3 = semverCompatible("2.0.0", "2.0.0");
    const compatible4 = semverCompatible("1.2.3-alfa.1", "1.2.3-alfa.1");
    expect(compatible).toBe(true);
    expect(compatible2).toBe(true);
    expect(compatible3).toBe(true);
    expect(compatible4).toBe(true);
  });

  test("should return correct value when new minor version is available", () => {
    const minorChange = semverCompatible("1.0.1", "1.0.0");
    expect(minorChange).toBe(false);
  });

  test("should return correct value when patch version changed", () => {
    const compatible = semverCompatible("1.1.0", "1.0.0");
    expect(compatible).toBe(false);
  });

  test("should return correct value when major version changed", () => {
    const compatible = semverCompatible("2.0.0", "1.0.0");
    expect(compatible).toBe(false);
  });

  test("should return correct value for pre-releases", () => {
    const compatible = semverCompatible("1.2.3-alfa.1", "1.2.3-alfa.2");
    expect(compatible).toBe(false);
    const compatible3 = semverCompatible("1.2.3-beta.1", "1.2.3-alfa.1");
    expect(compatible3).toBe(false);
  });

  test("should return correct value for mix between release and pre-release", () => {
    const compatible = semverCompatible("1.2.3", "1.2.3-alfa.2");
    expect(compatible).toBe(false);
    const compatible2 = semverCompatible("1.2.4-alfa.1", "1.2.3");
    expect(compatible2).toBe(true);
  });
});
