import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EnquiryForm } from "./EnquiryForm.js";
import * as clientApi from "../../api/client.js";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("EnquiryForm Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it("renders all form fields and submit button", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EnquiryForm productId={1} productTitle="Test Product" />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit enquiry/i })
    ).toBeInTheDocument();
  });

  it("displays client-side validation errors when submitting empty form", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EnquiryForm productId={1} productTitle="Test Product" />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const user = userEvent.setup();
    const submitBtn = screen.getByRole("button", { name: /submit enquiry/i });
    await user.click(submitBtn);

    expect(screen.getByText("First name is required")).toBeInTheDocument();
    expect(screen.getByText("Last name is required")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Message is required")).toBeInTheDocument();
  });

  it("submits valid form data and navigates to /thank-you", async () => {
    const submitSpy = vi.spyOn(clientApi, "submitEnquiry").mockResolvedValue({
      message: "Success",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EnquiryForm productId={1} productTitle="Test Product" />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email address/i), "john@example.com");
    await user.type(screen.getByLabelText(/phone number/i), "1234567890");
    await user.type(screen.getByLabelText(/message/i), "I want to buy 5 items.");

    await user.click(screen.getByRole("button", { name: /submit enquiry/i }));

    expect(submitSpy).toHaveBeenCalledWith({
      productId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "1234567890",
      message: "I want to buy 5 items.",
    });

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/thank-you", {
        state: { submitted: true, productTitle: "Test Product" },
      });
    });
  });
});
