import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const firstDigit = () => screen.getByRole("textbox", { name: "رقم 1 از 6" });
const allDigits = () => screen.getAllByRole("textbox");

describe("App verification flow", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("locks during verification and keeps a successful code", async () => {
    render(<App />);
    act(() => vi.advanceTimersByTime(0));

    firstDigit().focus();
    fireEvent.paste(firstDigit(), {
      clipboardData: { getData: () => "123456" },
    });

    expect(screen.getByText("در حال بررسی کد…")).toBeTruthy();
    expect(allDigits().every((input) => (input as HTMLInputElement).readOnly)).toBe(true);

    act(() => vi.advanceTimersByTime(650));

    expect(screen.getByText("کد درست است؛ تأیید با موفقیت انجام شد")).toBeTruthy();
    expect(allDigits().map((input) => (input as HTMLInputElement).value).join("")).toBe(
      "123456",
    );
  });

  it("shows an error, shakes, clears the invalid code, and allows retry", async () => {
    const { container } = render(<App />);
    act(() => vi.advanceTimersByTime(0));

    firstDigit().focus();
    fireEvent.paste(firstDigit(), {
      clipboardData: { getData: () => "654321" },
    });
    act(() => vi.advanceTimersByTime(650));

    expect(screen.getByText("کد واردشده نادرست است؛ دوباره تلاش کنید")).toBeTruthy();
    expect(container.querySelector('[role="group"]')?.className).toContain("otp-shake");

    act(() => vi.advanceTimersByTime(350));
    expect(allDigits().every((input) => (input as HTMLInputElement).value === "")).toBe(true);

    fireEvent.change(firstDigit(), { target: { value: "1" } });
    expect((firstDigit() as HTMLInputElement).value).toBe("1");
  });

});
