import { describe, expect, it } from "vitest";

import { loginSchema } from "./login.schema";
import { registerSchema } from "./register.schema";

describe("loginSchema", () => {
  const valid = { identifier: " demo@globetrotter.app ", password: "Demo@1234", remember: true };

  it("accepts credentials and trims the identifier", () => {
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identifier).toBe("demo@globetrotter.app");
    }
  });

  it("requires both fields", () => {
    expect(loginSchema.safeParse({ ...valid, identifier: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ ...valid, password: "" }).success).toBe(false);
  });
});

const baseRegistration = {
  firstName: "Shubham",
  lastName: "Kumar",
  email: "shubham@example.com",
  phone: "+91 98765 43210",
  city: "Delhi",
  country: "India",
  bio: "",
  avatarUrl: "",
  password: "Passw0rd",
  confirmPassword: "Passw0rd",
  acceptTerms: true,
};

describe("registerSchema", () => {
  it("accepts a complete registration", () => {
    expect(registerSchema.safeParse(baseRegistration).success).toBe(true);
  });

  it("enforces the password policy (8+ chars, letter + number)", () => {
    expect(registerSchema.safeParse({ ...baseRegistration, password: "Sh0rt" }).success).toBe(false);
    expect(
      registerSchema.safeParse({ ...baseRegistration, password: "passwordonly" }).success,
    ).toBe(false);
    expect(registerSchema.safeParse({ ...baseRegistration, password: "12345678" }).success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      ...baseRegistration,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("requires accepting the terms", () => {
    const result = registerSchema.safeParse({ ...baseRegistration, acceptTerms: false });
    expect(result.success).toBe(false);
  });

  it("validates names (letters/spaces/apostrophes/hyphens only)", () => {
    expect(registerSchema.safeParse({ ...baseRegistration, firstName: "A" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...baseRegistration, firstName: "John123" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...baseRegistration, lastName: "O'Brien-Lee" }).success).toBe(true);
  });

  it("allows an optional phone but validates its shape when present", () => {
    expect(registerSchema.safeParse({ ...baseRegistration, phone: "" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...baseRegistration, phone: "abc" }).success).toBe(false);
  });
});
