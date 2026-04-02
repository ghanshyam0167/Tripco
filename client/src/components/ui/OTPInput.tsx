import { useRef, useState, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const OTPInput = ({ length = 6, value, onChange, disabled }: OTPInputProps) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync external value → internal digits
  useEffect(() => {
    const d = value.split("").slice(0, length);
    while (d.length < length) d.push("");
    setDigits(d);
  }, [value, length]);

  const update = (newDigits: string[]) => {
    setDigits(newDigits);
    onChange(newDigits.join(""));
  };

  const handleChange = (i: number, val: string) => {
    // Allow paste of full OTP
    if (val.length > 1) {
      const cleaned = val.replace(/\D/g, "").slice(0, length).split("");
      while (cleaned.length < length) cleaned.push("");
      update(cleaned);
      inputs.current[Math.min(val.length, length - 1)]?.focus();
      return;
    }
    if (!/^\d?$/.test(val)) return;
    const nd = [...digits];
    nd[i] = val;
    update(nd);
    if (val && i < length - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          style={{
            width: 48,
            height: 56,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 800,
            border: `2px solid ${d ? "var(--violet-500)" : "var(--slate-200)"}`,
            borderRadius: "var(--radius-md)",
            outline: "none",
            background: d ? "rgba(139,92,246,.05)" : "#fff",
            color: "var(--slate-900)",
            transition: "all var(--transition)",
            fontFamily: "monospace",
          }}
        />
      ))}
    </div>
  );
};

export default OTPInput;
