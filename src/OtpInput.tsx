import { useEffect, useRef, useState } from "react";
import { normalizeOtp, OTP_LENGTH, type OtpStatus } from "./otpUtils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  status: OtpStatus;
  focusKey: number;
  length?: number;
};

export default function OtpInput({
  focusKey,
  length = OTP_LENGTH,
  onChange,
  onComplete,
  status,
  value,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const otpValue = normalizeOtp(value, length);
  const isLocked =
    status === "loading" ||
    status === "success" ||
    (status === "error" && otpValue.length === length);

  const focusInput = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, length - 1));

    window.requestAnimationFrame(() => {
      inputRefs.current[nextIndex]?.focus();
      inputRefs.current[nextIndex]?.select();
    });
  };

  useEffect(() => {
    if (isLocked) return;

    const frame = window.requestAnimationFrame(() => {
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusKey, isLocked]);

  const commitValue = (nextValue: string, nextFocusIndex?: number) => {
    const normalizedValue = normalizeOtp(nextValue, length);
    onChange(normalizedValue);

    if (nextFocusIndex !== undefined && normalizedValue.length < length) {
      focusInput(nextFocusIndex);
    }

    if (normalizedValue.length === length) {
      onComplete(normalizedValue);
    }
  };

  const distributeDigits = (rawValue: string, startIndex: number) => {
    const pastedDigits = normalizeOtp(rawValue, length);
    if (!pastedDigits) return;

    if (pastedDigits.length === length) {
      commitValue(pastedDigits);
      return;
    }

    const safeStartIndex = Math.min(startIndex, otpValue.length);
    const digits = otpValue.padEnd(length, " ").split("");

    pastedDigits.split("").forEach((digit, offset) => {
      const targetIndex = safeStartIndex + offset;
      if (targetIndex < length) digits[targetIndex] = digit;
    });

    const nextValue = digits.join("").replace(/\s/g, "").slice(0, length);
    const nextIndex = Math.min(safeStartIndex + pastedDigits.length, length - 1);
    commitValue(nextValue, nextIndex);
  };

  const removeDigit = (index: number) => {
    if (index < 0 || index >= otpValue.length) return otpValue;
    return `${otpValue.slice(0, index)}${otpValue.slice(index + 1)}`;
  };

  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const nextDigits = normalizeOtp(event.target.value, length);

    if (!nextDigits) {
      commitValue(removeDigit(index), index);
      return;
    }

    if (nextDigits.length > 1) {
      distributeDigits(nextDigits, index);
      return;
    }

    const targetIndex = Math.min(index, otpValue.length);
    const digits = otpValue.split("");
    digits[targetIndex] = nextDigits.at(-1) ?? "";
    const nextValue = digits.join("").slice(0, length);
    commitValue(nextValue, Math.min(targetIndex + 1, length - 1));
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();

      if (!otpValue[index] && index > 0) {
        commitValue(removeDigit(index - 1), index - 1);
        return;
      }

      commitValue(removeDigit(index), index);
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      commitValue(removeDigit(index), index);
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    distributeDigits(event.clipboardData.getData("text"), index);
  };

  return (
    <div
      aria-busy={status === "loading"}
      aria-label="کد تأیید شش رقمی"
      className={`mx-auto mt-5 flex w-full max-w-md gap-2 sm:gap-3 ${
        status === "error" ? "animate-[otp-shake_300ms_ease-in-out]" : ""
      }`}
      dir="ltr"
      role="group"
    >
      {Array.from({ length }, (_, index) => {
        const digit = otpValue.charAt(index);
        const isActive = focusedIndex === index && !isLocked;
        const statusAnimation = status === "success" ? "otp-slot-success" : "";
        const appearance =
          status === "error"
            ? `border-red-500 bg-red-950/45 text-red-50 ${
                isActive ? "shadow-[0_0_16px_rgba(239,68,68,0.45)]" : ""
              }`
            : status === "success"
              ? "border-emerald-500 bg-emerald-950/45 text-emerald-50 shadow-[0_0_14px_rgba(16,185,129,0.35)]"
              : isActive
                ? "border-blue-600 bg-blue-950/45 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.18),0_0_30px_rgba(37,99,235,0.48)]"
                : digit
                  ? "border-blue-600 bg-blue-950/35 text-white shadow-[0_0_22px_rgba(37,99,235,0.3)]"
                  : "border-blue-600/35 bg-blue-950/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_14px_rgba(37,99,235,0.08),0_12px_30px_rgba(0,0,0,0.3)]";

        return (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            aria-describedby="otp-help otp-status"
            aria-invalid={status === "error"}
            aria-label={`رقم ${index + 1} از ${length}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            className={`otp-slot aspect-square min-w-0 flex-1 cursor-default rounded-xl border-2 text-center text-2xl font-semibold caret-transparent outline-none selection:bg-blue-500/30 sm:rounded-2xl sm:text-3xl ${statusAnimation} ${
              digit && status !== "success" ? "animate-[popup_250ms_ease-out]" : ""
            } ${appearance}`}
            dir="ltr"
            inputMode="numeric"
            lang="en"
            maxLength={length}
            name={`otp-digit-${index + 1}`}
            pattern="[0-9]*"
            readOnly={isLocked}
            style={
              status === "success" ? { animationDelay: `${index * 70}ms` } : undefined
            }
            type="text"
            value={digit}
            onBlur={() => setFocusedIndex(null)}
            onChange={(event) => handleChange(index, event)}
            onClick={(event) => event.currentTarget.select()}
            onFocus={(event) => {
              setFocusedIndex(index);
              event.currentTarget.select();
            }}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
          />
        );
      })}
    </div>
  );
}
