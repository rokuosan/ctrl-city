import { describe, expect, it } from "vitest";
import { isIOSDevice, type NavigatorInfo } from "./platform";

function navigatorInfo(
  overrides: Partial<NavigatorInfo> = {},
): NavigatorInfo {
  return {
    maxTouchPoints: 0,
    platform: "MacIntel",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    ...overrides,
  };
}

describe("isIOSDevice", () => {
  it("detects iPhone and iPad user agents", () => {
    expect(
      isIOSDevice(
        navigatorInfo({
          platform: "iPhone",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X)",
        }),
      ),
    ).toBe(true);
  });

  it("detects iPads using desktop-class user agents", () => {
    expect(isIOSDevice(navigatorInfo({ maxTouchPoints: 5 }))).toBe(true);
  });

  it("does not classify a Mac as iOS", () => {
    expect(isIOSDevice(navigatorInfo())).toBe(false);
  });
});
