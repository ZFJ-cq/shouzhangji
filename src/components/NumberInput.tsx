'use client';

import { useState, useEffect, useRef } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  inputMode?: 'decimal' | 'numeric';
  placeholder?: string;
}

export default function NumberInput({
  value,
  onChange,
  label,
  inputMode = 'decimal',
  placeholder,
}: NumberInputProps) {
  const [raw, setRaw] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部 value 变化且当前未聚焦输入框时同步显示
  useEffect(() => {
    if (document.activeElement !== inputRef.current && String(value) !== raw) {
      setRaw(String(value));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBlur = () => {
    const parsed = inputMode === 'numeric'
      ? parseInt(raw || '0', 10)
      : parseFloat(raw || '0');
    const n = Number.isFinite(parsed) ? parsed : 0;
    setRaw(String(n));
    if (n !== value) onChange(n);
  };

  return (
    <div>
      {label && (
        <label className="block text-[var(--c-text-body)] font-medium mb-2">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="number"
        inputMode={inputMode}
        value={raw}
        placeholder={placeholder}
        onChange={e => setRaw(e.target.value)}
        onBlur={handleBlur}
        className="w-full px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
      />
    </div>
  );
}
