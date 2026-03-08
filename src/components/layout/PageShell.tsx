import Navbar          from './Navbars';
import SceneBackground from './scenebackgrounds';

interface PageShellProps {
  children:      React.ReactNode;
  /** Hide the navbar (e.g. on the intro page). */
  hideNav?:      boolean;
  glowPosition?: string;
  className?:    string;
}

/**
 * PageShell
 * Wraps every page (except the intro) with:
 *   - SceneBackground  (animated BG + emotion glow)
 *   - Navbar           (top nav with emotion badge)
 *   - A scrollable content area
 *
 * Usage:
 *   <PageShell>
 *     <YourPageContent />
 *   </PageShell>
 */
export default function PageShell({
  children,
  hideNav = false,
  glowPosition,
  className = '',
}: PageShellProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Layered background */}
      <SceneBackground glowPosition={glowPosition} />

      {/* Content stack */}
      <div
        className={`relative z-10 flex flex-col w-full h-full ${className}`}
      >
        {!hideNav && <Navbar />}
        {children}
      </div>
    </div>
  );
}