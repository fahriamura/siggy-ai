'use client';
import { InputHTMLAttributes } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label, disabled, ...props }: ToggleProps) {
  return (
    <label
      className="inline-flex items-center gap-3 cursor-pointer select-none"
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {/* Hidden native input for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />

      {/* Track */}
      <div
        className="relative w-10 h-[22px] rounded-full transition-colors duration-300"
        style={{
          background: checked ? 'var(--vn-accent)' : 'var(--vn-border-bright)',
          boxShadow: checked ? '0 0 8px var(--vn-glow)' : 'none',
        }}
      >
        {/* Thumb */}
        <div
          className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300"
          style={{ left: checked ? '22px' : '3px' }}
        />
      </div>

      {label && (
        <span className="font-body text-sm" style={{ color: 'var(--vn-text)' }}>
          {label}
        </span>
      )}
    </label>
  );
}