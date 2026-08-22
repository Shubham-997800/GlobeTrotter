import { describe, expect, it } from "vitest";

import { createTripSchema, emptyTripDraft } from "./create-trip.schema";

const base = emptyTripDraft();

function draftWith(overrides: Partial<typeof base>) {
  return { ...base, ...overrides };
}

describe("createTripSchema — draft mode", () => {
  it("only requires a name", () => {
    const result = createTripSchema("draft").safeParse(draftWith({ name: "Kyoto Escape" }));
    expect(result.success).toBe(true);
  });

  it("rejects a blank name", () => {
    const result = createTripSchema("draft").safeParse(base);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("name");
    }
  });

  it("allows incomplete dates and budget while drafting", () => {
    const result = createTripSchema("draft").safeParse(
      draftWith({ name: "Someday", startDate: "", endDate: "", budgetAmount: "" }),
    );
    expect(result.success).toBe(true);
  });
});

describe("createTripSchema — create mode", () => {
  const validCreate = draftWith({
    name: "Japan Cherry Blossom Escape",
    startDate: "2026-04-01",
    endDate: "2026-04-07",
    destinationId: "dst_kyoto",
    budgetAmount: "120000.50",
  });

  it("accepts a complete trip", () => {
    expect(createTripSchema("create").safeParse(validCreate).success).toBe(true);
  });

  it("requires start date, end date, destination and budget", () => {
    const result = createTripSchema("create").safeParse(
      draftWith({ name: "Incomplete", startDate: "", endDate: "", destinationId: "", budgetAmount: "" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(["startDate", "endDate", "destinationId", "budgetAmount"]),
      );
    }
  });

  it("rejects an end date before the start date", () => {
    const result = createTripSchema("create").safeParse(
      draftWith({ ...validCreate, endDate: "2026-03-31" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "endDate")).toBe(true);
    }
  });

  it("enforces the budget amount rules", () => {
    const schema = createTripSchema("create");

    // Non-numeric / bad precision
    expect(schema.safeParse(draftWith({ ...validCreate, budgetAmount: "12,000" })).success).toBe(false);
    expect(schema.safeParse(draftWith({ ...validCreate, budgetAmount: "10.999" })).success).toBe(false);

    // Below minimum
    expect(schema.safeParse(draftWith({ ...validCreate, budgetAmount: "99" })).success).toBe(false);

    // Above maximum
    expect(schema.safeParse(draftWith({ ...validCreate, budgetAmount: "100000001" })).success).toBe(false);

    // Boundary values pass
    expect(schema.safeParse(draftWith({ ...validCreate, budgetAmount: "100" })).success).toBe(true);
    expect(schema.safeParse(draftWith({ ...validCreate, budgetAmount: "100000000" })).success).toBe(true);
  });

  it("rejects unsupported currencies", () => {
    const result = createTripSchema("create").safeParse(
      draftWith({ ...validCreate, currency: "XYZ" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects unknown interests", () => {
    const result = createTripSchema("create").safeParse(
      draftWith({ ...validCreate, interests: ["bungee"] as never }),
    );
    expect(result.success).toBe(false);
  });
});
