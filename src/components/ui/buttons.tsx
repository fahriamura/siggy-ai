'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

const SIZE_STYLES: Record<Size, string> = {
  sm:  'px-4 py-1.5 text-[0.6rem]',
  md:  'px-6 py-2.5 text-[0.65rem]',
  lg:  'px-10 py-3.5 text-[0.7rem]',
};

const VARIANT_STYLES: Record<Variant, string> = {
  primary: [
    'bg-[var(--vn-accent-dim)] border-[var(--vn-border-bright)]',
    'text-[var(--vn-accent)]',
    'hover:bg-[var(--vn-accent)] hover:text-[var(--vn-bg)] hover:border-[var(--vn-accent)]',
  ].join(' '),
  ghost: [
    'bg-transparent border-[var(--vn-border)]',
    'text-[var(--vn-text-dim)]',
    'hover:bg-[var(--vn-panel-light)] hover:text-[var(--vn-text)] hover:border-[var(--vn-border-bright)]',
  ].join(' '),
  danger: [
    'bg-[rgba(224,74,74,0.1)] border-[rgba(224,74,74,0.4)]',
    'text-[#e04a4a]',
    'hover:bg-[#e04a4a] hover:text-[var(--vn-bg)]',
  ].join(' '),
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          // Base
          'inline-flex items-center justify-center gap-2',
          'font-display font-semibold tracking-[0.2em] uppercase',
          'border transition-all duration-200',
          'active:scale-[0.97]',
          'disabled:opacity-30 disabled:pointer-events-none',
          // Variant
          VARIANT_STYLES[variant],
          // Size
          SIZE_STYLES[size],
          // Width
          fullWidth ? 'w-full' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {loading && (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;