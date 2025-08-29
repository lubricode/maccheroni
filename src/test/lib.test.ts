import { describe, expect, it } from "@jest/globals";
import { unique } from "../lib/array";

describe("unique function", () => {
  it("returns unique item of an array", () => {
    expect(unique([1, 1])).toEqual(1);
  });

  it("returns nil if array items are not unique", () => {
    expect(unique([1, 2]) ?? null).toBeNull();
  });
});
