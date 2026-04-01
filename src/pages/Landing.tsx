import { useRef, useEffect, useState, Suspense, lazy } from 'react';
import { ChevronDown } from 'lucide-react';
import Login from './Login';
import Footer from '@/components/layout/Footer';

const SplineBrainScene = lazy(() => import('@/components/SplineBrainScene'));

export default function Landing() {
  const loginRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
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

  const parallaxOffset = scrollY * 0.4;
  const heroOpacity = Math.max(0, 1 - scrollY * 0.002);

  return (
    <div className="scroll-smooth">
      {/* Welcome Section - Full Screen */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background"
      >
        <DottedSurface />

        {/* Hero content with parallax */}
        <div
          className="relative z-10 flex flex-col items-center w-full px-4"
          style={{
            transform: `translateY(-${parallaxOffset}px)`,
            opacity: heroOpacity,
            willChange: 'transform, opacity',
          }}
        >
          {/* Spline 3D Scene */}
          <div
            className={`w-full max-w-[280px] h-[220px] sm:max-w-[360px] sm:h-[280px] md:max-w-[480px] md:h-[380px] lg:max-w-[560px] lg:h-[440px] mb-2 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'
            }`}
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
              }
            >
              <SplineBrainScene />
            </Suspense>
          </div>

          {/* Company Name */}
          <h1
            className={`font-orbitron text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-primary">mind</span>
            <span className="text-foreground">care</span>
            <span className="text-primary">X</span>
          </h1>

          {/* Tagline */}
          <p
            className={`mt-3 font-jakarta text-lg text-muted-foreground sm:text-xl md:text-2xl transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Your Mental Wellness, Our Priority
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToLogin}
          className={`absolute bottom-8 sm:bottom-12 z-10 flex flex-col items-center gap-2 text-muted-foreground transition-all hover:text-primary duration-1000 delay-700 ${
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
