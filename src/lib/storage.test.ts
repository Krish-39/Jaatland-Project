// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readArray,
  readJson,
  readString,
  removeStored,
  writeJson,
  writeString,
} from "./storage";

beforeEach(() => {
  localStorage.clear();
});

describe("readJson", () => {
  it("returns the fallback for missing keys", () => {
    expect(readJson("missing", { safe: true })).toEqual({ safe: true });
  });

  it("returns the fallback for corrupt JSON", () => {
    localStorage.setItem("broken", "{not-json");
    expect(readJson("broken", [])).toEqual([]);
  });

  it("treats a stored null as missing", () => {
    localStorage.setItem("null", "null");
    expect(readJson("null", "fallback")).toBe("fallback");
  });

  it("parses valid JSON", () => {
    localStorage.setItem("cart", JSON.stringify([{ id: "p1", qty: 2 }]));
    expect(readJson("cart", [])).toEqual([{ id: "p1", qty: 2 }]);
  });
});

describe("readArray", () => {
  it("returns an array for valid arrays", () => {
    localStorage.setItem("list", JSON.stringify(["a", "b"]));
    expect(readArray<string>("list")).toEqual(["a", "b"]);
  });

  it("returns an empty array when the stored value is not an array", () => {
    localStorage.setItem("object", JSON.stringify({ a: 1 }));
    expect(readArray("object")).toEqual([]);
  });
});

describe("writes", () => {
  it("round-trips JSON through readJson", () => {
    expect(writeJson("order", { id: "ORD-1" })).toBe(true);
    expect(readJson("order", null)).toEqual({ id: "ORD-1" });
  });

  it("round-trips plain strings", () => {
    expect(writeString("theme", "dark")).toBe(true);
    expect(readString("theme")).toBe("dark");
  });

  it("returns false instead of throwing when storage is full", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    expect(writeJson("order", {})).toBe(false);
    expect(writeString("theme", "dark")).toBe(false);

    setItem.mockRestore();
  });

  it("removes a key without throwing", () => {
    localStorage.setItem("user", "x");
    removeStored("user");
    expect(localStorage.getItem("user")).toBeNull();
  });
});
