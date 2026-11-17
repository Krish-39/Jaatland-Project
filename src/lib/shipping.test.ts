import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE,
  orderTotalFor,
  shippingCostFor,
} from "./shipping";

describe("shippingCostFor", () => {
  it("charges the flat rate below the threshold", () => {
    expect(shippingCostFor(24.99)).toBe(SHIPPING_FLAT_RATE);
  });

  it("is free at exactly the threshold and above", () => {
    expect(shippingCostFor(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(shippingCostFor(120)).toBe(0);
  });

  it("charges nothing for an empty or invalid subtotal", () => {
    expect(shippingCostFor(0)).toBe(0);
    expect(shippingCostFor(-5)).toBe(0);
    expect(shippingCostFor(Number.NaN)).toBe(0);
  });
});

describe("orderTotalFor", () => {
  it("adds shipping below the threshold", () => {
    expect(orderTotalFor(24.99)).toBe(29.89);
  });

  it("adds nothing once shipping is free", () => {
    expect(orderTotalFor(49.98)).toBe(49.98);
  });
});
