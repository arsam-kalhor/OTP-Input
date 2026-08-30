import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import OtpInput from "./OtpInput";
import type { OtpStatus } from "./otpUtils";

type HarnessProps = {
  initialValue?: string;
  status?: OtpStatus;
  onComplete?: (value: string) => void;
};

function Harness({ initialValue = "", onComplete = () => undefined, status = "idle" }: HarnessProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      <p id="otp-help">راهنمای کد</p>
      <p id="otp-status">وضعیت کد</p>
      <OtpInput
        focusKey={0}
        status={status}
        value={value}
        onChange={setValue}
        onComplete={onComplete}
      />
      <output data-testid="otp-value">{value}</output>
    </>
  );
}

const getDigits = () =>
  Array.from({ length: 6 }, (_, index) =>
    screen.getByRole("textbox", { name: `رقم ${index + 1} از 6` }),
  );

describe("OtpInput", () => {
  it("exposes an accessible label for every digit", () => {
    render(<Harness />);
    expect(getDigits()).toHaveLength(6);
  });

  it("ignores non-numeric characters", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(getDigits()[0], "letter");
    expect(screen.getByTestId("otp-value").textContent).toBe("");

    await user.type(getDigits()[0], "1");
    expect(screen.getByTestId("otp-value").textContent).toBe("1");
  });

  it("normalizes and completes English, Persian, and Arabic paste values", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    getDigits()[0].focus();
    await user.paste("۱۲٣4۵۶");

    expect(screen.getByTestId("otp-value").textContent).toBe("123456");
    expect(getDigits().map((input) => (input as HTMLInputElement).value).join(""))
      .toBe("123456");
    expect(getDigits().every((input) => input.getAttribute("lang") === "en")).toBe(true);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("truncates paste values longer than six digits", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    getDigits()[0].focus();
    await user.paste("code: 123456789");

    expect(screen.getByTestId("otp-value").textContent).toBe("123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("accepts a partial paste and focuses the next empty digit", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    getDigits()[0].focus();
    await user.paste("۱۲۳");

    expect(screen.getByTestId("otp-value").textContent).toBe("123");
    await waitFor(() => expect(document.activeElement).toBe(getDigits()[3]));
  });

  it("moves back and removes the previous digit when Backspace is pressed on an empty slot", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    getDigits()[0].focus();
    await user.paste("123");
    await user.keyboard("{Backspace}");

    expect(screen.getByTestId("otp-value").textContent).toBe("12");
    await waitFor(() => expect(document.activeElement).toBe(getDigits()[2]));
  });

  it("supports ArrowLeft and ArrowRight navigation", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await waitFor(() => expect(document.activeElement).toBe(getDigits()[0]));
    getDigits()[3].focus();
    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(document.activeElement).toBe(getDigits()[2]));

    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(document.activeElement).toBe(getDigits()[3]));
  });

  it.each(["loading", "success"] as const)("locks every digit while status is %s", (status) => {
    render(<Harness initialValue="123456" status={status} />);
    expect(getDigits().every((input) => (input as HTMLInputElement).readOnly)).toBe(true);
  });
});
