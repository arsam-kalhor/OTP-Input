import { useEffect, useRef, useState } from "react";
import OtpInput from "./OtpInput";
import { OTP_LENGTH, type OtpStatus } from "./otpUtils";

const CORRECT_OTP = "123456";
const VERIFICATION_DELAY_MS = 650;
const ERROR_DISPLAY_MS = 350;

function App() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [focusKey, setFocusKey] = useState(0);
  const verificationTimerRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (verificationTimerRef.current !== null) {
        window.clearTimeout(verificationTimerRef.current);
      }
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const clearPendingVerification = () => {
    if (verificationTimerRef.current !== null) {
      window.clearTimeout(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  };

  const handleValueChange = (nextValue: string) => {
    if (status === "loading" || status === "success") return;
    if (status === "error") setStatus("idle");
    setValue(nextValue);
  };

  const handleComplete = (code: string) => {
    if (status === "loading" || status === "success") return;

    clearPendingVerification();
    setStatus("loading");

    verificationTimerRef.current = window.setTimeout(() => {
      verificationTimerRef.current = null;

      if (code === CORRECT_OTP) {
        setStatus("success");
        return;
      }

      setStatus("error");
      errorTimerRef.current = window.setTimeout(() => {
        setValue("");
        setFocusKey((current) => current + 1);
        errorTimerRef.current = null;
      }, ERROR_DISPLAY_MS);
    }, VERIFICATION_DELAY_MS);
  };

  const statusContent = {
    idle: value.length > 0 ? `${value.length} از ${OTP_LENGTH} رقم` : "",
    loading: "در حال بررسی کد…",
    error: "کد واردشده نادرست است؛ دوباره تلاش کنید",
    success: "کد درست است؛ تأیید با موفقیت انجام شد",
  }[status];

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-4 py-10">
      <section
        className="relative flex w-full max-w-xl flex-col items-center gap-8 overflow-hidden rounded-4xl border border-white/[0.07] bg-[#070812]/95 px-5 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:px-10 sm:py-12"
        dir="rtl"
      >
        <div className="pointer-events-none absolute -top-28 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 h-64 w-64 rounded-full bg-blue-700/15 blur-3xl" />

        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-400/10 text-xl shadow-[0_0_30px_rgba(37,99,235,0.22)]">
            <span aria-hidden="true">✦</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              تأیید شماره موبایل
            </h1>
            <p id="otp-help" className="max-w-sm text-sm leading-7 text-slate-400">
              کد شش رقمی ارسال‌شده را وارد کنید
            </p>
          </div>

          <p className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
            کد صحیح برای تست: <b dir="ltr">{CORRECT_OTP}</b>
          </p>
        </div>

        <OtpInput
          focusKey={focusKey}
          status={status}
          value={value}
          onChange={handleValueChange}
          onComplete={handleComplete}
        />

        <div className="flex min-h-6 flex-col items-center text-center">
          <p
            id="otp-status"
            aria-live="polite"
            className={`flex min-h-6 items-center gap-2 text-sm font-medium transition-colors ${
              status === "error"
                ? "text-red-400"
                : status === "success"
                  ? "text-emerald-400"
                  : status === "loading"
                    ? "text-blue-300"
                    : "text-slate-500"
            }`}
          >
            {status === "loading" && (
              <span
                aria-hidden="true"
                className="size-3.5 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300"
              />
            )}
            {status === "success" && <span aria-hidden="true">✓</span>}
            {statusContent}
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
