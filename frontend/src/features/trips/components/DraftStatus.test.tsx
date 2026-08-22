import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DraftStatus } from "./DraftStatus";

describe("DraftStatus", () => {
  it("labels every autosave state", () => {
    const states = [
      ["idle", "Draft"],
      ["dirty", "Unsaved changes"],
      ["saving", "Saving draft…"],
      ["saved", "Draft saved"],
    ] as const;

    for (const [state, label] of states) {
      const { unmount } = render(<DraftStatus state={state} savedAt={null} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("announces status changes to screen readers", () => {
    render(<DraftStatus state="saving" savedAt={null} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
