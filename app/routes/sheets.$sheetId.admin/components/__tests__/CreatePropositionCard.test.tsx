/**
 * @jest-environment jsdom
 */

import { render, screen, act } from "@testing-library/react";
import { forwardRef } from "react";
import type { ComponentType, FormHTMLAttributes } from "react";
import CreatePropositionCard from "../CreatePropositionCard";

let fetcherState: {
  state: string;
  data?: { ok?: boolean };
  Form: ComponentType<FormHTMLAttributes<HTMLFormElement>>;
};

const Form = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(
  ({ children, ...props }, ref) => (
    <form {...props} ref={ref}>
      {children}
    </form>
  )
);
Form.displayName = "FetcherForm";

jest.mock("@remix-run/react", () => ({
  useFetcher: () => fetcherState,
}));

jest.mock("../ImageUploadField", () => ({
  __esModule: true,
  default: () => <div data-testid="image-upload" />,
}));

describe("CreatePropositionCard", () => {
  beforeEach(() => {
    fetcherState = { state: "idle", data: undefined, Form };
  });

  it("shows a new badge by default", () => {
    render(<CreatePropositionCard sheetId="sheet-1" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("shows saving state while submitting", () => {
    fetcherState = { state: "submitting", data: undefined, Form };
    render(<CreatePropositionCard sheetId="sheet-1" />);
    expect(screen.getByText("Saving")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
  });

  it("shows saved state after success then returns to new", () => {
    jest.useFakeTimers();
    const { rerender } = render(<CreatePropositionCard sheetId="sheet-1" />);

    act(() => {
      fetcherState = { state: "idle", data: { ok: true }, Form };
    });
    rerender(<CreatePropositionCard sheetId="sheet-1" />);

    expect(screen.getByText("Saved")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(screen.getByText("New")).toBeInTheDocument();
    jest.useRealTimers();
  });
});
