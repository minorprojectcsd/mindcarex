import { useRef, useEffect, useState, Suspense, lazy } from 'react';
import { ChevronDown } from 'lucide-react';
import Login from './Login';
import Footer from '@/components/layout/Footer';

const SplineBrainScene = lazy(() => import('@/components/SplineBrainScene'));

export default function Landing() {
  const loginRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const heroOpacity = Math.max(0, 1 - scrollY * 0.002);

  return (
    <div className="scroll-smooth">
      {/* Hero Section - Full Screen Spline Background */}
      <section className="relative h-screen w-full overflow-hidden" style={{ background: '#0a0a0a' }}>
        {/* Full-screen Spline 3D Scene */}
        <div className="absolute inset-0 w-full h-full">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0a0a' }}>
                <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
            }
          >
            <SplineBrainScene />
          </Suspense>
        </div>

        {/* Text overlay — pointer-events-none so Spline stays interactive */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 sm:pb-28 px-4"
          style={{ opacity: heroOpacity }}
        >
          <h1
            className={`font-orbitron text-3xl font-bold tracking-tight sm:text-5xl md:text-7xl transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-primary drop-shadow-lg">mind</span>
            <span className="text-white drop-shadow-lg">care</span>
            <span className="text-primary drop-shadow-lg">X</span>
          </h1>

          <p
            className={`mt-2 font-jakarta text-base text-white/70 sm:text-xl md:text-2xl transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Your Mental Wellness, Our Priority
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToLogin}
          className={`absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/60 transition-all hover:text-primary duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-xs sm:text-sm font-medium animate-pulse">Scroll to continue</span>
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce" />
        </button>
      </section>

      {/* Login Section */}
      <div ref={loginRef}>
        <Login />
      </div>

      <Footer />
    </div>
  );
}
