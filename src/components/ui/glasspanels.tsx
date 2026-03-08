import { HTMLAttributes, forwardRef } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Show corner bracket decorations */
  corners?: boolean;
  /** Glow intensity: 'none' | 'soft' | 'strong' */
  glow?: 'none' | 'soft' | 'strong';
  /** Extra rounded corners */
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}

const GLOW_STYLES = {
  none:   '',
  soft:   'shadow-[0_0_20px_var(--vn-glow),0_0_60px_rgba(0,0,0,.5)]',
  strong: 'shadow-[0_0_30px_var(--vn-glow-strong),0_0_80px_rgba(0,0,0,.6)]',
};

const ROUNDED_STYLES = {
  sm:  'rounded',
  md:  'rounded-lg',
  lg:  'rounded-xl',
  xl:  'rounded-2xl',
};

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ corners = false, glow = 'soft', rounded = 'xl', children, className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'vn-glass relative',
          GLOW_STYLES[glow],
          ROUNDED_STYLES[rounded],
          'transition-shadow duration-700',
          className,
        ].filter(Boolean).join(' ')}
        style={{ overflow: corners ? 'visible' : undefined, ...style }}
        {...props}
      >
        {/* Corner bracket marks */}
        {corners && (
          <>
            {/* Top-left */}
            <div
              className="absolute pointer-events-none opacity-50 transition-opacity duration-300"
              style={{
                top: 8, left: 8,
                width: 14, height: 14,
                borderTop: '1px solid var(--vn-accent)',
                borderLeft: '1px solid var(--vn-accent)',
              }}
            />
            {/* Bottom-right */}
            <div
              className="absolute pointer-events-none opacity-50 transition-opacity duration-300"
              style={{
                bottom: 8, right: 8,
                width: 14, height: 14,
                borderBottom: '1px solid var(--vn-accent)',
                borderRight: '1px solid var(--vn-accent)',
              }}
            />
          </>
        )}
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
export default GlassPanel;