import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { SearchBar } from "./SearchBar.js";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SearchBar Component", () => {
  it("renders search input and button", () => {
    render(
      <BrowserRouter>
        <SearchBar placeholder="Search test..." />
      </BrowserRouter>
    );

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search test...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("navigates to /search?q=... when query is submitted", async () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search products/i);
    const user = userEvent.setup();

    await user.type(input, "jacket");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/search?q=jacket");
  });

  it("trims whitespace from search term", async () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search products/i);
    const user = userEvent.setup();

    await user.type(input, "   shoes   ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/search?q=shoes");
  });

  it("does not navigate when search input is empty or only whitespace", async () => {
    mockNavigate.mockClear();
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search products/i);
    const user = userEvent.setup();

    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
