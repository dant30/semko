import { describe, it, expect } from "vitest";
import { formatNumber, formatAbbreviatedNumber, formatCurrency, formatPercentage } from "./number";

describe("number util", () => {
  it("formatNumber should format simple numeric values", () => {
    expect(formatNumber(1234.56)).toMatch(/1[,\s]?234(\.\d+)?/);
    expect(formatNumber("0")).toBe("0");
    expect(formatNumber(null)).toBe("0");
  });

  it("formatAbbreviatedNumber should produce suffixes", () => {
    expect(formatAbbreviatedNumber(1500)).toMatch(/1\.5K|1,5K/);
    expect(formatAbbreviatedNumber(4000000)).toMatch(/4\.0M|4,0M/);
  });

  it("formatCurrency should return currency string", () => {
    const formatted = formatCurrency(1234.5, "USD", "en-US");
    expect(formatted).toContain("$");
  });

  it("formatPercentage should append % and round", () => {
    expect(formatPercentage(15.123)).toBe("15.1%");
  });
});
