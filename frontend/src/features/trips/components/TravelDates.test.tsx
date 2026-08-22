import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { TravelDates } from "./TravelDates";

function renderDates(props?: Partial<Parameters<typeof TravelDates>[0]>) {
  return render(
    <TravelDates
      startDate=""
      endDate=""
      onStartDateChange={() => {}}
      onEndDateChange={() => {}}
      {...props}
    />,
  );
}

describe("TravelDates", () => {
  it("renders both date fields", () => {
    renderDates();
    expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    expect(screen.getByLabelText("End date")).toBeInTheDocument();
  });

  it("shows the duration pill for a complete range", () => {
    renderDates({ startDate: "2026-04-01", endDate: "2026-04-07" });
    expect(screen.getByText(/7 days/)).toBeInTheDocument();
    expect(screen.getByText(/6 nights/)).toBeInTheDocument();
  });

  it("uses singular wording for a one-day trip", () => {
    renderDates({ startDate: "2026-04-01", endDate: "2026-04-01" });
    expect(screen.getByText(/1 day/)).toBeInTheDocument();
    expect(screen.getByText(/0 nights/)).toBeInTheDocument();
  });

  it("hides the duration when the range is invalid", () => {
    const { container } = renderDates({
      startDate: "2026-04-07",
      endDate: "2026-04-01",
    });
    expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement();
  });

  it("surfaces field errors accessibly", () => {
    renderDates({
      startDate: "",
      endDate: "",
      errors: { startDate: "Pick a start date." },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a start date.");
    expect(screen.getByLabelText("Start date")).toHaveAttribute("aria-invalid", "true");
  });

  it("propagates changes upward", () => {
    const onStartDateChange = vi.fn();
    renderDates({ onStartDateChange });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-05-01" },
    });
    expect(onStartDateChange).toHaveBeenCalledWith("2026-05-01");
  });
});
