import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBanner } from "./ErrorBanner.js";

describe("ErrorBanner Component", () => {
  it("renders the error message", () => {
    render(<ErrorBanner message="Network connection failed" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Network connection failed")).toBeInTheDocument();
  });

  it("shows retry button and calls onRetry callback when clicked", async () => {
    const handleRetry = vi.fn();
    render(<ErrorBanner message="Failed to fetch" onRetry={handleRetry} />);

    const button = screen.getByRole("button", { name: /try again/i });
    expect(button).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(button);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorBanner message="Something broke" />);
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });
});
