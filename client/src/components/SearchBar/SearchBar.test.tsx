import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { SearchBar } from "./SearchBar.js";
import type { Product } from "../../types/index.js";

// ── Mock react-router-dom navigate ───────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── Mock the api client so tests never make real network calls ───────────────
const mockSearchProducts = vi.fn();
vi.mock("../../api/client.js", () => ({
  searchProducts: (...args: unknown[]) => mockSearchProducts(...args),
}));

/** Minimal Product fixture for dropdown tests */
function makeProduct(id: number, title: string): Product {
  return {
    id,
    title,
    price: 9.99 + id,
    description: "A product",
    category: "electronics",
    image: `https://fakestoreapi.com/img/${id}.jpg`,
    rating: { rate: 4.5, count: 100 },
  };
}

const SUGGESTIONS: Product[] = [
  makeProduct(1, "Wireless Keyboard"),
  makeProduct(2, "Wireless Mouse"),
  makeProduct(3, "Wireless Headphones"),
];

function renderSearchBar(props?: React.ComponentProps<typeof SearchBar>) {
  return render(
    <BrowserRouter>
      <SearchBar debounceMs={0} {...props} />
    </BrowserRouter>
  );
}

beforeEach(() => {
  mockNavigate.mockClear();
  mockSearchProducts.mockClear();
  // Default: return empty so the dropdown does not open in tests that don't need it
  mockSearchProducts.mockResolvedValue([]);
});

// ── Existing / core behaviour ────────────────────────────────────────────────
describe("SearchBar Component", () => {
  it("renders search input and button", () => {
    renderSearchBar({ placeholder: "Search test..." });

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search test...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search/i })
    ).toBeInTheDocument();
  });

  it("navigates to /search?q=... when query is submitted", async () => {
    renderSearchBar();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search products/i);
    await user.type(input, "jacket");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/search?q=jacket");
  });

  it("trims whitespace from search term", async () => {
    renderSearchBar();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search products/i);
    await user.type(input, "   shoes   ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/search?q=shoes");
  });

  it("does not navigate when search input is empty or only whitespace", async () => {
    mockNavigate.mockClear();
    renderSearchBar();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search products/i);
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ── Dropdown / real-time suggestion behaviour ───────────────────────────────
  describe("real-time suggestion dropdown", () => {
    it("does NOT call searchProducts for fewer than 3 characters", async () => {
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "wi"); // only 2 chars

      expect(mockSearchProducts).not.toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("fetches suggestions after 3+ characters and shows dropdown", async () => {
      mockSearchProducts.mockResolvedValue(SUGGESTIONS);
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "wire");

      await waitFor(() => {
        expect(mockSearchProducts).toHaveBeenCalledWith("wire");
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // All 3 suggestions should appear
      expect(screen.getByText("Wireless Keyboard")).toBeInTheDocument();
      expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
      expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    });

    it("navigates to /products/:id when a suggestion item receives mousedown", async () => {
      mockSearchProducts.mockResolvedValue(SUGGESTIONS);
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "wire");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const options = screen.getAllByRole("option");
      expect(options[0]).toBeDefined();
      fireEvent.mouseDown(options[0]!);

      expect(mockNavigate).toHaveBeenCalledWith("/products/1");
    });

    it("navigates to product page via ArrowDown + Enter keyboard navigation", async () => {
      mockSearchProducts.mockResolvedValue(SUGGESTIONS);
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "wire");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(mockNavigate).toHaveBeenCalledWith("/products/1");
    });

    it("cycles ArrowDown past the last item back to the first", async () => {
      mockSearchProducts.mockResolvedValue(SUGGESTIONS);
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "wire");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // 3 suggestions → press ArrowDown 4 times → wraps back to index 0
      await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(mockNavigate).toHaveBeenCalledWith("/products/1");
    });

    it("closes dropdown on Escape key", async () => {
      mockSearchProducts.mockResolvedValue(SUGGESTIONS);
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "wire");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("does not open dropdown when searchProducts returns empty array", async () => {
      mockSearchProducts.mockResolvedValue([]);
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "xyzzy");

      await waitFor(() => {
        expect(mockSearchProducts).toHaveBeenCalledWith("xyzzy");
      });

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("pressing Search button with open dropdown navigates to search results page", async () => {
      mockSearchProducts.mockResolvedValue(SUGGESTIONS);
      const user = userEvent.setup();
      renderSearchBar();

      const input = screen.getByPlaceholderText(/search products/i);
      await user.type(input, "wire");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /search/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/search?q=wire");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});
