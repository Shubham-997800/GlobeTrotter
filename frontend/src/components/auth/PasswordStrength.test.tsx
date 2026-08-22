import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PasswordStrength, scorePassword } from "./PasswordStrength";

describe("scorePassword", () => {
  it("scores empty passwords as zero", () => {
    expect(scorePassword("")).toBe(0);
  });

  it("rewards length, mixed characters and symbols", () => {
    expect(scorePassword("abc")).toBe(0);
    expect(scorePassword("abcdefgh")).toBe(1); // length only
    expect(scorePassword("abcdefg1")).toBe(2); // length + letter/number
    expect(scorePassword("Abcdefg1")).toBe(3); // + uppercase
    expect(scorePassword("Abcdefghij12")).toBe(4); // + 12 chars
    expect(scorePassword("Abcdefg1!")).toBe(3); // + symbol (still under 12)
  });
});

describe("PasswordStrength", () => {
  it("renders nothing for an empty password", () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a text label alongside the meter", () => {
    render(<PasswordStrength password="Abcdefghij12" id="meter" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.getByText("Strong").closest("div")?.id).toBe("meter");
  });

  it("labels weak passwords instead of relying on color alone", () => {
    render(<PasswordStrength password="abc" />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });
});
