import { useRef, useEffect, lazy, Suspense } from 'react';
import Login from './Login';
import Footer from '@/components/layout/Footer';
import { DottedSurface } from '@/components/ui/dotted-surface';

const SplineBrainScene = lazy(() => import('@/components/SplineBrainScene'));

export default function Landing() {
  const progressRef = useRef(0);
  const splineWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const lastTouchY = useRef(0);
  const rafRef = useRef<number>();

  const update = (delta: number) => {
    progressRef.current = Math.min(Math.max(progressRef.current + delta, 0), 1);
    const p = progressRef.current;

    // Direct DOM manipulation — no React re-render
    if (splineWrapRef.current) {
      const scale = 1 + p * 2.5;
      const opacity = Math.max(1 - (p - 0.7) / 0.3, 0);
      splineWrapRef.current.style.transform = `scale(${scale})`;
      splineWrapRef.current.style.opacity = String(opacity);
    }

    if (titleRef.current) {
      titleRef.current.style.opacity = String(Math.max(1 - p * 3, 0));
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${p * 100}%`;
    }

    if (loginRef.current) {
      const show = p > 0.85;
      loginRef.current.style.opacity = show ? '1' : '0';
      loginRef.current.style.pointerEvents = show ? 'auto' : 'none';
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        update(e.deltaY / 800); // ← was 3000
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const delta = (lastTouchY.current - e.touches[0].clientY) / 300; // ← was 1000
      lastTouchY.current = e.touches[0].clientY;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => update(delta));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative bg-background h-screen w-full overflow-hidden">

      {/* Dots */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <DottedSurface />
      </div>

      {/* Spline — zoom layer */}
      <div
        ref={splineWrapRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="w-full h-full">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full w-full">
              <p className="font-mono text-primary text-sm animate-pulse tracking-widest">
                LOADING NEURAL NETWORK...
              </p>
            </div>
          }>
            <SplineBrainScene />
          </Suspense>
        </div>
      </div>

      {/* Title */}
      <div
        ref={titleRef}
        className="absolute inset-0 flex flex-col items-center justify-end pb-24 pointer-events-none z-10"
      >
        <h1 className="font-orbitron text-5xl md:text-7xl font-bold tracking-tight mb-4">
          <span className="text-primary">mind</span>
          <span className="text-foreground">care</span>
          <span className="text-primary">X</span>
        </h1>
        <p className="font-jakarta text-muted-foreground text-sm md:text-base tracking-widest uppercase">
          Your Mental Wellness, Our Priority
        </p>
        <div className="mt-8 w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1 animate-bounce">
          <div className="w-1 h-2 rounded-full bg-primary" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="w-32 h-0.5 bg-muted rounded-full overflow-hidden">
          <div ref={progressBarRef} className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
        </div>
      </div>

      {/* Login overlay */}
      <div
        ref={loginRef}
        className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm transition-opacity duration-500 overflow-y-auto"
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <div className="gradient-hero flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md animate-slide-up">
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
}