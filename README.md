<div align="center">

# React OTP Verification UI

An accessible, responsive OTP verification experience with multilingual digits, keyboard navigation, paste support, and polished validation states.

[Live Demo](https://temporary-quick-gold-1ly0q79.vercel.app)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/tests-11%20passed-16A34A)
![License](https://img.shields.io/badge/license-MIT-2563EB)

</div>

## Preview

![React OTP verification interface preview](./docs/otp-preview.svg)

## Demo

The demo code is `123456`.

- A correct code runs a sequential success animation and locks the fields.
- An incorrect code displays an error, shakes the row, and clears the digits for another attempt.
- Verification includes a short loading state to demonstrate interaction locking.

> [!IMPORTANT]
> Verification is simulated in the browser for demonstration purposes. There is no authentication backend in this repository.

## Features

- Six accessible digit fields with individual labels
- English (`0-9`), Persian (`۰-۹`), and Arabic (`٠-٩`) input normalization with English-digit display
- Automatic verification after the sixth digit
- Full and partial paste support with safe six-digit truncation
- Backspace navigation from an empty field to the previous digit
- Arrow Left and Arrow Right keyboard navigation
- Numeric mobile keyboard via `inputMode="numeric"`
- SMS code autofill via `autocomplete="one-time-code"`
- Read-only fields during loading and after successful verification
- Clear loading, error, and success feedback
- Responsive RTL interface
- Reduced-motion support through `prefers-reduced-motion`
- Automated interaction coverage for keyboard, paste, and validation flows

## Tech Stack

- React 19
- TypeScript 6
- Tailwind CSS 4
- Vite 8
- Vitest
- Testing Library
- ESLint

## Installation

### Requirements

- Node.js `20.19+` or `22.12+`
- npm

```bash
git clone <your-repository-url>
cd react-otp-verification-ui
npm install
npm run dev
```

Open the local URL printed by Vite.

## Usage

`OtpInput` is a controlled component. The parent owns the current value, validation status, and completion handler.

```tsx
import { useState } from "react";
import OtpInput from "./OtpInput";
import type { OtpStatus } from "./otpUtils";

const [value, setValue] = useState("");
const [status, setStatus] = useState<OtpStatus>("idle");

<OtpInput
  focusKey={0}
  status={status}
  value={value}
  onChange={setValue}
  onComplete={(code) => verifyCode(code)}
/>;
```

Available states are `idle`, `loading`, `error`, and `success`.

## Keyboard and Paste Behavior

- Typing a digit advances focus to the next field.
- Backspace clears the current digit; pressing it on an empty field removes and focuses the previous digit.
- Arrow keys move focus between fields without changing the value.
- Pasting six or more digits fills the entire code and ignores overflow.
- Partial paste fills from the selected position.
- Letters, spaces, and other non-numeric characters are ignored.

## Scripts

```bash
npm run dev        # Start the development server
npm run build      # Type-check and build for production
npm run preview    # Preview the production build
npm run lint       # Run ESLint
npm test           # Run all tests once
npm run test:watch # Run tests in watch mode
```

## Project Structure

```text
src/
├── App.tsx             # Demo verification and loading flow
├── App.test.tsx        # End-to-end component flow tests
├── OtpInput.tsx        # Reusable controlled OTP component
├── OtpInput.test.tsx   # Keyboard, paste, and accessibility tests
├── otpUtils.ts         # Digit normalization and shared OTP types
├── index.css           # Theme and animation keyframes
└── main.tsx            # React entry point
```

## Quality Checks

```bash
npm test
npm run lint
npm run build
npm audit
```

The current project passes all 11 automated tests, ESLint, TypeScript compilation, the production build, and npm audit with zero known vulnerabilities.

## Production Considerations

For a real authentication flow:

- Verify codes on a trusted backend.
- Store neither the valid OTP nor verification logic in the client bundle.
- Expire OTP values after a short period.
- Rate-limit verification attempts on the server.
- Avoid displaying the valid code in the interface.
- Replace the demo delay with a real API request and handle network failures.

## Customization

- Change `CORRECT_OTP` in `src/App.tsx` for demo purposes.
- Change `OTP_LENGTH` in `src/otpUtils.ts` to adjust the number of digits.
- Update state colors in `src/OtpInput.tsx`.
- Update animation timing and motion in `src/index.css`.

## License

Released under the [MIT License](./LICENSE).
