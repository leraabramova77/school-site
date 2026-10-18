import { describe, expect, it } from "vitest";
import { parseDesign } from "./design";

describe("parseDesign", () => {
  it("принимает a, b, c в любом регистре", () => {
    expect(parseDesign("a")).toBe("a");
    expect(parseDesign(" C ")).toBe("c");
  });

  it("всё остальное — null", () => {
    expect(parseDesign("d")).toBeNull();
    expect(parseDesign("")).toBeNull();
    expect(parseDesign(null)).toBeNull();
    expect(parseDesign(undefined)).toBeNull();
  });
});
